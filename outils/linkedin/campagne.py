#!/usr/bin/env python3
"""Préparation locale de prospection LinkedIn ; aucun accès réseau ni envoi."""
import argparse
import csv
import json
import os
import re
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit, unquote
from zoneinfo import ZoneInfo

ZONE = ZoneInfo('Africa/Casablanca')
DEFAULT_STORE = Path.home() / 'yallah-linkedin-data' / 'prospects.json'
PROFILE = 'https://www.linkedin.com/in/yallah-services/'
LIMITS = {'invitation': 20, 'message': 25}


def canonical_url(value):
    u = urlsplit(value.strip())
    if u.scheme.lower() != 'https' or (u.hostname or '').lower() not in ('linkedin.com', 'www.linkedin.com') or u.port not in (None, 443) or u.username or u.password:
        raise ValueError('URL : utilisez un profil https://www.linkedin.com/in/...')
    path = unquote(u.path)
    match = re.fullmatch(r'/in/([\w-]+)/?', path, flags=re.UNICODE)
    if not match:
        raise ValueError('URL de profil individuel /in/ invalide')
    return 'https://www.linkedin.com/in/' + match.group(1).lower() + '/'


def text_for(prospect, action):
    name = prospect['first_name']
    if action == 'invitation':
        text = (f'Bonjour {name}, ravi de vous croiser sur le réseau ! Chez Yallah Services, '
                'nous aidons les familles à trouver du personnel pour leur domicile au Maroc. '
                'Au plaisir d’échanger !')
        if len(text) >= 300:
            raise ValueError('Note d’invitation trop longue (300 caractères ou plus)')
        return text
    if action == 'bienvenue':
        intro = ('À distance, trouver une aide adaptée pour ses proches au Maroc peut demander du temps.'
                 if prospect['segment'] == 'mre' else
                 'Concilier activité professionnelle et organisation du foyer peut demander beaucoup de temps.')
        return (f'Bonjour {name},\n\nMerci d’avoir rejoint mon réseau, c’est un plaisir d’échanger avec vous !\n\n'
                f'{intro}\n\nYallah Services aide les familles à rechercher du personnel adapté à leurs besoins : '
                'entretien du domicile, garde d’enfants, aide aux personnes âgées ou chauffeur.\n\n'
                f'Découvrez notre profil : {PROFILE}\n\n'
                'Avez-vous un besoin actuel pour lequel nous pourrions vous aider à trouver un profil ?\n\n'
                'Très chaleureusement,\nL’équipe Yallah Services')
    if action == 'relance':
        return (f'Bonjour {name},\n\nJ’espère que vous et vos proches allez bien. Je me permets un bref suivi '
                'concernant notre aide à la recherche de personnel pour les familles au Maroc.\n\n'
                f'Pour un besoin ponctuel ou régulier, nous sommes à votre écoute : {PROFILE}\n\n'
                'Belle journée !')
    raise ValueError('Action inconnue')


def load(path):
    if not path.exists():
        return {'version': 1, 'prospects': {}}
    data = json.loads(path.read_text(encoding='utf-8'))
    if data.get('version') != 1 or not isinstance(data.get('prospects'), dict):
        raise ValueError('Base invalide ou version non prise en charge')
    return data


def save(path, data):
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    # Remplacement atomique et permissions privées. Un seul opérateur à la fois.
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix='.prospects-', suffix='.tmp')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def import_csv(data, path):
    count, duplicates = 0, 0
    # Import transactionnel : aucune sauvegarde si une ligne est invalide.
    additions = {}
    with open(path, encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        if not {'profile_url', 'first_name', 'segment'} <= set(reader.fieldnames or []):
            raise ValueError('Colonnes requises : profile_url, first_name, segment')
        for line, row in enumerate(reader, 2):
            try:
                url = canonical_url(row['profile_url'])
                name = row['first_name'].strip()
                segment = row['segment'].strip().lower()
                if not name or len(name) > 100 or any(ord(c) < 32 for c in name):
                    raise ValueError('prénom invalide')
                if segment not in ('actif', 'mre'):
                    raise ValueError('segment attendu : actif ou mre')
                prospect = {'first_name': name, 'segment': segment, 'events': []}
                text_for(prospect, 'invitation')
                if url in data['prospects'] or url in additions:
                    duplicates += 1
                    continue
                additions[url] = prospect
                count += 1
            except (ValueError, TypeError, KeyError) as e:
                raise ValueError(f'Ligne {line} : {e}') from e
    data['prospects'].update(additions)
    return count, duplicates


def event_time(p, action):
    for event in p['events']:
        if event['action'] == action:
            return datetime.fromisoformat(event['at'])
    return None


def next_action(p, now):
    if event_time(p, 'reponse') or event_time(p, 'stop'):
        return None
    if not event_time(p, 'invitation'):
        return 'invitation'
    accepted = event_time(p, 'acceptation')
    if not accepted:
        return None
    welcome = event_time(p, 'bienvenue')
    if not welcome:
        return 'bienvenue' if now >= accepted + timedelta(days=1) else None
    if not event_time(p, 'relance') and now >= welcome + timedelta(days=4):
        return 'relance'
    return None


def counts(data, now):
    day = now.astimezone(ZONE).date()
    result = {'invitation': 0, 'message': 0}
    for p in data['prospects'].values():
        for event in p['events']:
            if datetime.fromisoformat(event['at']).astimezone(ZONE).date() == day:
                if event['action'] == 'invitation':
                    result['invitation'] += 1
                elif event['action'] in ('bienvenue', 'relance'):
                    result['message'] += 1
    return result


def plan(data, now):
    used = counts(data, now)
    candidates = []
    for url, p in data['prospects'].items():
        action = next_action(p, now)
        if action:
            candidates.append((url, p, action))
    # Priorité aux conversations existantes ; plafonds partagés entre bienvenue et relance.
    candidates.sort(key=lambda x: ({'relance': 0, 'bienvenue': 1, 'invitation': 2}[x[2]], x[0]))
    result = []
    for url, p, action in candidates:
        category = 'invitation' if action == 'invitation' else 'message'
        if used[category] < LIMITS[category]:
            result.append((url, action, text_for(p, action)))
            used[category] += 1
    return result


def record(data, url, action, now):
    url = canonical_url(url)
    if url not in data['prospects']:
        raise ValueError('Prospect inconnu : importez-le d’abord')
    p = data['prospects'][url]
    if event_time(p, action):
        raise ValueError('Événement déjà enregistré')
    if action == 'acceptation':
        if not event_time(p, 'invitation') or event_time(p, 'stop') or event_time(p, 'reponse'):
            raise ValueError('Acceptation impossible dans cet état')
    elif action in ('reponse', 'stop'):
        if action == 'reponse' and not event_time(p, 'invitation'):
            raise ValueError('Aucune invitation enregistrée')
    else:
        if next_action(p, now) != action:
            raise ValueError('Action non éligible : vérifiez l’état, les délais et les réponses')
        category = 'invitation' if action == 'invitation' else 'message'
        if counts(data, now)[category] >= LIMITS[category]:
            raise ValueError('Quota journalier atteint')
    p['events'].append({'action': action, 'at': now.astimezone(timezone.utc).isoformat()})


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', type=Path, default=DEFAULT_STORE, help='JSON privé local (défaut : ~/yallah-linkedin-data/prospects.json)')
    sub = parser.add_subparsers(dest='cmd', required=True)
    imp = sub.add_parser('importer', help='Importer un CSV de prospects sélectionnés manuellement')
    imp.add_argument('csv', type=Path)
    sub.add_parser('simuler', help='Prévisualiser les actions éligibles, sans modifier la base')
    rec = sub.add_parser('enregistrer', help='Enregistrer une action réellement effectuée ou observée')
    rec.add_argument('action', choices=['invitation', 'acceptation', 'bienvenue', 'relance', 'reponse', 'stop'])
    rec.add_argument('url')
    args = parser.parse_args(argv)
    try:
        data = load(args.base)
        now = datetime.now(timezone.utc)
        if args.cmd == 'importer':
            added, duplicates = import_csv(data, args.csv)
            save(args.base, data)
            print(f'{added} ajouté(s), {duplicates} doublon(s) ignoré(s).')
        elif args.cmd == 'simuler':
            used = counts(data, now)
            actions = plan(data, now)
            print(f'SIMULATION — aucun envoi ni modification. Journée à Casablanca : invitations {used["invitation"]}/20 ; messages {used["message"]}/25.')
            for url, action, text in actions:
                print(f'\n--- {action.upper()} | {url} ---\n{text}')
            print(f'\n{len(actions)} action(s) proposée(s). Vérifiez les réponses et la pertinence avant chaque envoi manuel.')
        else:
            record(data, args.url, args.action, now)
            save(args.base, data)
            print(f'Événement {args.action} enregistré. Aucun envoi effectué.')
    except (ValueError, OSError, json.JSONDecodeError) as e:
        print(f'Erreur : {e}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
