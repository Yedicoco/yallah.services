# YALLAH SERVICES — Aides à domicile au Maroc

Site de **Yallah Services** : recherche et mise en relation de personnel pour les **particuliers**
et les **entreprises** au Maroc. Base : Casablanca (Hay Hassani, 20220), 2 ans d'activité.

> 📄 **Document de référence obligatoire : [`contenu/fiche-entreprise.md`](contenu/fiche-entreprise.md)**
> (positionnement, services B2C et B2B, villes confirmées, ton, et la liste de ce qu'il est
> **interdit d'inventer**). En cas de contradiction avec un autre fichier, c'est cette fiche qui prime.

Le site répond à **trois publics**, avec trois parcours distincts :

| Public | Parcours | Page | WhatsApp |
|---|---|---|---|
| 🏠 **Particuliers** (clients) | Services, packs, tarifs, réservation | `index.html` | **+212 691 733 585** |
| 🏢 **Entreprises** (B2B) | Personnel pour hôtels, riads, restauration, chantiers, événements | *à créer — voir le plan* | **+212 691 733 585** |
| 🧑‍🍳 **Candidats** (personnel) | Fiche de candidature → numéro de dossier → références | `candidature.html` | **+212 710 359 446** |

> ⚠️ **Règle commerciale** — l'accueil conserve sa mention « **Demandes d'emploi non acceptées** —
> Ce site est réservé aux particuliers et aux entreprises qui recrutent », complétée par une orientation claire :
> *« Vous cherchez un emploi ? Envoyez vos références à **servicesyallah@gmail.com** ou écrivez-nous sur
> **WhatsApp +212 710 359 446** → Espace candidats »*. Les quatre variantes de cette mention (dont la
> version stricte d'origine) sont dans **`modeles-messages.md`**.

## Vidéos particuliers et entreprises

Les quatre MP4 d'origine, leur provenance, les vignettes extraites et les contrôles
sont documentés dans [`contenu/videos.md`](contenu/videos.md).
Contrôle rapide : `node outils/verifier-videos.js`.

## 📞 Contacts officiels

| Canal | Coordonnées |
|---|---|
| **WhatsApp foyers** (clients) | **+212 691 733 585** → [wa.me/212691733585](https://wa.me/212691733585) |
| **WhatsApp candidats** (personnel) | **+212 710 359 446** → [wa.me/212710359446](https://wa.me/212710359446) |
| **E-mail** (références, dossiers) | **servicesyallah@gmail.com** |
| Villes | Casablanca · Bouskoura · Dar Bouazza · Bouznika · Rabat · Marrakech · Tanger · Agadir · Fès · Kénitra · Mohammedia · Témara · Salé |

> Les liens WhatsApp et l'e-mail sont centralisés dans **`assets/js/config.js`** (site statique) et par
> variables d'environnement `WHATSAPP_FOYERS`, `WHATSAPP_CANDIDATS`, `CONTACT_EMAIL` (version serveur).
> `index.html` conserve toutefois ses liens en dur pour les foyers : `build-site.js` les met à jour
> automatiquement si vous changez les variables et régénérez.

## 🗂️ Structure du dépôt

```
.
├── index.html                        # Accueil foyers (page unique, toutes les sections)
├── candidature.html                  # Fiche de candidature bilingue FR/AR (5 blocs + références)
├── candidature-confirmation.html     # Numéro de dossier + WhatsApp + e-mail des références
├── admin.html                        # Espace recruteur (version serveur, protégé par ADMIN_KEY)
├── server.js                         # Serveur Node sans aucune dépendance (site + API + admin)
├── build-site.js                     # Génère le site statique prêt à publier
├── generer-images-logo.py            # Produit les 12 déclinaisons du logo (Pillow)
├── outils/verifier-site.js           # Vérifications avant mise en ligne (liens, ids, images…, langues)
├── outils/extraire-i18n.js           # Liste les chaînes à traduire + contrôle la couverture
├── outils/reindexer-i18n.js          # Replace les traductions après une modification du HTML
├── outils/generer-i18n.js            # Compile contenu/i18n/traductions/*.json → assets/i18n/
├── outils/tester-i18n.js             # Teste les 4 affichages dans un DOM headless (jsdom)
├── outils/verifier-contenu.js        # Contrôle du contenu SEO local (volume, recopie, balisage, maillage)
├── outils/generer-pages-villes.js    # Assemble les pages service × zone depuis contenu/pages/*.json
├── outils/generer-sitemap.js         # Sitemap automatique (lastmod = git) + synchronisation de robots.txt
├── outils/appliquer-fiche-entreprise.py # Application tracée des règles de la fiche entreprise
├── services-par-ville.html           # Hub : tous les services, ville par ville
├── personnel-entreprises.html        # Hub B2B : hôtels, riads, chantiers, nettoyage, événements
├── <service>-<ville>.html            # Pages locales générées (6 pages Casablanca en ligne)
├── contenu/                          # Fiches de référence et contenu par page
│   ├── fiche-entreprise.md           # ★ Référence obligatoire de tout contenu publié
│   ├── audit-promesses-site.md       # Conformité des affirmations du site
│   ├── fiche-locale-casablanca.md    # Questions terrain par ville (30 min par ville)
│   ├── valider-avis.md · recueillir-avis.md
│   ├── sources-editoriales.md        # Traçabilité de chaque fait publié
│   ├── pages/*.json                  # Contenu rédigé, page par page
│   └── i18n/                         # Multilingue : cles.json + traductions/<page>.<langue>.json
├── plan-seo-local.md                 # Plan SEO local : état, matrice, GBP, citations, mesure
├── apercus/generer-apercus.js        # Captures d'écran (Playwright) + contrôle de débordement
├── assets/
│   ├── css/style.css                 # Thème or/noir + grille + navy + vert WhatsApp
│   ├── css/brand.css                 # Déclinaison « affiche » (bleu nuit, or satiné, vert profond)
│   ├── css/recrutement.css           # Charte des pages candidat et de l'espace recruteur
│   ├── css/i18n.css                  # Sélecteur de langue + corrections arabe (droite/gauche)
│   ├── js/i18n.js                    # Moteur multilingue (fr · darija arabe · darija latine · en)
│   ├── i18n/<langue>/<page>.js       # Dictionnaires publiés (générés, ne pas éditer à la main)
│   ├── js/config.js                  # Coordonnées centralisées (foyers, candidats, e-mail)
│   ├── js/app.js                     # Interactions de l'accueil foyers (onglets, FAQ, facture…)
│   ├── js/fiche.js                   # Moteur bilingue FR/AR + messages WhatsApp/e-mail
│   ├── js/candidature.js             # Formulaire : validation, envoi, numéro de dossier
│   ├── js/candidature-confirmation.js# Page de confirmation (récapitulatif, liens préparés)
│   ├── js/admin.js                   # Espace recruteur (statistiques, recherche, export, suppression)
│   ├── logo-source.png               # Logo officiel d'origine (source des déclinaisons)
│   └── img/                          # Logos, favicons, visuels des services, avatars…
├── site-a-mettre-en-ligne/           # ★ Version statique générée, prête à déposer chez l'hébergeur
├── modeles-messages.md               # Textes FR/AR : mention, réponses WhatsApp, e-mails
├── plan-placement-du-formulaire.html # Plan de placement + maquettes (page de revue)
├── apercus/                          # Captures d'écran (générées) + mode d'emploi
├── data/                             # Base des candidatures (version serveur) — JAMAIS versionnée
├── netlify.toml · robots.txt · sitemap.xml
└── README.md
```

---

## 🚀 Les deux versions du site

### 1. Version statique — `site-a-mettre-en-ligne/` (aucune installation)

```bash
node build-site.js           # régénère le dossier
# puis déposez son contenu chez n'importe quel hébergeur (FTP, Netlify, OVH…)
```

- Contient : toutes les pages publiques (`index.html`, `candidature.html`, `candidature-confirmation.html`,
  pages « service × ville »…), `assets/`, `sitemap.xml` (régénéré à chaque build), `robots.txt`, `LISEZ-MOI.txt`.
- Le numéro de dossier est généré **par le navigateur du candidat** (`YS-2026-0001`, `0002`…), puis la
  fiche part sur WhatsApp et les références par e-mail. **Aucune donnée n'est stockée** : rien à sauvegarder.
- Test local : ouvrir `site-a-mettre-en-ligne/index.html` dans un navigateur, ou
  `cd site-a-mettre-en-ligne && python3 -m http.server 8000`.

Options du générateur :

```bash
WHATSAPP_CANDIDATS=212710359446 CONTACT_EMAIL=servicesyallah@gmail.com node build-site.js
node build-site.js --sortie /tmp/site            # autre dossier de sortie
```

### 2. Version serveur — `server.js` (Node, aucune dépendance à installer)

```bash
ADMIN_KEY='CleSecrete2026' node server.js
# http://localhost:3000             accueil foyers
# http://localhost:3000/candidature.html     fiche de candidature
# http://localhost:3000/admin       espace recruteur (clé : CleSecrete2026)
```

- Enregistre chaque candidature dans **`data/candidatures.json`** (dossier ignoré par Git — loi 09-08).
- Sert le site, l'API et l'espace recruteur ; `assets/js/config.js` est **injecté** avec vos variables.
- Le serveur écoute sur `0.0.0.0` (utilisable derrière Nginx/Caddy avec HTTPS).

### Variables d'environnement

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3000` | Port d'écoute |
| `ADMIN_KEY` | `yallah2026` | Clé de l'espace recruteur — **à changer** |
| `WHATSAPP_FOYERS` | `212691733585` | WhatsApp affiché aux foyers |
| `WHATSAPP_CANDIDATS` | `212710359446` | WhatsApp dédié au recrutement (repli : `WHATSAPP_NUMBER`) |
| `CONTACT_EMAIL` | `servicesyallah@gmail.com` | Réception des références |
| `DATA_DIR` | `./data` | Emplacement de la base des candidatures |
| `IP_SALT` | interne | Sel du hachage des IP (limitation de débit) |
| `TRUST_PROXY` | — | `1` si le serveur est derrière un reverse proxy |

### API

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/sante` | Vérification de disponibilité (le site détecte le mode serveur) |
| `POST` | `/api/candidature` | Dépôt d'une candidature → `201` + `numero` · `422` + `erreurs` · `429` si trop d'envois |
| `GET` | `/api/admin/candidatures` | Liste + statistiques (clé requise) |
| `GET` | `/api/admin/export.csv` | Export Excel/CSV (clé requise, séparateur `;`, BOM UTF-8) |
| `DELETE` | `/api/admin/candidature/:numero` | Suppression d'un dossier (droit à l'effacement) |

La clé peut être envoyée par l'en-tête `X-Admin-Key` ou par `?cle=…`.

---

## 🌍 Affichage en trois langues (+ darija en lettres latines)

Le site s'affiche en **quatre affichages** à partir du même HTML :

| Code | Affichage | Sens | Base affichée |
|---|---|---|---|
| `fr` | Français (langue source) | gauche → droite | textes français |
| `dar` | **الدارجة المغربية** (darija en lettres arabes) | droite → gauche | contenus arabes |
| `dar-latn` | **Darija** en lettres latines (Arabizi) | gauche → droite | contenus arabes |
| `en` | **English** | gauche → droite | textes français |

Le visiteur choisit dans le sélecteur de langue de la barre de navigation
(`FR · الدارجة · Darija · EN`) ; son choix est **mémorisé** (`localStorage`)
et s'applique à toutes les pages. Sans choix enregistré, la langue du
navigateur décide (`ar…` → darija, `en…` → anglais, sinon français).
On peut aussi forcer une langue par l'adresse : `?langue=en`, `?langue=dar`,
`?langue=fr` (l'ancien paramètre `ar` est accepté et donne la darija).

**Pages couvertes aujourd'hui (11)** : accueil, fiche de candidature,
confirmation de candidature, hub entreprises, services par ville, et les six
pages « service × ville » de Casablanca (ménage, nounou, cuisinière,
garde-malade, chauffeur, vigile). Les quatre pages
« service × ville » restantes (femme de ménage à Rabat, Marrakech et Tanger,
nounou à Rabat) restent en français pour l'instant : le moteur les laisse dans
leur langue de base et n'y affiche pas le sélecteur. Pour les traduire, voir
« Ajouter des traductions » ci-dessous.

⚠️ Les six pages de Casablanca sont **générées** par
`outils/generer-pages-villes.js` à partir de `contenu/pages/*.json` : ne
jamais corriger leur HTML à la main. Le cycle est donc : modifier le JSON →
`node outils/generer-pages-villes.js` → `node outils/extraire-i18n.js --json`
→ `node outils/reindexer-i18n.js --ecrire` (si le HTML a changé) → traduire →
`node outils/generer-i18n.js`. Les fichiers
`contenu/i18n/traductions/<page>.<langue>.json` survivent à une régénération.

### Comment ça marche

* Le HTML reste écrit en **français** (et en **arabe** sur les pages candidat).
  Un dictionnaire associe chaque texte d'origine à sa traduction ; le moteur
  (`assets/js/i18n.js`, aucune dépendance) remplace le texte affiché, traduit
  aussi les `placeholder`, `title`, `aria-label`, `alt`, les libellés de packs
  (`data-pack`), les liens WhatsApp pré-remplis, le `<title>` et les balises
  meta (description, Open Graph, Twitter).
* Un dictionnaire absent n'est jamais une erreur : la page reste dans sa langue
  de base, sans sélecteur. Rien ne peut donc « casser ».
* Le balisage interne est conservé (`<strong>`, `<em>`, liens, champs remplis
  par le JavaScript comme le numéro de dossier), il fait partie de la traduction.
* Les textes écrits par le JavaScript (messages d'erreur du formulaire,
  récapitulatif de la fiche, notifications) sont retraduits automatiquement.

### Ajouter des traductions (ou traduire une nouvelle page)

```bash
node outils/extraire-i18n.js --json     # 1. relève les chaînes et leurs clés
#    → écrire les traductions dans contenu/i18n/traductions/<page>.<langue>.json
node outils/generer-i18n.js             # 2. compile les dictionnaires publiés
node outils/extraire-i18n.js --verifier # 3. contrôle la couverture (0 = tout est traduit)
node outils/tester-i18n.js              # 4. teste les 4 affichages (nécessite : npm i jsdom)
```

Les traductions s'écrivent par **numéro de ligne** de la liste produite à
l'étape 1 (`{"12": "Our services, city by city"}`), avec un bloc `_extra` pour
les textes écrits par le JavaScript. Le générateur refuse d'écrire un
dictionnaire si le HTML de la page a changé depuis les traductions
(empreinte enregistrée dans le fichier de traduction) : aucune traduction ne
peut être décalée en silence.

### Corriger une phrase du site (sans perdre les traductions)

Modifier un texte dans le HTML décale les numéros : les traductions suivantes
ne tombent plus sur la bonne phrase. L'extraction conserve donc la liste
précédente et un outil replace chaque traduction sur sa clé :

```bash
node outils/extraire-i18n.js --json      # nouvelle cles.json + cles.prec.json (liste d'avant)
node outils/reindexer-i18n.js            # contrôle : ce qui est replacé, ce qui reste à écrire
node outils/reindexer-i18n.js --ecrire   # réécrit contenu/i18n/traductions/*.json
#   → écrire les quelques chaînes nouvelles signalées (numéro + texte)
node outils/generer-i18n.js              # compile
node outils/extraire-i18n.js --verifier  # 0 manquante = tout est traduit
```

À la main, pour une page de plus : ajouter son nom (sans `.html`) dans
`PAGES_TRADUITES` (`assets/js/i18n.js`), puis vérifier :

```bash
node outils/verifier-site.js            # section 8 : contrôle le branchement multilingue
```

## 🧑‍🍳 Parcours candidat

1. **Fiche de candidature** (`/candidature.html`) — 5 blocs, en **français ou en arabe** (RTL) :
   1. Identité — nom, WhatsApp, ville, quartier, âge, pays d'origine
   2. Poste souhaité — métier, expérience, prétention salariale, logée / non logée
   3. Disponibilité — temps plein, partiel, journée, nuit, week-end, garde de nuit · date · jours/semaine · villes acceptées
   4. Langues, compétences et documents
   5. **Deux références obligatoires** — nom, lien, téléphone
   + message libre, **consentement explicite (loi 09-08)** et champ anti-robots invisible.
2. **Validation** côté client *et* côté serveur · **12 envois/heure par IP** maximum.
3. **Numéro de dossier** `YS-2026-0001`, puis deux actions obligatoires :
   - 💬 **WhatsApp +212 710 359 446** — la fiche complète est déjà rédigée, un clic suffit ;
   - ✉️ **servicesyallah@gmail.com** — les deux références, numéro de dossier en objet.
4. Règle affichée au candidat : *sans références, la candidature n'est ni validée ni présentée à un foyer*.
5. **Gratuit pour les candidats** : aucun frais n'est demandé, ni avant ni après le placement.

## 🔐 Espace recruteur (`/admin`, version serveur)

- **Statistiques** : candidatures reçues, poste le plus demandé, ville principale, contacts WhatsApp
  disponibles, dossiers avec les deux références complètes.
- **Recherche instantanée** (nom, dossier, ville, métier, téléphone, références…).
- **Contact en un clic** : WhatsApp du candidat, e-mail, appel des références.
- **Export Excel/CSV** et **suppression d'un dossier** (droit à l'effacement — loi 09-08).
- Hors navigation, en `noindex`, et protégé par la clé `ADMIN_KEY`.

---

## 🎨 Logo & charte graphique

`assets/logo-source.png` (logo officiel) → **12 déclinaisons** générées par `generer-images-logo.py` :

```bash
python3 generer-images-logo.py          # nécessite Pillow : pip install pillow
```

| Déclinaison | Usage |
|---|---|
| `logo.png`, `logo-256.png`, `logo-128.png` | Navigation, en-têtes, facture |
| `logo-transparent-512.png` | Fond transparent (le cercle garde son bleu marine) |
| `logo-blanc-512.png` / `logo-marine-512.png` | Monochromes pour fonds sombres / clairs |
| `favicon-32.png`, `favicon-16.png`, `apple-touch-icon-180.png` | Favicons et icône iOS |
| `logo-og-1200x630.jpg` | Image de partage (Open Graph / réseaux sociaux) |
| `logo-bandeau-1600x400.png`, `logo-avatar-400.png` | Bannière et avatar WhatsApp Business |

**Charte** — marine `#0d2136`, or `#c9a227` (dégradé `#a8842a → #e9d493 → #c9a227`), ivoire `#fdf5dd`,
texte secondaire `#cdd7e2`. Le **vert** (`#08733d → #004c2b`) est réservé aux boutons WhatsApp et e-mail ;
le rouge (`#c1121f`) aux erreurs de saisie. Titres : Montserrat + Barlow Condensed.

---

## 💰 Grille tarifaire officielle (source : flyer YALLAH SERVICES)

Salaires **mensuels versés à l'employée** (indicatifs, selon conditions et responsabilités) :

| # | Service | Tarif |
|---|---|---|
| 1 | Ménage simple dans villa | 4 500 DH |
| 2 | Ménage simple dans mini villa | 4 000 DH |
| 3 | Ménage dans appartement | 3 500 DH |
| 4 | Nounou d'un enfant | 3 500 DH |
| 5 | Nounou d'un enfant + ménage | 4 000 DH |
| 6 | Nounou de 2 enfants avec ménage | 4 500 / 5 000 DH |
| 7 | Nounou de 3 enfants | 4 500 DH |
| 8 | Nounou de 3 enfants + ménage | 5 000 DH |
| 9 | Cuisine simple | 4 000 DH |
| 10 | Cuisine / ménage | 5 000 DH |
| 11 | Aide cuisine | 3 500 DH |
| 12 | Aide cuisine / ménage | 4 000 DH |
| 13 | Garde malade simple | 3 500 DH |
| 14 | Garde malade et ménage | 4 000 DH |

**Prestations à la journée — Casablanca & Rabat uniquement (8h max)**
Ménage normal : villa 400 DH · appartement 300 DH —
Grand ménage : villa 700 DH · appartement 500 DH
*(💰 paiement après service · 🧴 matériel fourni par le client · 📅 réservez 1 jour à l'avance)*

**Frais de Mise en relation** (payés **après validation du profil**, séparés du salaire) :
💎 Premium **1 000 DH** (remplacements gratuits 6 mois) · 🛡️ Sérénité **500 DH** (remplacements gratuits 2 mois).

## 🧭 Sections de l'accueil foyers (dans l'ordre)

1. **Navigation fixe** — logo officiel, liens d'ancrage, bouton WhatsApp, menu mobile, **lien « Espace candidats »**.
2. **Hero** — visuel plein largeur, *Votre maison, entre de bonnes mains*,
   slogan « Simplifiez-vous la vie ! », compteur de visiteurs, compte à rebours, statistiques
   et **mention d'orientation candidats**.
3. **Bandeau de confiance** — ✅ Profils vérifiés · ⭐ Expérience et professionnalisme · 🤝 Accompagnement personnalisé.
4. **Comment ça marche** — 4 étapes : formulaire → profil en 24h → rencontre & placement → suivi.
5. **Mini-formulaire** — nom, téléphone + service, ville, préférence, délai.
6. **Avis clients** — 3 témoignages 5 étoiles + flyer de la grille tarifaire.
7. **Nos Pack & Tarifs** — 5 onglets : 🧹 Ménage · 🧸 Nounou · 🍳 Cuisine · ❤️ Garde malade · ⏰ À la journée.
8. **Grille tarifaire des services** — tableau complet des 14 services, cliquable.
9. **Frais de Mise en relation** — 💎 Premium 1 000 DH · 🛡️ Sérénité 500 DH.
10. **FAQ** — 12 questions/réponses.
11. **🧑‍🍳 Vous cherchez un travail ?** *(nouveau)* — les 3 étapes candidats, le bouton
    « Remplir la fiche de candidature » et le **WhatsApp candidats +212 710 359 446**.
12. **Formulaire de réservation** — confirmation + facture `YS-XXXXXX`.
13. **Éléments persistants** — bouton WhatsApp flottant, **bandeau d'orientation candidats**, footer.

## ⚙️ Comportements JavaScript (`assets/js/app.js`)

- Compteur de visiteurs, compte à rebours d'offre (mémorisé en `localStorage`).
- Notifications de preuve sociale alignées sur la grille officielle.
- Onglets des packs, accordéon FAQ, animations au scroll.
- Clic sur une ligne de la grille ou une carte → popup « Réserver ce pack » pré-rempli.
- Validation des formulaires, génération de la **facture de confirmation** (`YS-######`)
  et lien « Confirmer sur WhatsApp » pré-rempli.
- Normalisation automatique des numéros : `06…` → `+212 6…`.

---

## ✅ Vérifications avant mise en ligne

```bash
node outils/verifier-site.js      # ressources, liens, ids, structure, multilingue
node outils/verifier-contenu.js   # volume et conformité du contenu SEO local
node outils/extraire-i18n.js --verifier   # toutes les chaînes sont-elles traduites ?
node outils/tester-i18n.js        # les 4 affichages (jsdom) — npm i jsdom
```


```bash
node outils/verifier-site.js        # liens, ressources, identifiants JS, formulaires, CSS, coordonnées
node outils/verifier-contenu.js     # contenu des pages villes : volume, recopie, titles, balisage, maillage
node outils/generer-pages-villes.js --verifier   # valide les fiches de contenu sans rien écrire
node outils/generer-pages-villes.js              # régénère les pages service × zone
node outils/generer-sitemap.js                   # régénère sitemap.xml (lastmod = git)
node build-site.js                               # site statique complet + sitemap
node --check assets/js/*.js server.js build-site.js
```

> ⚠️ `verifier-contenu.js` sort en **erreur (code 1)** tant que les pages service × ville
> n'ont pas un contenu original suffisant (≥ 600 mots, < 40 % de recopie entre pages).
> C'est volontaire : c'est le garde-fou qui empêche la publication de pages-portes.
> Les seuils sont réglables (`--mots 800 --dup 30`) ; le plan complet est dans
> **`plan-seo-local.md`**.

Le vérificateur contrôle notamment que **chaque image/script/feuille de style existe**, que chaque
identifiant utilisé par le JavaScript est bien présent dans la page, que les **messages d'erreur sont
bilingues**, et qu'aucune largeur fixe ne peut provoquer un défilement horizontal.

Contrôles déjà effectués sur cette version :

- [x] Accueil, fiche, confirmation, admin et assets répondent `200`
- [x] Envoi réel testé → dossier `YS-2026-0001` enregistré, puis base nettoyée
- [x] Validation serveur (champs manquants → `422` avec messages FR/AR)
- [x] Clé d'admin invalide → `403` · suppression sans clé → `403`
- [x] Anti-robots (champ piège) : aucun enregistrement, réponse neutre
- [x] Limite de débit : 12 envois/heure puis `429`
- [x] Export CSV : en-tête, séparateur `;`, BOM UTF-8 (accents corrects dans Excel)
- [x] Traversée de chemin (`/assets/../server.js`) et `/data/` → `404`
- [x] JavaScript validé (`node --check`) sur tous les fichiers
- [ ] Captures navigateur (ordinateur et mobile) : script prêt dans `apercus/`,
      à lancer quand un Chromium est disponible — l'environnement de développement actuel
      ne permet pas de le télécharger

## 🔍 SEO local (en cours)

**Villes d'intervention confirmées :** Casablanca (base : Hay Hassani 20220) · **Bouskoura** (pôle
résidentiel à part entière) · Rabat · Marrakech · Tanger · Agadir · Fès · Kénitra · Mohammedia ·
Témara · Salé — et d'autres villes **selon les demandes** (jamais affichées comme desservies).
**Meknès, Oujda et Tétouan ont été retirées** du site : elles ne figurent pas dans la liste confirmée.

**Deux marchés à couvrir :** particuliers (ménage, nounou, cuisine, garde-malade, chauffeurs,
gardiennage) **et** entreprises — hôtels, riads, maisons d'hôtes, restauration, chantiers
(main-d'œuvre et manœuvres), sociétés de nettoyage, événementiel. La partie B2B n'a pas encore
de page : c'est le prochain chantier du plan.

Le dépôt contient les premières briques du référencement local :

- **Pages service × zone** : 6 pages Casablanca en ligne (ménage, nounou, cuisinière, garde-malade,
  chauffeur, gardiennage), générées depuis `contenu/pages/*.json` — 869 à 1 514 mots, balisage
  `Service` + fil d'Ariane + `FAQPage`, 4 à 5 liens internes chacune.
- **Hubs** : `services-par-ville.html` (13 zones, 6 métiers) et `personnel-entreprises.html` (B2B).
- **Plan complet** : `plan-seo-local.md` — matrice services × villes par phases, gabarit de page,
  ligne B2B, Google Business Profile en mode « zone de service », citations locales et NAP
  canonique, procédure de production du contenu original, pilotage Search Console.
- **Fiche entreprise** : `contenu/fiche-entreprise.md` — référence unique de tout contenu produit.
- **Audit de conformité** : `contenu/audit-promesses-site.md` — affirmations corrigées et points
  en attente de confirmation (tarifs, avis clients, formules de remplacement).
- **Garde-fou** : `outils/verifier-contenu.js` bloque la publication tant qu'une page est
  trop courte ou trop proche d'une autre (protection contre les pages-portes).

Règles à ne pas contourner : un seul profil Google par établissement réellement exploité,
aucune adresse inventée, aucune promesse de service à la journée hors Casablanca/Rabat,
aucun délai, prix, garantie ou vérification affirmé sans confirmation,
aucun texte repris d'un concurrent.

## 🔒 Conformité (loi marocaine 09-08)

- **Consentement explicite** obligatoire avant l'envoi d'une candidature.
- **Conservation 12 mois maximum** pour les candidats non retenus, suppression sur demande —
  bouton « Supprimer le dossier » dans l'espace recruteur.
- Les références ne sont **jamais publiées** : elles servent uniquement à la vérification par l'agence.
- **Aucun frais candidat**, à aucun moment. Aucune donnée n'est vendue ni transmise à des tiers.
- Le dossier `data/` (base des candidatures) est **exclu de Git** et doit être sauvegardé régulièrement.
- Activer **HTTPS** avant mise en production : les fiches contiennent des données personnelles.

## ✏️ À personnaliser

- **Changer `ADMIN_KEY`** (valeur par défaut `yallah2026`) avant toute mise en ligne.
- **Photos réelles** de l'agence dans `assets/img/` (garder les mêmes noms de fichiers).
- **Logo** : remplacer `assets/logo-source.png` puis relancer `python3 generer-images-logo.py`.
- **Métiers proposés** aux candidats : `candidature.html` (liste `<select id="poste">`).
- **Villes** : listes `<select id="ville">` (candidature) et `#ctCity` (réservation foyers).
- **Pixel Facebook / Google Analytics** : à ajouter avant toute campagne publicitaire.

### Images binaires encore à fournir

Les fichiers suivants sont référencés par `index.html` mais ne sont pas encore dans le dépôt
(leur référencement HTML est conservé, ils ne s'afficheront qu'après ajout) :

- `assets/img/grille-tarifaire.jpg`
- `assets/img/pack-menage-villa.jpg`
- `assets/img/pack-nounou-multi.jpg`
- `assets/img/pack-cuisine-simple.jpg`
- `assets/img/pack-aide-cuisine.jpg`
- `assets/img/garde-malade.jpg`
- `assets/img/garde-malade-menage.jpg`

### Visuel d'accueil

`assets/img/hero-services.jpg` est une illustration photoréaliste générée par IA, inspirée de la
présentation de Yallah Services. Elle ne représente pas l'équipe réelle ni des candidats disponibles.
L'image de partage (Open Graph) est désormais `assets/img/logo-og-1200x630.jpg`, générée à partir du
logo officiel.
