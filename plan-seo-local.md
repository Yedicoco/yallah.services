# Plan SEO local — Yallah Services

**Périmètre :** visibilité sur les requêtes de recherche de personnel au Maroc, **particuliers et
entreprises**, ville par ville puis secteur par secteur.
**Référence obligatoire :** [`contenu/fiche-entreprise.md`](contenu/fiche-entreprise.md) — positionnement,
villes confirmées, ton, et la liste de ce qu'il est interdit d'inventer.
**État du dépôt :** 2 octobre 2026, branche `arena/01a0fc7a-yallah-services`.
**Règle de survie :** aucune page publiée sans contenu réellement original et vérifiable.

---
## Où on en est — 2 octobre 2026

| Élément | Statut |
|---|---|
| Lot 0 — déblocage contenu | ✅ **Fait pour Casablanca.** 6 pages rédigées (869 à 1 514 mots), contrôle `verifier-contenu.js` **vert : 0 erreur, 0 avertissement**, aucune recopie au-dessus du seuil |
| Générateur de pages | ✅ `outils/generer-pages-villes.js` + contenu par page dans `contenu/pages/*.json` — refuse de générer si une fiche est incomplète |
| Pages en ligne | ✅ 6 pages Casablanca + hub `services-par-ville.html` + hub B2B `personnel-entreprises.html` |
| Sitemap | ✅ 10 pages, généré automatiquement (`outils/generer-sitemap.js`) |
| Maillage interne | ✅ 4 à 5 liens locaux par page, hubs liés depuis l'accueil et les pieds de page |
| Conformité des affirmations | ✅ origine ethnique retirée, promesses non confirmées retirées, villes corrigées, faux avis supprimés (voir `contenu/audit-promesses-site.md`) |
| Lot 1 — domaine propre | ⬜ à faire (achat + bascule, une ligne à changer dans `site.config.json`) — vérifié le 05/10/2026 : `yallah.services` ne résout pas (NXDOMAIN), le domaine n'est donc ni acheté ni branché |
| Lot 2 — Google Business Profile | ⬜ à faire (profil « zone de service », 20 photos, 15 avis) |
| Lot 3 — citations | ⬜ à faire (NAP figé, 10 annuaires) |
| Lots 4-6 — autres villes et B2B détaillé | ⏳ fiches locales par ville à remplir (30 min par ville) — le générateur est prêt |

**Ce qui bloque la suite :** uniquement la **matière locale par ville** (annexe B) et les **visuels**
(7 images référencées par l'accueil mais absentes du dépôt). Tout le reste est outillé.

---


## 0. Trois corrections, avant tout le reste

### 0.1 « Un Google Business Profile par ville » → non, c'est un motif de suspension

Google impose **un seul profil par établissement réellement exploité**. Un profil par ville sans
adresse ni personnel sur place = faux établissement : suspension du profil, parfois de tout le compte.
Pour Yallah Services (base unique à Hay Hassani, interventions chez le client) :

- **un** profil en mode **« zone de service »** (adresse masquée, zones desservies listées) ;
- l'adresse réelle reste en base pour la vérification — **jamais** de boîte postale ni de bureau virtuel ;
- un second profil uniquement là où existerait une adresse réellement exploitée et staffée.

Conséquence : **le pack local (la carte) se gagne à Casablanca**. Dans les autres villes, Google calcule
la distance depuis l'adresse cachée — la couverture commerciale reste entière (les 13 zones sont
desservies), mais le **canal d'acquisition** change : organique + citations + WhatsApp. Les deux canaux
se pilotent, on ne promet pas 11 cartes.

### 0.2 « FAQPage → FAQ dépliée dans Google » → la FAQ dépliée n'existe plus

Rich results FAQ retirés définitivement en mai 2026 (restriction entamée en 2023). Le balisage
`FAQPage` reste utile pour la compréhension et les moteurs IA, mais **n'affichera plus d'accordéon**.
On garde la FAQ pour les visiteurs et les réponses IA, on ne la vend plus comme levier SERP.

### 0.3 Les données structurées ne sont pas absentes — elles sont à compléter

`index.html` porte déjà l'entité centrale `EmploymentAgency` (sous-type de `LocalBusiness`, avec
code postal 20220, région et villes confirmées) et les pages villes un `@graph`
`Service` + `BreadcrumbList` + `FAQPage`.
Le travail : rendre le balisage **exact et complet sur toutes les pages**, et **ne jamais déclarer
ce qui n'est pas visible dans la page** (un écart réel a été détecté et corrigé le 2 octobre).

> **Fait le 6 octobre 2026** — le guide de référence `doc/guide-schema-corrige-yallah-services.pdf`
> a été retrouvé et appliqué : une seule organisation centrale (`EmploymentAgency`, `@id …/#business`)
> référencée par `@id` depuis chaque page ; graphe `WebPage → Service → areaServed` sur les pages
> service × ville, les hubs et l'accueil ; `containedInPlace` (Country : Maroc) sur chaque ville ;
> aucune adresse ni établissement local déclaré hors accueil. `outils/verifier-seo.js` contrôle ce
> graphe page par page et refuse toute note structurée (`review`/`aggregateRating`) tant que les
> consentements d'avis ne sont pas archivés. Détail point par point :
> `contenu/audit-promesses-site.md` §6.

---

## 1. État des lieux vérifié

| # | Point | Statut réel | Preuve |
|---|---|---|---|
| 1 | Google Business Profile | ❌ à créer (mode zone de service) | aucune trace |
| 2 | Matrice service × ville | ⚠️ 2 pages publiées sur 66 prévues | `femme-menage-casablanca.html`, `nounou-casablanca.html` |
| 3 | **Ligne B2B** | ❌ **absente du site** | fiche entreprise §Services B : hôtels, riads, restauration, chantiers, nettoyage, événements |
| 4 | Données structurées | ✅ présentes, ⚠️ à compléter sur chaque page | `LocalBusiness` (accueil), `Service` + `FAQPage` (villes) |
| 5 | `sitemap.xml` | ✅ désormais généré automatiquement | `outils/generer-sitemap.js` |
| 6 | Robots / indexation | ✅ correct | `robots.txt`, `noindex` sur la confirmation |
| 7 | Search Console | ⚠️ propriété créée, aucun suivi | `googlee184c103eb04f93a.html` |
| 8 | Domaine propre | ⚠️ étape intermédiaire | tout pointe sur `https://menage-nounou.web.app` (projet Firebase `menage-nounou`, rebâtissage du 08/10/2026) ; domaine propre `yallah.services` toujours non enregistré |
| 9 | Contenu des pages villes | ❌ **bloquant** | 364 et 418 mots, structure calquée, 23 % de texte identique |
| 10 | Maillage interne | ❌ insuffisant | aucune page ville ne lie une voisine |
| 11 | **Conformité des affirmations** | ⚠️ corrigée le 2 octobre | voir `contenu/audit-promesses-site.md` |
| 12 | Citations / NAP | ❌ à faire | 2 numéros, e-mail Gmail, pas d'adresse publique |
| 13 | Mesure | ❌ à faire | aucun suivi par page ni par zone |

**Outil de contrôle :** `node outils/verifier-contenu.js` — sort en **erreur** sur l'état actuel
(2 pages trop courtes, 0 maillage). C'est volontaire : c'est le garde-fou anti-pages-portes.

---

## 2. Le blocage : le contenu (phase 0, non négociable)

| Page | Mots utiles | Recopie croisée | Diagnostic |
|---|---|---|---|
| `femme-menage-casablanca.html` | 364 | 23 % | trop court, structure calquée |
| `nounou-casablanca.html` | 418 | 23 % | trop court, structure calquée |

Ce ne sont pas des copies mot pour mot — le texte a été reformulé — mais **le squelette est identique**
et près d'un quart des phrases est commun. Multiplié par 60, cela produit exactement ce que Google
appelle une **grappe de pages-portes** : même contenu utile partout, seule la ville change.

### 2.1 Ce qui rend un contenu local légitime

Pas la reformulation : **l'information qu'on ne trouve nulle part ailleurs**. Elle existe déjà chez vous :
quartiers réellement desservis, questions reçues sur WhatsApp, délais observés, salaires négociés dans
le cadre de la grille, types de logements dominants, difficultés locales (transport, langues), saisonnalité.

### 2.2 Procédure (page par page)

1. **Fiche locale** (annexe B, 30 min/ville) + **fiche métier** (30 min/métier) remplies par l'équipe.
2. **Rédaction** : 900–1 200 mots à partir de ces fiches **uniquement** — aucune consultation de sites
   concurrents pendant la rédaction (c'est la seule méthode fiable pour ne pas copier).
3. **Contrôle** : `node outils/verifier-contenu.js` au vert (≥ 600 mots, < 40 % de recopie).
4. **Traçabilité** : chaque fait local inscrit dans `contenu/sources-editoriales.md`.
5. **Publication par vagues de 6 à 8 pages**, jamais 60 d'un coup.

**Charge : 3 à 4 heures par page** une fois les fiches remplies (2 h de rédaction, 1 h de contrôle et
d'intégration), soit **1 000 à 1 200 heures** pour les 104 pages du plan complet (78 B2C + 21 B2B + hubs). À 2 h/jour : un an.
À temps plein : 6 à 7 mois. Le plan est donc conçu pour **s'arrêter à tout moment sur un socle cohérent**
(voir §4 : la phase 1 est déjà une unité rentable).

---

## 3. Architecture cible

### 3.1 Trois niveaux

| Niveau | Fichier | Contenu | Volume |
|---|---|---|---|
| **N1 — service × ville (B2C)** | `<service>-<ville>.html` | ménage, nounou, cuisinière, garde-malade, chauffeur, vigile | 6 × 13 = 78 |
| **N2 — B2B** | `personnel-<secteur>.html` et `personnel-<secteur>-<ville>.html` | hôtellerie/riads · restauration · main-d'œuvre chantiers · nettoyage · événementiel | 5 hubs + ville selon phase |
| **N3 — quartier** | `<service>-<quartier>.html` | voir règle §3.6 | après mesure uniquement |
| **Hubs** | `services-par-ville.html` · `personnel-entreprises.html` | distribution du maillage interne | 2 |

### 3.2 Villes et phases (fiche entreprise)

**Phase 1** — Casablanca, **Bouskoura** (pôle résidentiel à part entière), **Dar Bouazza** (Tamaris),
Rabat, Marrakech
**Phase 2** — Tanger, Agadir, Mohammedia, Kénitra
**Phase 3** — Fès, Témara, Salé, **Bouznika** — puis **El Jadida** (candidate) uniquement après confirmation

> **Dar Bouazza et Bouznika** sont entrées dans la couverture parce que **des clientes réelles y sont établies**
> (avis clients, 2 octobre 2026) : c'est la preuve de service la plus solide. À l'inverse, une ville sans
> aucun client, aucune demande et aucune référence ne doit pas être affichée comme desservie.
**Jamais** : Meknès, Oujda, Tétouan (retirées du site), sauf confirmation écrite de la direction
**Ajout de zone** : possible uniquement avec une preuve de service (client, mission, demande qualifiée)

URLs à plat (`/femme-menage-casablanca.html`) : hébergement statique sans réécriture, zéro redirection.
Passage en dossiers à envisager seulement au-delà de ~150 pages.

### 3.3 Domaine propre (à faire avant les citations)

Tout pointe désormais sur `https://menage-nounou.web.app` (projet Firebase `menage-nounou`) :
canonicals, OG, `@id` Schema, sitemap, robots — la bascule du 08/10/2026 a remplacé l'ancien
hébergement Vercel puis le premier projet Firebase `yallah-services-8f1ec`, dont la propriété
Search Console restait bloquée sur « Impossible de récupérer le sitemap ».
Sous-domaine partagé = mauvais signal pour les annuaires et la fiche Google. **Lot 1 :**
acheter le domaine propre (`yallah.services`, libre au 08/10/2026), le brancher comme domaine
personnalisé Firebase, centraliser l'adresse dans `site.config.json` (`url`) puis
`node build-site.js` — procédure pas à pas dans le README (« Basculer le site sur un autre
projet Firebase ou un domaine »). Un seul point de vérité.

> **État au 5 octobre 2026 :** `yallah.services` (l'`urlSouhaitee` de `site.config.json`),
> `yallahservices.ma`, `yallah-services.ma`, `yallah.ma` et `yallahservices.com` ne résolvent
> pas (NXDOMAIN) — rien à basculer tant que le domaine n'est pas acheté et délégué.
> Après la bascule, `node outils/verifier-contenu.js` (contrôle 7.4) liste chaque URL publiée
> restée sur un ancien hébergement.

### 3.4 Maillage interne

- Chaque page ville-service lie : le hub, la page du **même service à Casablanca** (pilier),
  **3 pages voisines**, l'accueil, l'espace candidats.
- Le hub `services-par-ville.html` lie les 78 pages (groupées par métier puis par ville).
- Le hub `personnel-entreprises.html` lie les 5 secteurs et les déclinaisons ville.
- Accueil : remplacer les liens perdus dans le bandeau candidats par un lien de pied de page
  « Nos services par ville » + une section courte pointant les deux hubs.
- Ancres descriptives (« Femme de ménage à Casablanca »), jamais de liste de villes surchargée.

### 3.5 Croisement B2C / B2B — ne pas mélanger

Une page B2C parle à une famille (logement, enfants, horaires, jour de repos).
Une page B2B parle à un responsable (effectif, planning, saisonnalité, facturation, remplacement rapide).
Mêmes services, **vocabulaire, preuves et CTA différents**. Un hôtel ne clique pas sur « nounou ».

### 3.6 Pages quartiers — règle stricte

La cartographie de la fiche (Anfa, Souissi, Palmeraie, Malabata, Founty…) est une **liste de ciblage
commercial, pas une liste de quartiers desservis**. Donc :

- **usage immédiat :** ciblage géographique des campagnes (Ads / Meta) et contenus sociaux
  (« nounou et femme de ménage à Bouskoura ») ;
- **usage SEO :** une page quartier n'est créée que si la zone a produit **au moins 3 demandes
  qualifiées mesurées** et si le quartier est réellement desservi pour la mission concernée ;
- jamais de page quartier générée en série.

---

## 4. Le plan, en 7 lots

| Lot | Contenu | Charge | Semaine | Critère de sortie (DoD) |
|---|---|---|---|---|
| **0 — Déblocage contenu** | Fiches locales + fiches métier ; réécriture des 2 pages Casablanca ; registre des sources | 4–5 j | S1–S2 | `verifier-contenu.js` vert, ≥ 900 mots, < 25 % de recopie entre les deux |
| **1 — Socle technique** | Domaine + 301 + `site.config.json` ; hub `services-par-ville.html` ; sitemap auto ✅ ; maillage accueil ↔ hub ↔ pages | 3–4 j | S1–S3 | 1 page test complète, 100 % des URL sur le domaine, hub en ligne |
| **2 — Google Business Profile** | Profil « zone de service », catégories, 6 services, 20+ photos réelles, Q&R, posts, avis | 2–3 j | S2–S4 | Profil **vérifié**, 15 avis réels, 0 adresse inventée |
| **3 — Citations & NAP** | NAP figé, 10–12 citations marocaines, reprise des profils sociaux | 2–3 j | S3–S5 | 10 citations en ligne, NAP identique à l'octet près |
| **4 — B2C phase 1** | 30 pages : Casablanca ✅ (6 pages en ligne) + Bouskoura + Dar Bouazza + Rabat + Marrakech × 6 services | 30–35 j | S4–S14 | 30 pages vertes, publiées en 5 vagues, indexées |
| **5 — B2B** | Hub `personnel-entreprises.html` + 5 secteurs + 15 déclinaisons ville (Marrakech, Casablanca, Agadir, Tanger, Rabat) | 25–30 j | S10–S20 | 21 pages, ≥ 5 demandes B2B entrantes tracées |
| **6 — B2C phases 2 et 3** | 36 pages : Tanger, Agadir, Mohammedia, Kénitra, Fès, Témara, Salé | 45–50 j | S16–S34 | idem + bilan de position par page à J+30 |
| **7 — Mesure continue** | Search Console, suivi par page, seuils de décision | 0,5 j/semaine | dès S1 | Tableau de bord à jour chaque lundi |

**Ordre de priorité si le temps manque :** lot 4 (B2C phase 1) puis **lot 5 (B2B)** avant le lot 6.
Le B2B est **moins concurrentiel** et plus rentable par demande : « personnel pour riad à Marrakech » ou
« manœuvres pour chantier à Casablanca » n'ont presque pas de pages sérieuses en face, là où
« femme de ménage Casablanca » est saturé.

---

## 5. Matrices

### 5.1 B2C — 6 services × 13 points de couverture

Légende : **1** = phase 1 · **2** = phase 2 · **3** = phase 3

| Service \ Zone | Casa | Bouskoura | Dar Bouazza | Rabat | Marrakech | Tanger | Agadir | Mohammedia | Kénitra | Fès | Témara | Salé | Bouznika |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Femme de ménage | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 |
| Nounou | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 |
| Cuisinière | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 |
| Garde-malade | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 |
| Chauffeur | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 |
| Vigile / gardien | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 |

### 5.2 B2B — 5 secteurs, hubs nationaux + villes

| Secteur | Hub | Déclinaisons ville (selon phase) |
|---|---|---|
| Hôtels, riads, maisons d'hôtes | oui | Marrakech (1) · Agadir (1) · Tanger (2) · Casablanca (1) |
| Restaurants et cafés | oui | Casablanca (1) · Marrakech (1) · Tanger (2) |
| Main-d'œuvre et manœuvres (chantiers) | oui | Casablanca (1) · Rabat (1) · Témara (3) |
| Sociétés de nettoyage | oui | Casablanca (1) · Rabat (2) |
| Renfort événementiel | oui | Casablanca (1) · Marrakech (2) |

> ⚠️ **Périmètre à respecter :** « main-d'œuvre et manœuvres » = recherche de personnes et mise en
> relation. **Jamais** de promesse de montage, d'étude ou de pilotage de projet (fiche entreprise §B).

### 5.3 Les 12 premières URL à produire (phase 1)

```
/services-par-ville.html                        (hub N1)
/femme-menage-casablanca.html                   (réécriture)
/nounou-casablanca.html                         (réécriture)
/cuisiniere-casablanca.html · /garde-malade-casablanca.html · /chauffeur-casablanca.html · /vigile-casablanca.html
/femme-menage-bouskoura.html · /nounou-bouskoura.html         (pôle résidentiel)
/personnel-entreprises.html                     (hub B2B)
/personnel-hotellerie.html                      (hub secteur) — puis /personnel-hotellerie-marrakech.html
/mains-doeuvre-chantiers.html                   (hub secteur) — puis /mains-doeuvre-chantiers-casablanca.html
```

---

## 6. Gabarit d'une page (B2C et B2B)

| # | Section | Longueur | Source obligatoire (unicité) |
|---|---|---|---|
| 1 | H1 + intro | 120–180 mots | quartiers réels + type de logement dominant + promesse locale |
| 2 | « Ce que change le contexte local » | 180–250 mots | bâti, transport, saisonnalité observée |
| 3 | Prestations incluses / exclues | 150–220 mots | fiche métier (périmètre réel) |
| 4 | Zones desservies | 8–12 quartiers | liste réelle, vérifiable sur une carte |
| 5 | Tarifs | grille officielle | ⚠️ bloc commun autorisé **une fois par page** |
| 6 | Déroulé local en 4 étapes | 120–180 mots | délais réellement observés, **jamais promis** |
| 7 | FAQ | 5–6 Q/R, 60–120 mots | questions réellement reçues sur WhatsApp |
| 8 | Preuve locale (avis client réel) | 40–80 mots | prénom + quartier + service, **accord écrit**. Rien à publier = pas de bloc |
| 9 | Bloc candidats de la ville | 60–90 mots | lien `candidature.html` |
| 10 | CTA WhatsApp | — | message pré-rempli service + ville + `?src=` |
| 11 | Maillage | 4–6 liens | hub + voisines (§3.4) |

**Variante B2B :** remplacer les blocs 4, 8 et 9 par *secteurs et effectifs servis*, *exemples de missions
(temporaire, journalier, saisonnier)* et *processus de mise en relation professionnel* ; CTA « décrire
votre besoin d'effectif ». Le vocabulaire « foyer / nounou / jour de repos » est **interdit** en B2B.

**Cibles techniques :** `title` ≤ 60 caractères · `meta description` 120–165 · H1 unique service + ville ·
`Service` + `BreadcrumbList` + `FAQPage` conformes au texte visible · pas d'`aggregateRating` sur vos
propres avis · 4–6 liens internes.

---

## 7. Google Business Profile (lot 2)

1. **Un** profil, catégorie principale « aide à domicile / mise en relation de personnel »,
   catégories secondaires ménage et garde d'enfants.
2. Mode **zone de service** : adresse réelle (Hay Hassani 20220) en base et **masquée** — jamais de
   boîte postale ni de bureau virtuel (suspension quasi systématique).
3. Zone de service : Casablanca et communes proches (dont Bouskoura). Les autres villes ne doivent pas
   gonfler la zone : une zone trop large dilue le classement.
4. Services déclarés (les 6 du B2C) + description de 750 caractères reprenant la promesse de la fiche.
5. **20 photos minimum**, réelles : logo, équipe avec accord, flyer tarifaire. Aucune banque d'images.
6. **Q&R** : les 8 questions les plus fréquentes avec les réponses des pages (cohérence).
7. **Posts** : 1 par semaine, réutilisés depuis WhatsApp / Instagram.
8. **Avis** : demander après chaque placement, lien direct. Objectif 15 avis en 90 jours. Répondre à tous.
9. **Vérification** : prévoir la vidéo (30 s–5 min, sans visage ni document bancaire) montrant l'adresse,
   l'activité et la preuve de gestion.

**Interdits :** un profil par ville sans équipe sur place · adresse d'un tiers ou d'un proche ·
zone couvrant tout le Maroc · avis achetés ou échangés.

---

## 8. Citations locales & NAP (lot 3)

### 8.1 NAP canonique

| Élément | Valeur | Règle |
|---|---|---|
| Nom | `Yallah Services` | identique partout, sans « SARL », sans slogan |
| Adresse publique | aucune (mode zone de service) | ne jamais inventer une adresse pour remplir un annuaire |
| Villes | Casablanca · Bouskoura · Dar Bouazza · Bouznika · Rabat · Marrakech · Tanger · Agadir · Fès · Kénitra · Mohammedia · Témara · Salé | **même ordre** partout |
| Téléphone public | `+212 691 733 585` | le `+212 710 359 446` **uniquement** côté candidats |
| E-mail | à passer sur `contact@<domaine>` | le Gmail est un signal faible |
| Site | `https://<domaine>/` | jamais `*.vercel.app` dans une citation |

**Trois identités sociales différentes à unifier** : Facebook `yallahservicesmaroc`,
Instagram `yallahservice`, TikTok `yallah.services.m` — même si la fiche les reprend telles quelles,
l'idéal pour la reconnaissance de marque est un nom unique décliné.

### 8.2 Où s'inscrire (par valeur)

| Priorité | Plateforme | Type |
|---|---|---|
| 1 | Google Business Profile | obligatoire |
| 1 | `pagesjaunes.ma` · `telecontact.ma` | annuaires marocains de référence, indexés |
| 2 | `annuaire-gratuit.ma` · `adresses.ma` | fiches indexables par métier et par ville |
| 2 | `kompass.com` (Maroc) · `kerix.net` | B2B — utile pour la ligne entreprises |
| 2 | Bing Places · Apple Business Connect | import rapide depuis la fiche Google |
| 2 | Facebook · Instagram · TikTok · LinkedIn | même nom, même URL, même ville |
| 3 | `avito.ma` (Services) · presse locale · associations | visibilité et demande, valeur SEO secondaire |

**Cadence :** 2–3 citations par semaine pendant 4 semaines, tenues dans un tableau
(`plateforme · URL · date · NAP conforme · identifiants`). **Aucun achat de pack de backlinks.**

---

## 9. Mesure et pilotage (lot 7)

1. Propriété Search Console sur le domaine définitif : soumettre `sitemap.xml`, re-soumettre à chaque vague.
2. Chaque lundi, 20 min : indexation, requêtes par page, position des 20 requêtes prioritaires,
   clics vers WhatsApp (paramètre `?src=` sur les liens `wa.me`).
3. **Seuils de décision**
   - indexée mais 0 impression à J+60 → revoir titre, description, FAQ ;
   - 0 impression à J+90 → fusionner avec la page pilier, rediriger en 301 ;
   - position 11–20 avec impressions → +300 mots et 2 liens internes ;
   - position 1–3 sans clic → réécrire l'extrait ;
   - page B2B sans demande entrante à J+90 → revoir le vocabulaire métier (effectif, planning, saison).
4. **Mesure par zone** (exigence de la fiche entreprise) : demandes WhatsApp · demandes qualifiées ·
   missions conclues · clients récurrents. C'est cette mesure qui autorise — ou non — une page quartier (§3.6).

**Objectifs à 90 jours** (mesurables) : 28 pages conformes en ligne · profil Google vérifié · 15 avis ·
10 citations · 30 requêtes en top 50 · 5 requêtes en top 10 · trafic WhatsApp tracé depuis les pages.
Aucun volume de recherche ne sera avancé sans les chiffres réels de Search Console.

---

## 10. Erreurs à ne pas commettre

- ❌ Publier 60 pages d'un coup avec le même gabarit.
- ❌ Créer des profils Google par ville, ou une adresse fictive sur un annuaire.
- ❌ Déclarer dans le balisage ce qui n'est pas visible sur la page.
- ❌ **Affirmer un prix, un salaire, un délai, une garantie, une vérification ou une disponibilité
  sans confirmation** (règle absolue de la fiche entreprise).
- ❌ Afficher une ville non desservie (Meknès, Oujda, Tétouan) ou promettre un quartier non desservi.
- ❌ Promettre le service à la journée hors Casablanca et Rabat.
- ❌ Mélanger B2B et B2C dans une même page ou un même message.
- ❌ Promettre le montage ou le pilotage de projet (B2B = personnes uniquement).
- ❌ Cibler la clientèle ou les candidats par origine (voir audit de conformité).
- ❌ Faire traduire automatiquement des pages en arabe et les publier telles quelles — l'arabe viendra
  écrit par un arabophone, en commençant par Casablanca, et seulement si Search Console montre des
  requêtes en arabe.
- ❌ Croire que la FAQ dépliée reviendra dans Google.

---

## 11. Automatisation

| Script | Rôle | Statut |
|---|---|---|
| `outils/verifier-contenu.js` | contrôle bloquant du contenu local | ✅ livré |
| `outils/generer-sitemap.js` | sitemap auto, `lastmod` issu de Git, robots synchronisé | ✅ livré |
| `outils/appliquer-fiche-entreprise.py` | alignement du site sur la fiche entreprise (traçable) | ✅ livré |
| `generer-pages-villes.js` | assemble les pages depuis un fichier de contenu par page, **refuse de générer** si les champs locaux obligatoires sont vides | à écrire après validation du gabarit |
| Extension `outils/verifier-site.js` | pages B2B + contrôle du domaine unique | lot 1 |

Le générateur n'invente jamais : il assemble un contenu déjà écrit et validé. C'est la garantie
mécanique contre les pages-portes.

---

## Annexe A — Checklist avant publication

- [ ] Fiche locale (annexe B) et fiche métier remplies et archivées
- [ ] 900+ mots utiles, aucun paragraphe repris d'une autre page
- [ ] `node outils/verifier-contenu.js` → 0 erreur
- [ ] Aucun prix, délai, garantie ou vérification non confirmé (relecture contre la fiche entreprise)
- [ ] Title ≤ 60 car., description 120–165 car., H1 unique
- [ ] Faits locaux tracés dans `contenu/sources-editoriales.md`
- [ ] 4–6 liens internes (hub + voisines), lien candidats, CTA WhatsApp avec `?src=`
- [ ] Page dans le sitemap, publiée dans la vague prévue
- [ ] Après publication : inspection d'URL, contrôle à J+7 et J+30

## Annexe B — Les 15 questions qui produisent le contenu

**Par ville** (30 min, une fois, réutilisée pour les 6 services) — voir le formulaire prêt à remplir :
`contenu/fiche-locale-casablanca.md`.

1. Quartiers réellement desservis (8 à 12 noms exacts)
2. Placements réalisés dans cette ville depuis 12 mois (chiffre réel)
3. Types de logements dominants et ce que ça change
4. Les 3 profils les plus demandés ici
5. Les 5 questions les plus posées sur WhatsApp (copier-coller anonymisé)
6. Salaires réellement négociés dans le cadre de la grille, et pourquoi les écarts
7. Délai réellement observé pour présenter un profil, haute et basse saison
8. Difficultés locales (transport, quartiers excentrés, langues)
9. Périodes de forte demande (Ramadan, rentrée, été, vacances)
10. Des profils refusent-ils cette ville ? Pourquoi ?
11. La formule logée est-elle courante ici ?
12. Langues parlées par les candidates de la ville
13. Témoignage client réel (prénom + quartier + accord écrit)
14. Erreurs des familles d'ici quand elles recrutent
15. Point de contact réellement exploitable sur place

**Par métier** (30 min, une fois) — 15 questions : périmètre inclus/exclu · erreurs de brief les plus
fréquentes · vérifications faites avant de proposer un profil · différence avec le métier voisin
(cuisine simple vs cuisine + ménage) · critères réels de sélection · motifs de remplacement récurrents ·
délai réaliste en haute saison · variation des tarifs · conditions de la formule logée · période d'essai ·
questions posées au téléphone mot pour mot · signaux d'alerte côté famille · que faire si le profil ne
convient pas la première semaine · tâches hors périmètre · suivi après placement.

**Par secteur B2B** (30 min, une fois par secteur) : effectifs demandés en pointe · saisonnalité ·
compétences indispensables · contraintes horaires (service, nuit, week-end) · durées de mission
(journalier, saisonnier, permanent) · ce que les clients de ce secteur regrettent le plus ·
comment ils recrutent aujourd'hui · vocabulaire exact du métier · documents exigés (permis, hygiène,
formation) · délai réellement tenable · profils difficiles à trouver · signaux d'alerte côté client.
