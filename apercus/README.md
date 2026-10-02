# Aperçus — captures d'écran du site

Ce dossier regroupe les images de revue du site, **générées automatiquement** :

| Fichier | Contenu |
|---|---|
| `accueil-ordinateur.png` / `accueil-mobile.png` | Accueil foyers (1200 px et 390 px) |
| `candidature-ordinateur.png` / `candidature-mobile.png` | Fiche de candidature |
| `candidature-arabe-ordinateur.png` | Fiche de candidature en arabe (RTL) |
| `confirmation-ordinateur.png` | Page de confirmation avec numéro de dossier |
| `admin-ordinateur.png` | Espace recruteur (statistiques + dossiers) |

## Régénérer les captures

```bash
npm i -D playwright && npx playwright install chromium
node apercus/generer-apercus.js
```

Le script démarre le serveur de recrutement, prend les captures, vérifie
qu'**aucune page ne déborde horizontalement** (ordinateur et mobile) et
s'arrête. Options utiles :

```bash
node apercus/generer-apercus.js --url http://localhost:3000   # site déjà lancé
node apercus/generer-apercus.js --cle MaCleAdmin              # capturer /admin
node apercus/generer-apercus.js --dossier /tmp/apercus        # autre dossier
```

## Pourquoi les images ne sont pas versionnées

Les captures pèsent plusieurs mégaoctets et se régénèrent en une commande :
elles sont donc exclues du dépôt (voir `.gitignore`). Le script, lui, est
versionné afin que la vérification visuelle reste reproductible par
n'importe qui — y compris le contrôle de débordement horizontal.
