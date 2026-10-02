# Plan SEO local — Yallah Services

**Périmètre :** visibilité sur les requêtes « service × ville » au Maroc (ménage, nounou, cuisinière, chauffeur, vigile, garde-malade × 11 villes).
**Point de départ :** état du dépôt au 2 octobre 2026 (branche `arena/01a0fc7a-yallah-services`).
**Couverture de service (acquis, non négociable) :** Yallah Services est **basé à Casablanca (Hay Hassani 20220)** et **dessert l'ensemble des grandes villes du Maroc**. La matrice de pages couvre donc les 11 villes ; seule la production de contenu fixe le rythme (vagues de 6 à 8 pages).
**Règle de survie :** aucune page publiée sans contenu réellement original et vérifiable.

---

## 0. Trois corrections à ta liste, avant tout le reste

Ta liste est juste sur le fond. Trois points sont factuellement faux ou obsolètes et coûteraient cher s'ils étaient appliqués tels quels.

### 0.1 « Un Google Business Profile par ville » → non, c'est un motif de suspension

Google impose **un seul profil par établissement réellement exploité**. Un profil par ville, sans adresse ni personnel sur place, c'est du faux établissement : suspension du profil, et parfois de tous les profils du compte. Pour une entreprise qui se déplace chez le client (cas de Yallah Services), la bonne configuration est :

- **un** profil en mode **« zone de service »** (adresse masquée, villes desservies listées) ;
- l'adresse réelle reste en base pour la vérification, **jamais** de boîte postale ni de bureau virtuel ;
- un second profil uniquement là où existe une adresse réellement exploitée et staffée (si vous ouvrez un point d'ancrage à Rabat ou Marrakech, là oui).

Conséquence directe : **le pack local (la carte) se gagnera à Casablanca**, et plus difficilement dans les villes éloignées, puisque Google calcule la distance depuis l'adresse cachée. Cela ne remet **pas** en cause la couverture commerciale — Yallah Services dessert bien les 11 villes — c'est le **canal d'acquisition** qui change selon la ville : pack local + pages pour Casablanca, **pages + citations + demandes WhatsApp** pour les autres. Il faut piloter les deux, sans promettre 11 packs locaux.

### 0.2 « FAQPage → FAQ dépliée dans Google » → la FAQ dépliée n'existe plus

Google a limité les résultats enrichis FAQ aux sites gouvernementaux et de santé en août 2023, puis les a **retirés définitivement en mai 2026**. Le balisage `FAQPage` reste utile — il aide Google et les moteurs IA à comprendre et citer la page — mais **il n'affichera plus d'accordéon dans les résultats**. On garde la FAQ (pour les visiteurs et pour les réponses IA), on ne la vend plus comme un levier SERP.

### 0.3 Les données structurées ne sont pas absentes

`index.html` porte déjà un `LocalBusiness` complet, et les deux pages villes un `@graph` `Service` + `BreadcrumbList` + `FAQPage`. Le travail n'est donc pas « les ajouter » mais **les rendre exacts, complets et cohérents sur les 66 pages**, et **ne jamais déclarer dans le balisage ce qui n'est pas visible dans la page** (voir §2.3 : un écart réel a été détecté et corrigé aujourd'hui).

---

## 1. État des lieux vérifié dans le dépôt

| # | Point | Statut réel | Preuve / fichier |
|---|---|---|---|
| 1 | Google Business Profile | ❌ inconnu / à faire | aucune trace dans le dépôt |
| 2 | Matrice service × ville | ⚠️ 2 pages sur 66 | `femme-menage-casablanca.html`, `nounou-casablanca.html` |
| 3 | Données structurées | ✅ présentes, ⚠️ incomplètes | `LocalBusiness` (index), `Service` + `FAQPage` (2 pages villes) |
| 4 | `sitemap.xml` | ⚠️ existe, à automatiser | 4 URL, `lastmod` figé, aucune génération automatique |
| 5 | Robots / indexation | ✅ correct | `robots.txt` bloque `/admin`, `/api/` ; `candidature-confirmation.html` en `noindex` |
| 6 | Search Console | ⚠️ propriété créée, pas de suivi | fichier `googlee184c103eb04f93a.html` à la racine |
| 7 | Domaine propre | ❌ absent | tout est en dur sur `https://yallahservices-one.vercel.app` (canonicals, OG, sitemap, `@id` Schema) |
| 8 | Contenu des pages villes | ❌ **bloquant** | 364 et 418 mots, structure identique, 24 % de texte strictement identique |
| 9 | Maillage interne | ❌ insuffisant | les 2 pages villes ne se lient à aucune autre page ville ; les liens depuis l'accueil sont noyés dans le bandeau d'avertissement candidats |
| 10 | Citations / NAP | ❌ à faire | 2 numéros affichés, Gmail comme e-mail public, pas d'adresse |
| 11 | Mesure | ❌ à faire | aucun suivi par page, aucun tableau de bord |

**Outil ajouté aujourd'hui :** `outils/verifier-contenu.js` — contrôle bloquant du contenu local (volume, recopie entre pages, titles/descriptions en doublon, balisage, maillage). Il tourne sur l'état actuel et **échoue volontairement** : c'est la mesure du blocage.

```
node outils/verifier-contenu.js
→ 5 erreurs bloquantes : 2 pages trop courtes (364 / 418 mots),
  1 question déclarée en Schema mais absente du texte visible (corrigée depuis),
  2 pages sans aucun lien vers une page locale voisine.
```

---

## 2. Le blocage : le contenu (phase 0, non négociable)

### 2.1 Ce que dit la mesure

| Page | Mots (texte principal) | Recopie croisée | Problème |
|---|---|---|---|
| `femme-menage-casablanca.html` | 364 | 24 % | trop court, structure calquée |
| `nounou-casablanca.html` | 418 | 24 % | trop court, structure calquée |

Les deux pages ne sont pas des copies mot pour mot — le texte a été reformulé — mais elles partagent **le même squelette section par section** et près d'un quart des phrases. Si les 64 pages suivantes sont produites comme ça, le site devient exactement ce que Google appelle une **grappe de pages-portes (doorway pages)** : même contenu utile partout, seul le nom de la ville change. Risque : aucune indexation des nouvelles pages, puis déclassement de l'ensemble du domaine.

### 2.2 Ce qui rend un contenu local légitime

Une page n'est pas « originale » parce qu'elle a été reformulée. Elle est originale parce qu'**elle contient des informations qu'on ne trouve nulle part ailleurs**. Pour chaque ville, ces informations existent déjà chez vous, dans votre historique WhatsApp et vos placements :

- les **quartiers réellement desservis** (8 à 12 noms exacts, pas « Casablanca et environs ») ;
- les **questions réellement posées par les familles de cette ville** (copiées de votre boîte WhatsApp, anonymisées) ;
- les **délais réellement observés** pour présenter un profil dans cette ville, en haute et basse saison ;
- les **salaires réellement négociés** dans le cadre de votre grille, et pourquoi ils varient ;
- les **types de logements** dominants et ce que ça change (villa d'Anfa vs riad de la médina vs immeuble de Malabata) ;
- les **difficultés locales** (transport, quartiers excentrés, langues parlées par les candidates).

Un concurrent peut copier votre gabarit. Il ne peut pas copier vos données de terrain.

### 2.3 Procédure de production (à appliquer page par page)

1. **Fiche locale** — l'équipe de placement remplit les 15 questions de l'annexe B pour la ville (30 min, une seule fois par ville, réutilisée pour les 6 services).
2. **Fiche service** — 15 questions de l'annexe B côté métier (30 min, une fois par métier).
3. **Rédaction** — 900 à 1 200 mots à partir de ces deux fiches uniquement. Aucune recherche sur les sites concurrents pendant la rédaction (c'est la seule façon fiable de ne pas les copier).
4. **Contrôle** — `node outils/verifier-contenu.js` doit passer au vert : ≥ 600 mots (viser 900+), < 40 % de recopie avec toute autre page.
5. **Traçabilité** — chaque fait local est inscrit dans `contenu/sources-editoriales.md` (page, section, source : question WhatsApp du 12/09, placement n° X, note d'équipe du …). C'est votre défense en cas de réclamation et la preuve de l'originalité.
6. **Publication** en vagues de 6 à 8 pages maximum, jamais 60 d'un coup.

### 2.4 Les 2 pages existantes

Elles ne sont pas à jeter : l'ossature est bonne. Elles sont à **réécrire** avec les fiches locales Casablanca (ménage + nounou), puis à compléter par les 4 autres services Casablanca. Objectif : 900+ mots, zéro phrase partagée entre elles, FAQ tirée de vraies questions.

**Charge : 3 à 5 jours-homme** (fiches locales Casablanca + réécriture + passage au vert de l'outil).

---

## 3. Architecture cible

### 3.1 URLs — on reste à plat, volontairement

Le site est statique, sans serveur ni réécriture d'URL. On conserve donc le schéma actuel, qui évite 66 redirections et fonctionne sur tous les hébergeurs :

```
https://<domaine>/<service>-<ville>.html
```

| Service (slug) | Villes (slug) |
|---|---|
| `femme-menage` | `casablanca` · `rabat` · `marrakech` · `fes` · `tanger` · `agadir` · `meknes` · `oujda` · `kenitra` · `sale` · `tetouan` |
| `nounou` | idem |
| `cuisiniere` | idem |
| `chauffeur` | idem |
| `vigile` | idem |
| `garde-malade` | idem |

Plus **une page hub** : `services-par-ville.html` (« Nos services à domicile, ville par ville ») — c'est elle qui distribue le jus interne vers les 66 pages et qui évite l'effet « pages orphelines ».

Passage en dossiers (`/services/femme-menage/casablanca/`) : à envisager seulement au-delà de ~150 pages (extension aux quartiers). Pas maintenant.

### 3.2 Domaine propre — à faire avant les citations

Aujourd'hui, canonicals, Open Graph, `@id` Schema, `sitemap.xml` et `robots.txt` pointent tous vers `yallahservices-one.vercel.app`. Trois problèmes : impossible de changer d'hébergeur sans tout casser, `vercel.app` est un sous-domaine partagé (mauvais signal pour les annuaires et pour la fiche Google), et aucune marque dans l'URL.

**À faire (lot 1) :** acheter un domaine (`yallah.services`, `yallahservices.ma`…), le brancher sur l'hébergeur, rediriger en 301 l'ancien sous-domaine, puis **centraliser l'URL** : une seule variable `SITE_URL` utilisée par le générateur, le sitemap et les tests. `outils/verifier-contenu.js` contrôle déjà qu'un canonical ne part pas sur un autre domaine.

### 3.3 Gabarit commun (inchangé sur le fond)

Navigation allégée → fil d'Ariane → H1 → visuel → sections locales → FAQ → CTA WhatsApp pré-rempli (service + ville) → pied de page avec le hub et les pages voisines.
Ce qui change : **le contenu des sections** (§6) et **le maillage** (§3.4).

### 3.4 Maillage interne — règles fixes

- Chaque page ville-service lie : le hub, la **page du même service à Casablanca ou Rabat** (les 2 villes piliers), **3 pages voisines** (même service dans une ville proche, ou autre service dans la même ville), l'accueil, l'espace candidats.
- Le hub lie les 66 pages, groupées par métier puis par ville.
- L'accueil : remplacer les 2 liens perdus dans le bandeau candidats par un lien de pied de page **« Nos services par ville »** + une section courte « Nous intervenons dans 11 villes » qui pointe le hub.
- Ancres descriptives (`Femme de ménage à Casablanca`), jamais de liste de villes surchargée en pied de page.

### 3.5 `sitemap.xml` automatique

Écrire `generer-sitemap.js` qui scanne les pages publiées, lit la date du dernier commit Git de chacune pour `lastmod`, écrit `sitemap.xml` + vérifie que chaque page y est en une seule fois. **Aucune page publiée sans être dans le sitemap**, et re-soumission dans Search Console après chaque vague. `build-site.js` appellera ce script.

---

## 4. Le plan, en 6 lots

| Lot | Contenu | Charge | Semaine | Critère de sortie (DoD) |
|---|---|---|---|---|
| **0 — Déblocage** | Fiches locales Casablanca + 6 fiches métier ; réécriture des 2 pages ; registre des sources ; outil de contrôle opérationnel | 4–5 j | S1–S2 | `verifier-contenu.js` vert sur les 2 pages, ≥ 900 mots, < 25 % de recopie entre elles |
| **1 — Socle** | Domaine propre + 301 + `SITE_URL` centralisée ; hub `services-par-ville.html` ; gabarit validé ; `generer-sitemap.js` ; maillage accueil ↔ hub ↔ pages | 3–4 j | S1–S3 | 1 page test complète, 100 % des URL en `yallah.services`, sitemap généré, hub en ligne |
| **2 — Google Business Profile** | 1 profil « zone de service » (Casablanca), catégories, 6 services, 20+ photos réelles, description, Q&R, posts, collecte d'avis | 2–3 j | S2–S4 | Profil **vérifié**, 15 avis réels, 0 adresse inventée |
| **3 — Citations & NAP** | NAP canonique figé, 10–12 citations marocaines, reprise des profils sociaux, contrôle de cohérence | 2–3 j | S3–S5 | 10 citations en ligne, NAP identique caractère pour caractère |
| **4 — Matrice (Lot A)** | 10 pages : Casablanca + Rabat × 6 services (dont 2 réécrites en lot 0) | 12–15 j | S4–S8 | 10 pages vertes, publiées en 2 vagues, indexées |
| **5 — Matrice (Lot B)** | 24 pages : Marrakech, Tanger, Agadir, Fès × 6 services | 25–30 j | S8–S18 | idem + 1 bilan de position par page à J+30 |
| **6 — Matrice (Lot C)** | 30 pages : Meknès, Oujda, Kénitra, Salé, Tétouan × 6 services — le rythme dépend de la production de contenu (fiches locales), pas de la couverture : ces villes sont desservies | 30–35 j | S18–S30 | idem |
| **7 — Mesure continue** | Search Console, suivi par page, seuils de décision, arbitrages | 0,5 j/semaine | dès S1 | Tableau de bord à jour chaque lundi |

**Charge totale : ~80–95 jours-homme de contenu**, soit 4 à 5 mois à 2 h/jour pour une personne, ou 2 mois à temps plein. C'est le vrai coût d'un travail qui ne se fait pas sanctionner.

> ⚠️ La contrainte n'est **pas** la ville (toutes sont desservies) mais **la matière locale disponible** pour la remplir : une page pour Tétouan ou Oujda est légitime dès lors qu'elle contient de vraies informations de terrain (quartiers, délais observés, questions des familles de cette ville). La fiche locale de l'annexe B reste donc **obligatoire avant rédaction**. Sans elle, on tombe dans la page-porte — et c'est la qualité du contenu, pas le nombre de placements passés, qui décide.

---

## 5. Matrice des lots

Légende : **A** = lot A (S1–S8) · **B** = lot B · **C** = lot C (rythme de production, villes desservies)

| Service \ Ville | Casa | Rabat | Marrakech | Tanger | Agadir | Fès | Kénitra | Salé | Meknès | Oujda | Tétouan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Femme de ménage | A | A | B | B | B | B | C | C | C | C | C |
| Nounou | A | A | B | B | B | B | C | C | C | C | C |
| Cuisinière | A | A | B | B | B | B | C | C | C | C | C |
| Garde-malade | A | A | B | B | B | B | C | C | C | C | C |
| Chauffeur | A | A | B | B | B | B | C | C | C | C | C |
| Vigile / gardien | A | A | B | B | B | B | C | C | C | C | C |

Deux remarques de capacité, à trancher avant le lot 4 — elles ne concernent pas la couverture géographique (les 11 villes sont desservies), mais la **qualification des profils** :

- **Chauffeur et vigile** sont des métiers à exigences documentaires (permis, expérience vérifiable, références) et souvent une demande d'entreprise plutôt que de foyer. Les pages se font — les villes sont desservies — mais à condition de pouvoir présenter des profils qualifiés derrière : une page qui ne convertit pas coûte en crédibilité.
- **La prestation à la journée n'existe qu'à Casablanca et Rabat** (grille officielle). Aucune page d'une autre ville ne doit la promettre. C'est exactement le genre d'incohérence entre une page et la réalité qui tue la confiance — et qui se retourne en avis négatifs.

### Lot A — les 10 URL à produire en premier

```
/femme-menage-casablanca.html      (réécriture)
/nounou-casablanca.html            (réécriture)
/cuisiniere-casablanca.html
/garde-malade-casablanca.html  |  /chauffeur-casablanca.html  |  /vigile-casablanca.html
/femme-menage-rabat.html       |  /nounou-rabat.html          |  /cuisiniere-rabat.html
/garde-malade-rabat.html       |  /chauffeur-rabat.html       |  /vigile-rabat.html
+ /services-par-ville.html          (hub, lot 1)
```

---

## 6. Gabarit d'une page service × ville (spécification)

| # | Section | Longueur | Source obligatoire (unicité) |
|---|---|---|---|
| 1 | H1 + intro | 120–180 mots | quartiers réels + type de logement dominant + promesse locale |
| 2 | « Ce que change le contexte local » | 180–250 mots | bâti, transport, saisonnalité observée dans la ville |
| 3 | Prestations et ce qui est inclus / exclu | 150–220 mots | fiche métier (périmètre réel, tâches hors périmètre) |
| 4 | Zones desservies | 8–12 quartiers | liste réelle, vérifiable sur une carte |
| 5 | Tarifs | grille officielle | ⚠️ bloc commun autorisé **une seule fois par page**, jamais deux |
| 6 | Déroulé local en 4 étapes | 120–180 mots | délais réellement observés dans cette ville |
| 7 | FAQ | 5–6 Q/R, 60–120 mots chacune | questions réellement reçues sur WhatsApp |
| 8 | Preuve locale (avis client réel) | 40–80 mots | prénom + quartier + service, **avec accord écrit**. Rien à publier = pas de bloc |
| 9 | Bloc candidats de la ville | 60–90 mots | lien vers `candidature.html` |
| 10 | CTA WhatsApp | — | message pré-rempli service + ville |
| 11 | Maillage | 4–6 liens | hub + voisines (§3.4) |

**Cibles SEO par page**

- `title` : `Femme de ménage à Casablanca | Yallah Services` — **≤ 60 caractères** (les titles actuels font 65 à 76 caractères et sont tronqués).
- `meta description` : **120–165 caractères**, avec un fait local concret + une action (les descriptions actuelles font 182 à 195 caractères).
- H1 unique contenant `Service + Ville`. Un seul `h1` par page (`candidature.html` en a deux, à corriger).
- Balisage : `Service` (avec `areaServed`, `provider` → le `LocalBusiness` de l'accueil) + `BreadcrumbList` + `FAQPage`. **Interdit** : `aggregateRating` sur vos propres avis collectés par vous (avis auto-déclaré = non conforme) ; question déclarée dans la FAQ sans texte visible équivalent.
- Un lien interne sortant vers le hub et 3 voisines minimum.

**Interdits de rédaction :** copier un concurrent même en reformulant ; phrase de gabarit identique d'une ville à l'autre ; liste de quartiers inventée ; chiffres d'activité non vérifiés (« 500+ familles » sur l'accueil : à documenter ou à retirer, c'est le genre d'affirmation qu'un client mécontent peut contester publiquement).

---

## 7. Google Business Profile — mode d'emploi (lot 2)

**À faire**

1. Créer **un** profil, catégorie principale liée à l'aide à domicile / mise en relation de personnel de maison, catégories secondaires pour ménage et garde d'enfants.
2. Mode **zone de service** avec l'adresse réelle en base et **masquée** (jamais de boîte postale ni de bureau virtuel : suspension quasi systématique).
3. Zone de service : les villes où vous intervenez réellement, pas les 11 par défaut. Une zone trop large dilue.
4. Six services déclarés (ménage, nounou, cuisine, garde-malade, chauffeur, gardiennage) + description de 750 caractères reprenant la promesse et le périmètre réel.
5. **20 photos minimum**, réelles : logo, équipe (avec accord), avant/après si les clients acceptent, flyer de grille tarifaire. Pas de banque d'images.
6. **Q&R** : coller les 8 questions les plus fréquentes avec vos réponses (mêmes textes que les FAQ des pages, c'est cohérent et ça occupe la fiche).
7. **Posts** : 1 par semaine, réutilisés depuis WhatsApp/Instagram.
8. **Avis** : demander systématiquement après un placement, avec le lien direct. Les avis sont un facteur de classement local **et** le premier critère de choix sur ce type de service. Objectif réaliste : 15 avis en 90 jours. Répondre à tous, y compris négatifs.
9. **Vérification** : compter sur la vidéo de vérification (30 s à 5 min, sans visage ni document bancaire) montrant adresse, activité et preuve de gestion. Préparer : panneau/numéro visible, devis ou contrat type, échanges WhatsApp pro, page du site ouverte sur l'ordinateur.

**À ne pas faire (suspension)**

- un profil par ville sans équipe sur place ;
- adresse d'un tiers, domicile d'un proche, coworking sans personnel ni enseigne ;
- une zone de service couvrant tout le Maroc ;
- acheter des avis, échanger des avis, demander des avis à une seule personne pour plusieurs profils.

---

## 8. Citations locales & NAP (lot 3)

### 8.1 NAP canonique — à figer maintenant

| Élément | Valeur canonique proposée | Règle |
|---|---|---|
| Nom | `Yallah Services` | identique partout, sans « SARL », sans slogan |
| Adresse publique | aucune (mode zone de service) | ne jamais inventer une adresse pour remplir un annuaire |
| Villes | `Casablanca · Rabat · Marrakech · Fès · Tanger · Agadir · Meknès · Oujda · Kénitra · Salé · Tétouan` | même ordre à chaque fois |
| Téléphone public | `+212 691 733 585` (foyers) | le `+212 710 359 446` **uniquement** sur les pages candidats |
| E-mail | `contact@<domaine>` dès l'achat du domaine | remplacer le Gmail, qui est un signal faible et peu rassurant |
| Site | `https://<domaine>/` | jamais `*.vercel.app` dans une citation |

Trois incohérences existantes à corriger au passage : Instagram `yallahservice`, TikTok `yallah.services.m`, Facebook `yallahservicesmaroc` — soit trois noms de marque différents pour un même annuaire d'identités.

### 8.2 Où s'inscrire (par ordre de valeur)

| Priorité | Plateforme | Type |
|---|---|---|
| 1 | Google Business Profile | obligatoire |
| 1 | `pagesjaunes.ma` | annuaire généraliste marocain de référence |
| 1 | `telecontact.ma` | annuaire marocain ancien et indexé |
| 2 | `annuaire-gratuit.ma`, `adresses.ma` | annuaires locaux avec fiches indexables par métier + ville |
| 2 | `kompass.com` (Maroc), `kerix.net` | annuaires B2B (utiles si l'offre entreprises se développe) |
| 2 | Bing Places, Apple Business Connect | import rapide depuis la fiche Google |
| 2 | Pages Facebook / Instagram / TikTok / LinkedIn | même nom + même URL + même ville dans la fiche |
| 3 | `avito.ma` (rubrique Services), presse locale, associations | visibilité + demande, valeur SEO secondaire |

**Cadence :** 2 à 3 citations par semaine pendant 4 semaines, tenue à jour dans un tableau (`nom · URL de la fiche · date · NAP conforme oui/non · identifiants de connexion`). Une citation exacte vaut mieux que dix approximatives. Aucun achat de « pack de backlinks » : sur un site qui débute, c'est un risque de pénalité pour un gain nul.

---

## 9. Search Console & pilotage (lot 7)

1. Propriété `https://<domaine>` (fichier de vérification déjà présent, à refaire sur le nouveau domaine) : soumettre `sitemap.xml`, puis re-soumettre après chaque vague.
2. Chaque lundi, 20 minutes : pages indexées / non indexées, requêtes par page, position moyenne des 20 requêtes prioritaires, clics vers WhatsApp (à mesurer par un paramètre `?src=page` sur les liens `wa.me`).
3. **Seuils de décision**
   - page indexée mais 0 impression à J+60 → titre/description/FAQ à revoir ;
   - 0 impression à J+90 → fusionner avec la page pilier ou supprimer (et 301 vers le hub) ;
   - position 11–20 avec impressions → la page mérite 300 mots de plus et 2 liens internes ;
   - position 1–3 sans clic → l'extrait (title/description) est à réécrire ;
   - ville sans aucune impression sur 6 services à J+90 → pas de demande captable pour l'instant : garder la page (la ville reste desservie) mais arrêter d'y investir du contenu supplémentaire.
4. **Ce qui se mesure vraiment ici :** appels et messages WhatsApp. Les positions servent à décider, pas à communiquer.

**Objectifs à 90 jours (mesurables, non extrapolés) :** 28 pages conformes en ligne · profil Google vérifié · 15 avis · 10 citations · 30 requêtes en top 50 · 5 requêtes en top 10 · trafic WhatsApp tracé depuis les pages villes. Les volumes de recherche ne seront repris que des chiffres réels de Search Console après 30 jours — jamais d'estimations inventées dans un rapport.

---

## 10. Erreurs à ne pas commettre

- ❌ Publier 60 pages d'un coup avec le même gabarit.
- ❌ Créer des profils Google par ville, ou une adresse fictive sur un annuaire.
- ❌ Déclarer dans le balisage ce qui n'est pas visible sur la page.
- ❌ Promise de service à la journée hors Casablanca/Rabat.
- ❌ Inventer des quartiers, des délais, des avis ou des chiffres.
- ❌ Faire traduire automatiquement les pages en arabe et les publier telles quelles (l'arabe viendra plus tard, écrit par un arabophone, en commençant par Casablanca — et seulement si Search Console montre des requêtes en arabe).
- ❌ Croire que la FAQ dépliée reviendra dans Google.

---

## 11. Ce qui est automatisable ensuite

| Script | Rôle | Statut |
|---|---|---|
| `outils/verifier-contenu.js` | contrôle bloquant du contenu local | ✅ livré aujourd'hui |
| `generer-sitemap.js` | sitemap auto + `lastmod` depuis Git | à écrire (lot 1) |
| `generer-pages-villes.js` | assemble les pages depuis un fichier de contenu par page, **refuse** de générer tant que les champs locaux obligatoires sont vides | à écrire après validation du gabarit |
| `outils/verifier-site.js` (extension) | intégrer les pages villes + contrôle du domaine unique | lot 1 |

Le générateur ne doit jamais « inventer » : il assemble un contenu déjà écrit et validé. C'est la garantie mécanique contre les pages-portes.

---

## Annexe A — Checklist avant publication d'une page

- [ ] Fiche locale remplie et archivée (annexe B), fiche service idem
- [ ] 900+ mots utiles, aucun paragraphe copié d'une autre page
- [ ] `node outils/verifier-contenu.js` → 0 erreur
- [ ] Title ≤ 60 car., description 120–165 car., H1 unique
- [ ] Faits locaux tracés dans `contenu/sources-editoriales.md`
- [ ] 4–6 liens internes (hub + voisines), lien candidats, CTA WhatsApp avec `?src=`
- [ ] Page ajoutée au sitemap, publication dans la vague prévue
- [ ] Après publication : inspection d'URL dans Search Console, contrôle à J+7 et J+30

## Annexe B — Les 15 questions qui produisent le contenu

**Par ville** (30 min, une fois, réutilisée pour les 6 services)

1. Quels quartiers desservez-vous réellement ? (8 à 12 noms exacts)
2. Combien de placements avez-vous faits ici depuis 12 mois ? (chiffre réel)
3. Quels types de logements dominent (villa, riad, appartement, ferme) et qu'est-ce que ça change ?
4. Quels sont les 3 profils les plus demandés dans cette ville ?
5. Quelles sont les 5 questions que les familles d'ici posent le plus souvent sur WhatsApp ? (copier-coller les messages, anonymisés)
6. Quels salaires sont réellement négociés ici dans le cadre de la grille, et pourquoi les écarts ?
7. Combien de temps prenez-vous pour présenter un profil ici, en moyenne, en haute saison ?
8. Quelles difficultés locales rencontrez-vous (transport, quartiers excentrés, langues) ?
9. Y a-t-il des périodes où la demande explose (Ramadan, rentrée, été, vacances) ?
10. Des profils refusent-ils cette ville ? Pourquoi ?
11. La formule logée est-elle courante ici ?
12. Quelles langues parlent les candidates de cette ville ?
13. Avez-vous un témoignage client réel ici (prénom + quartier + accord écrit) ?
14. Quelles erreurs font les familles d'ici quand elles recrutent ?
15. Avez-vous une adresse ou un point de contact réel ici ? (condition pour un profil Google local)

**Par métier** (30 min, une fois)

1. Que comprend exactement la formule standard, et qu'est-ce qui n'est **pas** compris ?
2. Quelles sont les 3 erreurs de brief les plus fréquentes des familles ?
3. Que vérifiez-vous systématiquement avant de proposer un profil ?
4. Quelle différence avec le métier voisin (cuisine simple vs cuisine + ménage) ?
5. Quels sont les critères réels de sélection (expérience, langues, références, âge) ?
6. Quels motifs de remplacement reviennent le plus ? Que couvrent les formules Premium et Sérénité ?
7. Combien de temps pour trouver un profil, réalistement, en haute saison ?
8. Quels tarifs, et qu'est-ce qui les fait varier ?
9. Formule logée : dans quelles conditions ?
10. Comment se passent les 7 premiers jours / la période d'essai ?
11. Quelles questions reviennent au téléphone, mot pour mot ?
12. Quels sont les signaux d'alerte côté famille ?
13. Que se passe-t-il si le profil ne convient pas la première semaine ?
14. Quelles tâches sont hors périmètre ?
15. Comment se fait le suivi après le placement ?
