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
PROVIDERS = {
    'tavily': {'key_env': 'TAVILY_API_KEY', 'keyless': True},
    'firecrawl': {'key_env': 'FIRECRAWL_API_KEY', 'keyless': True},
    'serper': {'key_env': 'SERPER_API_KEY', 'keyless': False},
    'serpapi': {'key_env': 'SERPAPI_API_KEY', 'keyless': False},
    'exa': {'key_env': 'EXA_API_KEY', 'keyless': False},
    'brave': {'key_env': 'BRAVE_SEARCH_API_KEY', 'keyless': False},
}

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


def make_request(provider, query, key):
    headers = {'Accept': 'application/json'}
    body = None
    if provider == 'brave':
        url = 'https://api.search.brave.com/res/v1/web/search?' + urlencode({'q': query, 'count': 20, 'search_lang': 'fr'})
        headers['X-Subscription-Token'] = key
    elif provider == 'serpapi':
        # L'API officielle exige api_key dans l'URL : ne jamais journaliser les requêtes.
        url = 'https://serpapi.com/search.json?' + urlencode({'engine': 'google', 'q': query, 'num': 10, 'api_key': key})
    else:
        headers['Content-Type'] = 'application/json'
        if provider == 'tavily':
            url = 'https://api.tavily.com/search'
            headers.update({'Authorization': 'Bearer ' + key} if key else {'X-Tavily-Access-Mode': 'keyless'})
            body = {'query': query, 'search_depth': 'basic', 'auto_parameters': False, 'max_results': 10, 'include_raw_content': False}
        elif provider == 'firecrawl':
            url = 'https://api.firecrawl.dev/v2/search'
            if key:
                headers['Authorization'] = 'Bearer ' + key
            body = {'query': query, 'limit': 10, 'sources': ['web']}
        elif provider == 'serper':
            url = 'https://google.serper.dev/search'
            headers['X-API-KEY'] = key
            body = {'q': query, 'hl': 'fr', 'num': 10}
        elif provider == 'exa':
            url = 'https://api.exa.ai/search'
            headers['x-api-key'] = key
            body = {'query': query, 'numResults': 10, 'type': 'auto', 'includeDomains': ['linkedin.com']}
        else:
            raise ValueError('Moteur non pris en charge')
    return Request(url, data=None if body is None else json.dumps(body).encode('utf-8'), headers=headers)


def parse_results(provider, result):
    if not isinstance(result, dict) or result.get('error') or result.get('success') is False:
        raise ValueError(f'API {provider} : réponse invalide ou erreur fournisseur')
    if provider == 'brave':
        web = result.get('web')
        if web is None:
            return []
        if not isinstance(web, dict):
            raise ValueError('API brave : réponse invalide')
        items = web.get('results', [])
    elif provider == 'firecrawl':
        data = result.get('data')
        if not isinstance(data, dict):
            raise ValueError('API firecrawl : réponse invalide')
        items = data.get('web', [])
    elif provider in ('serper', 'serpapi'):
        items = result.get('organic', []) if provider == 'serper' else result.get('organic_results', [])
    else:
        items = result.get('results', [])
    if not isinstance(items, list):
        raise ValueError(f'API {provider} : liste de résultats invalide')
    if provider in ('serper', 'serpapi'):
        return [{'url': item.get('link'), 'title': item.get('title', '')} for item in items if isinstance(item, dict)]
    return items


def search(query, key, provider='brave'):
    request = make_request(provider, query, key)
    try:
        with build_opener(NoRedirect).open(request, timeout=30) as response:
            raw = response.read(2_000_001)
            if len(raw) > 2_000_000:
                raise ValueError('Réponse du moteur trop volumineuse')
            result = json.loads(raw)
    except HTTPError as e:
        raise ValueError(f'API {provider} : erreur HTTP {e.code} ; vérifiez le compte, la clé et les quotas.') from None
    except (URLError, TimeoutError):
        raise ValueError(f'API {provider} inaccessible : vérifiez la connexion et les restrictions réseau.') from None
    except (ValueError, UnicodeDecodeError):
        raise ValueError(f'API {provider} : réponse illisible ou trop volumineuse') from None
    return parse_results(provider, result)


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


def discover(queue, base, fetch, now, queries=QUERIES, provider=None):
    """Collecte en mémoire ; aucun fichier modifié si une requête échoue."""
    added = 0
    for segment, query in queries:
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
            if provider:
                queue['candidates'][url]['moteur'] = provider
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
    run.add_argument('--executer', action='store_true', help='Effectuer les requêtes et enregistrer les résultats')
    run.add_argument('--moteur', action='append', choices=list(PROVIDERS), help='Répéter pour utiliser plusieurs moteurs ; défaut : tavily sans clé')
    run.add_argument('--avec-cle', action='store_true', help='Utiliser aussi les clés Tavily/Firecrawl si configurées (facturation possible)')
    run.add_argument('--limite', type=int, default=8, choices=range(1, 9), metavar='1..8', help='Nombre maximal de requêtes par moteur (défaut 8)')
    run.add_argument('--segment', choices=['tous', 'actif', 'mre'], default='tous', help='Limiter la recherche à une cible')
    subs.add_parser('lister', help='Lister les profils à vérifier')
    val = subs.add_parser('valider', help='Valider un profil pour la campagne')
    val.add_argument('url')
    val.add_argument('--prenom', required=True)
    val.add_argument('--segment', choices=['actif', 'mre'], required=True)
    rej = subs.add_parser('ecarter', help='Écarter définitivement un profil')
    rej.add_argument('url')
    args = parser.parse_args(argv)
    try:
        if args.cmd == 'chercher':
            providers = list(dict.fromkeys(args.moteur or ['tavily']))
            queries = [(segment, query) for segment, query in QUERIES if args.segment in ('tous', segment)][:args.limite]
            if not args.executer:
                print(f'SIMULATION — aucune requête ni modification. Moteurs : {", ".join(providers)} ; maximum {len(queries) * len(providers)} appels.')
                for segment, query in queries:
                    print(f'[{segment}] {query}')
                print('Tavily et Firecrawl sans clé par défaut ; --avec-cle active leurs clés. Vérifiez les tarifs des moteurs.')
                return 0
        if args.file.resolve() == args.base.resolve():
            raise ValueError('La file de découvertes et la base de campagne doivent être distinctes')
        queue = load_queue(args.file)
        base = campagne.load(args.base)
        if args.cmd == 'chercher':
            keys = {}
            for provider in providers:
                conf = PROVIDERS[provider]
                key = os.environ.get(conf['key_env'], '').strip()
                if not conf['keyless'] or args.avec_cle:
                    if not key:
                        raise ValueError(f"Variable {conf['key_env']} absente pour {provider}. Aucun appel effectué.")
                    keys[provider] = key
                else:
                    keys[provider] = ''  # Jamais de bascule silencieuse sur un compte facturable.
            print(f'Recherche : {len(queries) * len(providers)} appels au maximum ; vérifiez les quotas des fournisseurs.', flush=True)
            now = datetime.now(timezone.utc)
            n = 0
            for provider in providers:
                n += discover(queue, base, lambda q: search(q, keys[provider], provider), now, queries, provider)
            campagne.save(args.file, queue)
            print(f'{n} profil(s) ajouté(s) aux découvertes à vérifier. Aucun message envoyé.')
        elif args.cmd == 'lister':
            candidates = [(url, p) for url, p in queue['candidates'].items() if p['statut'] == 'a_verifier' and url not in base['prospects']]
            for url, p in candidates:
                print(f'{url} | recherche {p["segment_recherche"]} (à confirmer) | {p["titre"]} | moteur {p.get("moteur", "non enregistré")}')
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
