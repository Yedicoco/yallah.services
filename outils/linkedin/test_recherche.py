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

    def test_reject_same_file(self):
        with tempfile.TemporaryDirectory() as d, contextlib.redirect_stderr(io.StringIO()):
            path = str(Path(d) / 'same.json')
            self.assertEqual(r.main(['--file', path, '--base', path, 'lister']), 1)


if __name__ == '__main__':
    unittest.main()
