import contextlib
import csv
import io
import json
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

import campagne as c

NOW = datetime(2026, 11, 6, 12, tzinfo=timezone.utc)


def prospect(name='Amal', segment='actif'):
    return {'first_name': name, 'segment': segment, 'events': []}


def event(p, action, at):
    p['events'].append({'action': action, 'at': at.isoformat()})


class CampaignTests(unittest.TestCase):
    def setUp(self):
        self.url = 'https://www.linkedin.com/in/amal-test/'
        self.p = prospect()
        self.data = {'version': 1, 'prospects': {self.url: self.p}}

    def test_url_normalization_and_invalid(self):
        self.assertEqual(c.canonical_url('https://linkedin.com/in/Amal-Test/?trk=abc'), self.url)
        for url in ('http://linkedin.com/in/x', 'https://linkedin.com.evil.test/in/x',
                    'https://www.linkedin.com/company/x', 'https://u@linkedin.com/in/x',
                    'https://linkedin.com/in/a%2Fb'):
            with self.assertRaises(ValueError):
                c.canonical_url(url)

    def test_schedule_and_no_double_contact(self):
        c.record(self.data, self.url, 'invitation', NOW)
        self.assertIsNone(c.next_action(self.p, NOW))
        with self.assertRaises(ValueError):
            c.record(self.data, self.url, 'invitation', NOW)
        c.record(self.data, self.url, 'acceptation', NOW)
        self.assertIsNone(c.next_action(self.p, NOW + timedelta(hours=23)))
        self.assertEqual(c.next_action(self.p, NOW + timedelta(days=1)), 'bienvenue')
        c.record(self.data, self.url, 'bienvenue', NOW + timedelta(days=1))
        self.assertIsNone(c.next_action(self.p, NOW + timedelta(days=4, hours=23)))
        self.assertEqual(c.next_action(self.p, NOW + timedelta(days=5)), 'relance')
        c.record(self.data, self.url, 'relance', NOW + timedelta(days=5))
        self.assertIsNone(c.next_action(self.p, NOW + timedelta(days=10)))

    def test_reply_or_opt_out_stops_all(self):
        c.record(self.data, self.url, 'invitation', NOW)
        c.record(self.data, self.url, 'reponse', NOW)
        self.assertIsNone(c.next_action(self.p, NOW + timedelta(days=9)))
        with self.assertRaises(ValueError):
            c.record(self.data, self.url, 'acceptation', NOW)
        p = prospect()
        data = {'version': 1, 'prospects': {self.url: p}}
        c.record(data, self.url, 'stop', NOW)
        self.assertIsNone(c.next_action(p, NOW))

    def test_limits_and_timezone(self):
        prospects = {}
        for i in range(50):
            p = prospect()
            if i < 20:
                event(p, 'invitation', NOW)
            prospects[f'https://www.linkedin.com/in/test-{i}/'] = p
        data = {'version': 1, 'prospects': prospects}
        self.assertEqual(c.counts(data, NOW)['invitation'], 20)
        self.assertEqual(c.plan(data, NOW), [])
        with self.assertRaises(ValueError):
            c.record(data, 'https://www.linkedin.com/in/test-21/', 'invitation', NOW)
        self.assertEqual(c.counts(data, NOW + timedelta(days=1))['invitation'], 0)
        # UTC 23:30 and the following UTC day are the same Casablanca day in November.
        p = prospect()
        event(p, 'invitation', datetime(2026, 11, 6, 23, 30, tzinfo=timezone.utc))
        self.assertEqual(c.counts({'prospects': {'x': p}}, datetime(2026, 11, 7, 0, 30, tzinfo=timezone.utc))['invitation'], 1)

    def test_shared_message_limit(self):
        prospects = {}
        for i in range(27):
            p = prospect()
            event(p, 'invitation', NOW - timedelta(days=8))
            event(p, 'acceptation', NOW - timedelta(days=7))
            if i < 24:
                event(p, 'bienvenue', NOW)
            prospects[f'https://www.linkedin.com/in/person-{i}/'] = p
        data = {'version': 1, 'prospects': prospects}
        self.assertEqual(len(c.plan(data, NOW)), 1)
        c.record(data, 'https://www.linkedin.com/in/person-24/', 'bienvenue', NOW)
        with self.assertRaises(ValueError):
            c.record(data, 'https://www.linkedin.com/in/person-25/', 'bienvenue', NOW)

    def test_import_transaction_duplicate_and_simulation_readonly(self):
        with tempfile.TemporaryDirectory() as d:
            file = Path(d) / 'p.csv'
            file.write_text('profile_url,first_name,segment\nhttps://linkedin.com/in/AMAL-TEST,Amal,actif\nhttps://linkedin.com/in/amal-test/?trk=x,Amal,actif\n', encoding='utf-8')
            data = {'version': 1, 'prospects': {}}
            self.assertEqual(c.import_csv(data, file), (1, 1))
            file.write_text('profile_url,first_name,segment\nhttps://linkedin.com/in/new,A,mre\nhttps://bad/in/x,B,actif\n', encoding='utf-8')
            with self.assertRaises(ValueError):
                c.import_csv(data, file)
            self.assertEqual(len(data['prospects']), 1)
            base = Path(d) / 'db.json'
            c.save(base, data)
            before = base.read_bytes()
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(c.main(['--base', str(base), 'simuler']), 0)
            self.assertEqual(base.read_bytes(), before)
            self.assertLess(len(c.text_for(prospect('x' * 100), 'invitation')), 300)


if __name__ == '__main__':
    unittest.main()
