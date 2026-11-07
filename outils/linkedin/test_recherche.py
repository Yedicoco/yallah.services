import contextlib
import io
import json
import os
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

import recherche as r
import campagne as c

NOW = datetime(2026, 11, 6, tzinfo=timezone.utc)


class RechercheTests(unittest.TestCase):
    def test_profile_validation(self):
        self.assertEqual(r.profile_url('https://fr.linkedin.com/in/Test-123?trk=abc'), 'https://www.linkedin.com/in/test-123/')
        for url in ['http://linkedin.com/in/a', 'https://linkedin.com.evil.test/in/a',
                    'https://foo.linkedin.com/in/a', 'https://fr.linkedin.com/company/a',
                    'https://u@fr.linkedin.com/in/a', 'https://fr.linkedin.com:8443/in/a']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                r.profile_url(url)

    def test_discovery_dedup_and_no_personal_details(self):
        queue = {'version': 1, 'candidates': {}}
        base = {'version': 1, 'prospects': {'https://www.linkedin.com/in/deja/': {}}}
        results = [{'url': 'https://fr.linkedin.com/in/Amal?trk=x', 'title': 'Amal - architecte', 'description': 'donnée non stockée'},
                   {'url': 'https://linkedin.com/in/amal/', 'title': 'autre résultat'},
                   {'url': 'https://linkedin.com/in/deja/'}, {'url': c.PROFILE},
                   {'url': 'https://linkedin.com/company/test'}, {'url': None}, None]
        self.assertEqual(r.discover(queue, base, lambda q: results, NOW), 1)
        p = queue['candidates']['https://www.linkedin.com/in/amal/']
        self.assertEqual(p['statut'], 'a_verifier')
        self.assertNotIn('description', p)
        self.assertNotIn('first_name', p)
        self.assertEqual(r.discover(queue, base, lambda q: results, NOW), 0)

    def test_review_required_and_rejection(self):
        url = 'https://www.linkedin.com/in/test/'
        queue = {'version': 1, 'candidates': {url: {'statut': 'a_verifier'}}}
        base = {'version': 1, 'prospects': {}}
        r.approve(queue, base, url, 'Amal', 'actif')
        self.assertEqual(base['prospects'][url]['events'], [])
        self.assertEqual(queue['candidates'][url]['statut'], 'valide')
        with self.assertRaises(ValueError):
            r.approve(queue, base, url, 'Amal', 'actif')
        queue['candidates'][url]['statut'] = 'ecarte'
        with self.assertRaises(ValueError):
            r.approve(queue, {'prospects': {}}, url, 'Amal', 'actif')

    def test_dry_run_never_calls_search_or_saves(self):
        with tempfile.TemporaryDirectory() as d, patch.object(r, 'search', side_effect=AssertionError('network')):
            file = Path(d) / 'queue.json'
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(r.main(['--file', str(file), 'chercher']), 0)
            self.assertFalse(file.exists())

    def test_search_failure_does_not_write_partial_results(self):
        with tempfile.TemporaryDirectory() as d:
            file = Path(d) / 'queue.json'
            base = Path(d) / 'base.json'
            with patch.dict(os.environ, {'BRAVE_SEARCH_API_KEY': 'test'}), \
                 patch.object(r, 'search', side_effect=[[{'url': 'https://linkedin.com/in/personne'}], ValueError('erreur')]), \
                 contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(r.main(['--file', str(file), '--base', str(base), 'chercher', '--executer']), 1)
            self.assertFalse(file.exists())

    def test_execute_list_approve_and_campaign_simulation(self):
        with tempfile.TemporaryDirectory() as d:
            queue, base = Path(d) / 'queue.json', Path(d) / 'base.json'
            args = ['--file', str(queue), '--base', str(base)]
            with patch.dict(os.environ, {'BRAVE_SEARCH_API_KEY': 'test'}), \
                 patch.object(r, 'search', return_value=[{'url': 'https://fr.linkedin.com/in/exemple', 'title': 'Exemple'}]), \
                 contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(r.main(args + ['chercher', '--executer']), 0)
                self.assertEqual(r.main(args + ['valider', 'https://www.linkedin.com/in/exemple/', '--prenom', 'Amal', '--segment', 'actif']), 0)
            self.assertEqual(len(c.plan(c.load(base), NOW)), 1)
            self.assertEqual(json.loads(queue.read_text())['candidates']['https://www.linkedin.com/in/exemple/']['statut'], 'valide')

    def test_provider_request_and_response_formats(self):
        examples = {
            'brave': {'web': {'results': [{'url': 'https://linkedin.com/in/x', 'title': 'X'}]}},
            'tavily': {'results': [{'url': 'https://linkedin.com/in/x', 'title': 'X'}]},
            'firecrawl': {'success': True, 'data': {'web': [{'url': 'https://linkedin.com/in/x', 'title': 'X'}]}},
            'exa': {'results': [{'url': 'https://linkedin.com/in/x', 'title': 'X'}]},
            'serper': {'organic': [{'link': 'https://linkedin.com/in/x', 'title': 'X'}]},
            'serpapi': {'organic_results': [{'link': 'https://linkedin.com/in/x', 'title': 'X'}]},
        }
        for provider, response in examples.items():
            with self.subTest(provider=provider):
                request = r.make_request(provider, 'test casablanca', 'secret')
                self.assertTrue(request.full_url.startswith('https://'))
                self.assertEqual(r.parse_results(provider, response)[0]['url'], 'https://linkedin.com/in/x')
                with self.assertRaises(ValueError):
                    r.parse_results(provider, {'error': 'invalid'})
        self.assertEqual(r.make_request('tavily', 'x', '').get_header('X-tavily-access-mode'), 'keyless')
        self.assertEqual(r.make_request('tavily', 'x', 'key').get_header('Authorization'), 'Bearer key')
        self.assertIsNone(r.make_request('firecrawl', 'x', '').get_header('Authorization'))
        self.assertEqual(json.loads(r.make_request('tavily', 'x', '').data)['search_depth'], 'basic')
        self.assertEqual(json.loads(r.make_request('firecrawl', 'x', '').data)['sources'], ['web'])
        self.assertNotIn('scrapeOptions', json.loads(r.make_request('firecrawl', 'x', '').data))
        self.assertEqual(r.parse_results('brave', {}), [])
        with self.assertRaises(ValueError):
            r.parse_results('firecrawl', {'success': True, 'data': []})

    def test_multiple_keyless_providers_and_request_budget(self):
        with tempfile.TemporaryDirectory() as d:
            args = ['--file', str(Path(d) / 'queue'), '--base', str(Path(d) / 'base')]
            seen = []
            def fake_search(query, key, provider):
                seen.append((query, key, provider))
                return [{'url': 'https://fr.linkedin.com/in/exemple', 'title': 'Exemple'}]
            with patch.dict(os.environ, {'TAVILY_API_KEY': 'paid-secret', 'FIRECRAWL_API_KEY': 'paid-secret'}), \
                 patch.object(r, 'search', side_effect=fake_search), contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(r.main(args + ['chercher', '--moteur', 'tavily', '--moteur', 'firecrawl', '--limite', '2', '--executer']), 0)
            self.assertEqual([p for _, _, p in seen], ['tavily', 'tavily', 'firecrawl', 'firecrawl'])
            self.assertTrue(all(key == '' for _, key, _ in seen))
            queue = r.load_queue(Path(d) / 'queue')
            self.assertEqual(len(queue['candidates']), 1)
            self.assertEqual(queue['candidates']['https://www.linkedin.com/in/exemple/']['moteur'], 'tavily')

    def test_missing_key_preflight_before_any_network_call(self):
        with tempfile.TemporaryDirectory() as d, \
             patch.dict(os.environ, {}, clear=True), patch.object(r, 'search') as search, \
             contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            args = ['--file', str(Path(d) / 'queue'), '--base', str(Path(d) / 'base')]
            self.assertEqual(r.main(args + ['chercher', '--moteur', 'tavily', '--moteur', 'serper', '--executer']), 1)
            search.assert_not_called()

    def test_explicit_keyed_mode(self):
        with tempfile.TemporaryDirectory() as d, patch.dict(os.environ, {'TAVILY_API_KEY': 'secret'}), \
             patch.object(r, 'search', return_value=[]) as search, contextlib.redirect_stdout(io.StringIO()):
            args = ['--file', str(Path(d) / 'queue'), '--base', str(Path(d) / 'base')]
            self.assertEqual(r.main(args + ['chercher', '--avec-cle', '--limite', '1', '--executer']), 0)
            self.assertEqual(search.call_args.args[1:], ('secret', 'tavily'))

    def test_reject_same_file(self):
        with tempfile.TemporaryDirectory() as d, contextlib.redirect_stderr(io.StringIO()):
            path = str(Path(d) / 'same.json')
            self.assertEqual(r.main(['--file', path, '--base', path, 'lister']), 1)


if __name__ == '__main__':
    unittest.main()
