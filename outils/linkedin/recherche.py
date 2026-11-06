#!/usr/bin/env python3
"""Recherche de profils publics indexés, sans accès automatisé à LinkedIn."""
import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler

import campagne

DEFAULT_QUEUE = Path.home() / 'yallah-linkedin-data' / 'decouvertes.json'
ENDPOINT = 'https://api.search.brave.com/res/v1/web/search'
# Requêtes courtes et séparées : les moteurs ne traitent pas toujours les booléens de LinkedIn.
QUERIES = [
    ('actif', 'site:linkedin.com/in/ (directeur OR manager OR ingénieur OR consultant OR médecin OR architecte OR avocat) "Casablanca"'),
    ('actif', 'site:linkedin.com/in/ (directeur OR manager OR ingénieur OR consultant OR médecin OR architecte OR avocat) "Rabat"'),
    ('actif', 'site:linkedin.com/in/ (directeur OR manager OR ingénieur OR consultant OR médecin OR architecte OR avocat) "Marrakech"'),
    ('actif', 'site:linkedin.com/in/ (directeur OR manager OR ingénieur OR consultant OR médecin OR architecte OR avocat) "Tanger"'),
    ('mre', 'site:linkedin.com/in/ ("originaire du Maroc" OR "franco-marocain" OR "marocaine" OR "marocain") ("Paris" OR "Île-de-France")'),
    ('mre', 'site:linkedin.com/in/ ("originaire du Maroc" OR "franco-marocain" OR "marocaine" OR "marocain") "Bruxelles"'),
    ('mre', 'site:linkedin.com/in/ ("originaire du Maroc" OR "franco-marocain" OR "marocaine" OR "marocain") "Montréal"'),
    ('mre', 'site:linkedin.com/in/ ("originaire du Maroc" OR "franco-marocain" OR "marocaine" OR "marocain") ("Dubai" OR "Dubaï")'),
]


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def search(query, key):
    params = urlencode({'q': query, 'count': 20, 'search_lang': 'fr'})
    request = Request(ENDPOINT + '?' + params, headers={'Accept': 'application/json', 'X-Subscription-Token': key})
    try:
        with build_opener(NoRedirect).open(request, timeout=20) as response:
            raw = response.read(2_000_001)
            if len(raw) > 2_000_000:
                raise ValueError('Réponse du moteur trop volumineuse')
            result = json.loads(raw)
    except HTTPError as e:
        raise ValueError(f'API Brave : erreur HTTP {e.code} ; vérifiez le compte, la clé et les quotas.') from None
    except URLError:
        raise ValueError('API Brave inaccessible : vérifiez la connexion et les restrictions réseau.') from None
    if not isinstance(result, dict):
        raise ValueError('Réponse API Brave invalide')
    web = result.get('web')
    if web is None:
        return []
    if not isinstance(web, dict) or not isinstance(web.get('results', []), list):
        raise ValueError('Réponse API Brave invalide')
    return web.get('results', [])


def profile_url(url):
    # Brave peut renvoyer un sous-domaine géographique LinkedIn ; aucun autre hôte accepté.
    if not isinstance(url, str):
        raise ValueError('URL invalide')
    parts = urlsplit(url)
    host = (parts.hostname or '').lower()
    if parts.scheme.lower() != 'https' or parts.username or parts.password or parts.port not in (None, 443):
        raise ValueError('URL invalide')
    if not (host in ('linkedin.com', 'www.linkedin.com') or re.fullmatch(r'[a-z]{2}\.linkedin\.com', host)):
        raise ValueError('Hôte LinkedIn invalide')
    return campagne.canonical_url('https://www.linkedin.com' + parts.path)


def load_queue(path):
    if not path.exists():
        return {'version': 1, 'candidates': {}}
    data = json.loads(path.read_text(encoding='utf-8'))
    if data.get('version') != 1 or not isinstance(data.get('candidates'), dict):
        raise ValueError('Fichier des découvertes invalide')
    return data


def discover(queue, base, fetch, now):
    """Collecte en mémoire ; aucun fichier modifié si une requête échoue."""
    added = 0
    for segment, query in QUERIES:
        for item in fetch(query):
            if not isinstance(item, dict):
                continue
            try:
                url = profile_url(item.get('url'))
            except (TypeError, ValueError):
                continue
            if url == campagne.PROFILE or url in base['prospects'] or url in queue['candidates']:
                continue
            title = item.get('title', '')
            if not isinstance(title, str):
                title = ''
            # Ne pas stocker les extraits de profil ou déduire un prénom / statut MRE.
            title = ' '.join(title.split())[:200]
            queue['candidates'][url] = {'titre': title, 'segment_recherche': segment,
                                         'decouvert_le': now.astimezone(timezone.utc).isoformat(), 'statut': 'a_verifier'}
            added += 1
    return added


def approve(queue, base, url, name, segment):
    url = profile_url(url)
    if url not in queue['candidates']:
        raise ValueError('Profil absent des découvertes')
    if queue['candidates'][url]['statut'] != 'a_verifier':
        raise ValueError('Profil déjà traité')
    if url in base['prospects']:
        raise ValueError('Profil déjà présent dans la base')
    name = name.strip()
    if not name or len(name) > 100 or any(ord(c) < 32 for c in name):
        raise ValueError('Prénom invalide')
    if segment not in ('actif', 'mre'):
        raise ValueError('Segment invalide')
    p = {'first_name': name, 'segment': segment, 'events': []}
    campagne.text_for(p, 'invitation')
    base['prospects'][url] = p
    queue['candidates'][url]['statut'] = 'valide'


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--file', type=Path, default=DEFAULT_QUEUE, help='Fichier JSON privé de découvertes')
    parser.add_argument('--base', type=Path, default=campagne.DEFAULT_STORE, help='Base privée de campagne')
    subs = parser.add_subparsers(dest='cmd', required=True)
    run = subs.add_parser('chercher', help='Simuler la recherche ou l’exécuter explicitement')
    run.add_argument('--executer', action='store_true', help='Interroger Brave et enregistrer les résultats (potentiellement payant)')
    subs.add_parser('lister', help='Lister les profils à vérifier')
    val = subs.add_parser('valider', help='Valider un profil pour la campagne')
    val.add_argument('url')
    val.add_argument('--prenom', required=True)
    val.add_argument('--segment', choices=['actif', 'mre'], required=True)
    rej = subs.add_parser('ecarter', help='Écarter définitivement un profil')
    rej.add_argument('url')
    args = parser.parse_args(argv)
    try:
        if args.cmd == 'chercher' and not args.executer:
            print('SIMULATION — aucune requête, aucune modification. 8 recherches prévues :')
            for segment, query in QUERIES:
                print(f'[{segment}] {query}')
            return 0
        if args.file.resolve() == args.base.resolve():
            raise ValueError('La file de découvertes et la base de campagne doivent être distinctes')
        queue = load_queue(args.file)
        base = campagne.load(args.base)
        if args.cmd == 'chercher':
            key = os.environ.get('BRAVE_SEARCH_API_KEY', '').strip()
            if not key:
                raise ValueError('Variable BRAVE_SEARCH_API_KEY absente. Aucun appel effectué.')
            n = discover(queue, base, lambda q: search(q, key), datetime.now(timezone.utc))
            campagne.save(args.file, queue)
            print(f'{n} profil(s) ajouté(s) aux découvertes à vérifier. Aucun message envoyé.')
        elif args.cmd == 'lister':
            candidates = [(url, p) for url, p in queue['candidates'].items() if p['statut'] == 'a_verifier' and url not in base['prospects']]
            for url, p in candidates:
                print(f'{url} | recherche {p["segment_recherche"]} (à confirmer) | {p["titre"]}')
            print(f'{len(candidates)} profil(s) à vérifier.')
        elif args.cmd == 'valider':
            approve(queue, base, args.url, args.prenom, args.segment)
            # Base d'abord : après une interruption, le dédoublonnage reste sûr.
            campagne.save(args.base, base)
            campagne.save(args.file, queue)
            print('Profil ajouté à la campagne ; aucune invitation envoyée.')
        elif args.cmd == 'ecarter':
            url = profile_url(args.url)
            if url not in queue['candidates'] or queue['candidates'][url]['statut'] != 'a_verifier':
                raise ValueError('Profil absent ou déjà traité')
            queue['candidates'][url]['statut'] = 'ecarte'
            campagne.save(args.file, queue)
            print('Profil écarté ; il ne sera plus reproposé avec cette URL.')
    except (ValueError, OSError, TypeError, json.JSONDecodeError) as e:
        print(f'Erreur : {e}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
