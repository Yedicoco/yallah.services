# Audit de conformité — affirmations du site face à la fiche entreprise

**Date :** 2 octobre 2026 · **Référentiel :** `contenu/fiche-entreprise.md` § « Informations à ne jamais inventer ».
**Objet :** chaque affirmation publiée a été comparée à la fiche. Ce document liste ce qui a été
corrigé, ce qui reste à confirmer par la direction, et ce qui manque au site.

---

## 1. Corrigé immédiatement (contraire à la fiche ou non vérifiable)

| # | Affirmation publiée | Emplacement | Pourquoi c'est un problème | Correction appliquée |
|---|---|---|---|---|
| 1 | « Personnel **subsaharien** qualifié » | `index.html` : `<title>`, `og:title`, `keywords`, pied de page, bandeau, `README.md` | L'origine n'est pas un critère de la fiche. Cibler une clientèle ou un personnel par origine ethnique crée un **risque juridique** (discrimination) et un risque de refus sur Google Ads / Meta Ads. Aucune page du site ne doit se positionner ainsi. | Remplacé par « personnel de maison et services » / « personnel sélectionné selon vos besoins » |
| 2 | Champ **« Préférence nationalité : Subsahariennes uniquement »** | `index.html`, 2 formulaires clients (`mfNat`, `ctNat`) | Même problème, mais **dans un formulaire** : le client choisissait explicitement l'origine du personnel. Inacceptable en l'état. | Options remplacées par **« Déjà expérimentée » / « Pas de préférence »** (critère : expérience) |
| 3 | « **Profils vérifiés** », « Personnel vérifié & formé », « vérifié » | hero, bandeaux de confiance, `og:description`, ligne de pied de page | La fiche interdit d'affirmer les **vérifications d'identité, contrôles d'antécédents et qualifications** sans confirmation. | « **Profils sélectionnés — selon vos critères** » |
| 4 | « **Réponse sous 24h** », « profil en 24h », « Profil reçu dans les 24h », « en moins de 24h » | hero, formulaire, section « comment ça marche », `og:description`, page de confirmation, pages villes | La fiche interdit d'affirmer un **délai de recrutement ou de mise en relation** non confirmé. | Retiré → « Réponse sur WhatsApp », « Nous revenons vers vous sur WhatsApp » |
| 5 | « **500+ familles accompagnées** » | statistique du hero | Chiffre non fourni par la direction : invérifiable et potentiellement contestable. | Remplacé par « **2 ans d'activité au Maroc** » (donnée confirmée) et « **10 villes desservies** » |
| 6 | « **Remplacement garanti** » (15 occurrences) | cartes des packs | Garantie de remplacement = affirmation interdite sans confirmation écrite. La fiche tarifaire lie le remplacement aux formules **Premium (6 mois)** et **Sérénité (2 mois)**. | « **Remplacement selon la formule** » |
| 7 | Villes **Meknès, Oujda, Tétouan** | pied de page, 3 listes déroulantes clients, liste candidats | Hors de la liste d'intervention confirmée. Afficher une ville non desservie = promesse non tenue. | Remplacées par **Mohammedia, Témara, Bouskoura**, puis **Dar Bouazza** et **Bouznika** (zones servies confirmées par des clientes réelles) |
| 8 | « Réservé aux **foyers** … » | bandeau permanent, hero, popup, README | Le site s'adressait uniquement aux particuliers alors que la fiche décrit **deux marchés** (B2C **et** B2B). | « Réservé aux **particuliers et aux entreprises** qui recrutent » |
| 9 | « **Agence N°1** » | `README.md` uniquement (pas sur le site) | Affirmation de supériorité non étayée. | Corrigée dans le README |
| 10 | « remplacements **jusqu'à ce que vous soyez pleinement satisfait(e)** », « remplacement **dans les meilleurs délais** », « vous n'êtes **jamais** laissé(e) sans solution », « Suivi & **garantie** » | FAQ, section garanties | Promesses absolues de résultat et de délai = interdites par la fiche. | Reformulé sur le périmètre réel des formules : « remplacements prévus par la formule choisie, pendant la période indiquée » |

## 2. À confirmer par la direction (non modifié, en attente)

| # | Élément | Emplacement | Question à trancher |
|---|---|---|---|
| A | **Grille tarifaire** (3 500 → 5 000 DH) et prestations à la journée (300–700 DH) | packs, select des services, README | La grille vient du flyer officiel — donc confirmée à l'origine. Elle doit être **revalidée** (montants, villes concernées) avant toute nouvelle campagne, car la fiche classe les prix en « information à ne jamais affirmer sans confirmation ». |
| B | **Frais de mise en relation** Premium 1 000 DH / Sérénité 500 DH | section « frais » | Idem + préciser ce que chaque formule couvre exactement (remplacements, durée, conditions). |
| C | ~~3 avis clients (Fatima, Karim, Nadia)~~ **RÉSOLU** | section « avis » | Faux noms (« Karim », « Nadia ») et **faux visages** : trois portraits de banque d'images/IA présentés comme des clients. | Remplacés par les **4 clientes réelles** (Fatima Zahra · Bouskoura, Mme Wafae · Tamaris, Basma H. · Rabat, Mme Najiba · Bouznika), avatars **initiales**, photos de tiers supprimées. Textes en attente des mots exacts — publication bloquée par `verifier-contenu.js` jusque-là. |
| D | « Personnel **logé 24h/24, 7j/7** » | description des formules logées | Formulation à préciser : présence sur place, avec jour(s) de repos — la formulation actuelle peut laisser croire à une disponibilité permanente. |
| E | **Slogan** « Simplifiez-vous la vie ! » vs signature de la fiche « Votre besoin en personnel, notre priorité. » | hero, README | Deux signatures cohabitent. Laquelle est la signature officielle ? La seconde peut devenir la baseline de l'accueil. |
| F | **E-mail public** `servicesyallah@gmail.com` | tout le site | Une adresse au domaine (`contact@…`) renforcerait la crédibilité et le référencement. |
| G | **Domaine propre** | canonicals, OG, sitemap, Schema | Tout pointe encore sur `yallahservices-one.vercel.app`. À basculer (voir `plan-seo-local.md` §3.2). |
| H | « **Sans engagement** », « Gratuit » (formulaire) | formulaire d'accueil | Conforme a priori (aucun frais pour demander un profil) — à confirmer pour éviter toute ambiguïté. |

## 3. Manques du site par rapport à la fiche (à créer)

| # | Manque | Impact |
|---|---|---|
| 1 | **Aucune page B2B** : hôtels, riads, restaurants, chantiers, sociétés de nettoyage, événementiel, main-d'œuvre / manœuvres | C'est **la moitié de l'activité décrite** et zéro page ne la représente. Aucune chance d'être trouvé sur « personnel hôtellerie Marrakech », « manœuvres chantier Casablanca ». |
| 2 | Aucune mention des **besoins temporaires / journaliers / renfort** | Requêtes à forte intention commerciale non couvertes. |
| 3 | Aucune page **entreprise / à propos** | La fiche décrit une structure, une mission, un positionnement : rien n'est présenté aux visiteurs. |
| 4 | **Bouskoura** absent du site | Pôle résidentiel prioritaire (Ville Verte, villas) traité comme une simple extension de Casablanca. |
| 5 | Villes confirmées absentes : **Mohammedia, Témara** | Demandes perdues, aucune page pour les capter. |
| 6 | Aucune **page « quartiers »** | La cartographie de ciblage (Anfa, Souissi, Palmeraie, Malabata, Founty…) n'est exploitée nulle part — voir la règle du plan (§3.6). |
| 7 | Aucun **suivi de conversion WhatsApp** | Impossible de mesurer ce que rapportent les pages (§9 du plan). |
| 8 | **Dar Bouazza et Bouznika** n'apparaissaient dans aucune liste | Deux clientes réelles y sont établies : zones servies mais non affichées. | Ajoutées à la couverture, aux listes du site et au plan |

## 3 bis. Décisions prises le 2 octobre 2026 (pour ne pas bloquer la production)

| Sujet | Décision | Raison |
|---|---|---|
| **Tarifs** | Conservés tels quels (grille du flyer officiel) | C'est la seule source chiffrée validée par la direction. Ils sont publiés comme « repères », avec la mention que le montant dépend des tâches et des horaires. À revalider avant toute campagne. |
| **Avis clients** | Publiés comme **« missions réalisées »** : nom + ville réels, texte = synthèse de mission rédigée par l'agence, **sans guillemets et sans étoiles** | Les 4 clientes sont réelles (information de la direction). Aucune note ni citation ne peut être affichée sans leurs mots. Suivi des consentements : `contenu/valider-avis.md` (rappel affiché à chaque contrôle). |
| **Signature** | « Yallah Services — Votre besoin en personnel, notre priorité. » ajoutée sous le hero ; la mention du flyer reste inchangée | La fiche entreprise donne cette signature comme référence. |
| **Pages villes** | Produites avec les faits confirmés (grille, secteurs de ciblage, formules), **sans** délais ni chiffres de terrain inventés | La fiche interdit d'affirmer ce qui n'est pas confirmé. Les questions restées ouvertes sont listées dans `contenu/fiche-locale-casablanca.md`. |
| **Dar Bouazza et Bouznika** | Ajoutés à la couverture | Deux clientes réelles y sont établies : c'est une preuve de service. |

## 4. Ce qui est conforme et ne change pas

- Grille des 14 services et prestations à la journée (source : flyer officiel).
- « Paiement des frais après validation du profil » · « Gratuit pour les candidats ».
- Deux numéros WhatsApp distincts (clients / candidats) et l'e-mail unique.
- Parcours candidat (fiche, références obligatoires, consentement loi 09-08).
- Comptes officiels en pied de page : Facebook, Instagram, TikTok, LinkedIn — **identiques** à la fiche.
- Mention « Demandes d'emploi non acceptées » sur le parcours client (séparation des deux publics).

---

## 5. Contrôle du 5 octobre 2026 (après la PR #17, fusionnée)

**Contrôles exécutés — tous verts :** `outils/verifier-site.js` (0 erreur · 1 avertissement : les
4 pages locales fines non traduites, déjà en `noindex`), `outils/verifier-contenu.js`,
`outils/verifier-seo.js` (source **et** `site-a-mettre-en-ligne/`), `outils/generer-i18n.js --verifier`,
`outils/extraire-i18n.js --verifier`, `outils/tester-messages.js`, `node build-site.js`, `node --check`.

**Test DOM multilingue débloqué :** `jsdom` installé hors du dépôt (le dépôt n'a pas de `package.json`),
`outils/tester-i18n.js` passe — 77 vérifications : chargement direct dans les 4 affichages et parcours
réel par clic (français → darija → darija latine → anglais → retour français).

| Point suivi | Résultat du contrôle | Décision / suite |
|---|---|---|
| **PDF de référence** | Aucun `.pdf` retrouvé dans le dépôt, l'espace de travail, l'historique Git (clone à 1 commit) ni les pièces jointes GitHub (aucune issue, aucune release). À la date du contrôle (05/10/2026), le **flyer officiel** de la grille tarifaire, attendu en `assets/img/grille-tarifaire.jpg`, était également absent. | **Résolu le 06/10/2026 pour le guide** : fourni par la direction et poussé dans `doc/guide-schema-corrige-yallah-services.pdf` → conformité point par point en §6. **Flyer tarifaire fourni le 07/10/2026** : intégré dans `assets/img/grille-tarifaire.jpg` et présent dans la version statique générée. |
| **G — Domaine propre** | Résolution DNS vérifiée le 05/10/2026 : `yallah.services`, `www.yallah.services`, `yallahservices.ma`, `yallah-services.ma`, `yallah.ma` et `yallahservices.com` → **NXDOMAIN**. Seul `yallahservices-one.vercel.app` existe. | Rien à basculer : canonicals, OG, sitemaps, `robots.txt` et `llms.txt` restent sur le domaine Vercel. Quand le domaine répondra : `url` dans `site.config.json` → `node build-site.js` → contrôles. Le contrôle 7.4 de `verifier-contenu.js` signalera alors toute URL restée sur l'ancien hébergement. |
| **Affirmations géographiques** | `llms.txt` (et sa copie `seo-pack/llms.txt`) listait encore **Meknès**, retirée du périmètre → corrigé : couverture réécrite depuis `site.config.json` (13 zones confirmées, autres demandes étudiées au cas par cas), marché B2B et numéro candidats ajoutés ; `build-site.js` copie désormais `llms.txt` dans le paquet statique. Statistique du hero « **10 villes** » en contradiction avec les 13 zones confirmées (README : « 13 zones », listes des formulaires) → « **13 villes** », dictionnaires dar / dar-latn / en régénérés. | Conforme. Contrôle automatique ajouté (§7.1 et §7.2 de `verifier-contenu.js`) : une ville retirée ou une ville non confirmée dans un formulaire bloque désormais la publication. |
| **Affirmations commerciales** | Aucune promesse interdite sur les 53 surfaces publiées (pages, page de confirmation, `llms.txt`, `robots.txt`, sitemaps, dictionnaires de traduction) : ni délai de 24 h, ni garantie de remplacement ou de résultat, ni « profils vérifiés », ni « agence n°1 », ni « 500+ familles », ni critère d'origine. Les formulations négatives (« aucune garantie de résultat », « sans garantie de desserte quartier par quartier ») sont conformes et le contrôle les reconnaît comme telles. | Conforme. Contrôle automatique ajouté (§7.3 de `verifier-contenu.js`). |
| **D — « logé 24h/24, 7j/7 »** | La formulation a disparu des pages : la formule logée est décrite avec « une chambre disponible et un jour de repos défini avec vous ». | Point à clore, sauf avis contraire de la direction. |
| **Formulaires clients** | Doublon dans la liste de villes `#ctCity` de `index.html` (« Dar Bouazza » et « Bouznika » proposés deux fois — reste du remplacement des villes retirées) → supprimé, et `site-a-mettre-en-ligne/` régénéré. | Conforme. Contrôle des options en double ajouté à `verifier-site.js` (§5). |
| **C — Consentements aux avis** | **Toujours 4 accords manquants** (`contenu/valider-avis.md`). Aucun écrit des clientes n'est présent dans l'espace de travail : l'archivage ne peut pas être produit par l'outillage, et cocher les cases sans preuve serait une fausse déclaration (loi 09-08). | Le dossier d'archivage `contenu/avis/` est désormais exclu de Git (`.gitignore`). Reste à envoyer les messages de `contenu/recueillir-avis.md`, archiver les captures dans `contenu/avis/`, cocher les 4 cases, puis publier les avis **dans les mots des clientes**. |
| **A / B — Tarifs et frais de mise en relation** | Publiés comme repères, issus de la grille officielle (flyer) ; inchangés. | À revalider par la direction avant toute campagne. |

---

## 6. Conformité au guide de référence `doc/guide-schema-corrige-yallah-services.pdf` (6 octobre 2026)

**Document retrouvé** : 10 pages, « Orientation corrigée — SEO et données structurées de Yallah Services »,
poussé sur `main` dans `doc/`. Chaque prescription a été comparée au balisage réellement publié, puis
corrigée. Les contrôles correspondants sont maintenant automatiques (`outils/verifier-seo.js`).

| Prescrit par le guide | État du site avant | Correction appliquée |
|---|---|---|
| **§1** Une seule entité organisationnelle (`EmploymentAgency`), avec un **`@id` permanent** et les informations centralisées : nom, URL canonique, logo, téléphone, e-mail, langues, réseaux réels, zones couvertes | Conforme : `EmploymentAgency` avec `@id …/#business` sur l'accueil, référencée par `@id` depuis toutes les pages (`provider`, `publisher`) ; `sameAs` = les 4 comptes réels de la fiche | `knowsLanguage` complété et normalisé : `["fr","ar-MA"]` → `["fr-MA","ar-MA","ar-Latn-MA","en"]` (les 4 affichages réellement publiés, cf. `assets/js/i18n.js`) ; `contactPoint.availableLanguage` → `["fr-MA","ar-MA"]`. Contrôle automatique : les 8 informations centralisées du guide §1 sont désormais exigées sur l'accueil |
| **§1** Pas d'adresse inventée, pas de faux établissements locaux ; `LocalBusiness` réservé à une implantation publique réelle et vérifiable | Conforme : aucune adresse ni `LocalBusiness` sur les pages service × ville | Verrouillé : `verifier-seo.js` refuse toute `address` publiée hors accueil et toute entité organisationnelle redéclarée sur une autre page. **Écart assumé** : l'`PostalAddress` de l'accueil est conservée — c'est la base réelle (`site.config.json` : Casablanca, Hay Hassani 20220), publiée sans rue ni numéro, donc sans exposer l'adresse exacte |
| **§2** Une page service/ville se lit comme « nous pouvons traiter une demande située à X », pas « nous avons une agence à X » ; le JSON-LD doit relier organisation centrale, service, zone (`areaServed`), page et fil d'Ariane | Partiel : `Service` + `provider` (@id) + `areaServed` (City) + `BreadcrumbList` + `FAQPage`, mais **aucun nœud `WebPage`**, pas d'`@id` sur le fil d'Ariane, ville sans pays | Nœud `WebPage` ajouté (`#page`, `url`, `name`, `headline`, `description`, `inLanguage`, `isPartOf` → `#website`, `about` → `#service`, `publisher` → `#business`, `breadcrumb` → `#breadcrumb`), `@id` du fil d'Ariane ajouté, `containedInPlace` (Country : Maroc) ajouté à la ville. Le tout dans `outils/generer-pages-villes.js` : les 6 pages sont régénérées et toute page future hérite du modèle |
| **§2** Modèle `@graph` partout (accueil et hubs compris) | `@graph` présent sur toutes les pages ✓ | `WebPage` ajouté sur `index.html` et `personnel-entreprises.html` ; `services-par-ville.html` et `candidature.html` complétés (`url`, `headline`, `inLanguage`, `publisher`, `breadcrumb`, `@id` du fil d'Ariane) |
| **§3.B** Formulations du processus (« nous étudions votre besoin », « nous recherchons un profil correspondant »…), ni candidat précis ni délai fixe promis | Conforme : délais retirés, « profils sélectionnés selon vos critères », « le délai dépend du besoin, de la ville et des profils disponibles » | Inchangé ; contrôlé automatiquement (`verifier-contenu.js` §7.3) |
| **§3.C / §4** Pages utiles et non clonées ; pages combinées uniquement là où les demandes sont réellement traitées | Conforme : 6 pages Casablanca de 869 à 1 514 mots, recopie < 40 % ; les 4 pages fines (Rabat, Marrakech, Tanger) sont en `noindex` et hors sitemap tant que le contenu local n'est pas validé | Inchangé |
| **§5** `FAQPage` seulement si les questions/réponses sont visibles dans la page | Conforme, et déjà bloquant : chaque réponse déclarée doit exister dans le texte visible | Inchangé. Rappel : Google a supprimé les résultats enrichis FAQ le 7 mai 2026 — le balisage reste valide et utile aux autres moteurs et aux assistants, mais ne produit plus d'accordéon dans Google (déjà noté au plan §0.2) |
| **§5** `Offer` uniquement pour un tarif clairement affiché et applicable ; sinon fourchette ou « tarif selon le besoin », jamais un prix fixe trompeur | `OfferCatalog` « Frais de mise en relation » : 500 et 1 000 DH, affichés sur la page ✓ — **mais** les noms d'`Offer` annonçaient « remplacements **gratuits** pendant 2/6 mois », plus prometteur que le texte visible (« Remplacements prévus par la formule pendant 6 mois ») et non confirmé par la direction (item B) | Noms d'`Offer` alignés sur la copie visible : « remplacements prévus par la formule pendant 2/6 mois ». Garde-fou ajouté : « remplacement(s) gratuit(s) » est désormais bloquant, dans le texte visible **et** dans le JSON-LD |
| **§5** `ServiceChannel` réellement fonctionnel et visible dans la page | Conforme (WhatsApp et téléphone visibles et fonctionnels) | `availableLanguage` des canaux normalisé : `["French","Arabic"]` → `["fr-MA","ar-MA"]` (codes BCP-47) |
| **§5** `Review` / `AggregateRating` seulement avec des avis authentiques, attribuables et conservés dans un système fiable ; jamais de témoignage marketing converti en note | Conforme : aucun `review` ni `aggregateRating` — les 4 synthèses d'avis sont des textes d'agence et les consentements ne sont pas archivés (item C) | Verrouillé : `verifier-seo.js` bloque toute note structurée tant que des cases restent à cocher dans `contenu/valider-avis.md`. C'est aussi la seule position tenable côté Google : les avis « auto-publiés » sur LocalBusiness/Organization ne donnent de toute façon pas d'étoiles |
| **Vocabulaire Schema.org** `serviceType` n'est déclarée que pour le type `Service` : employée sur l'organisation, elle déclenche un message bloquant du validateur officiel | `EmploymentAgency` (`index.html`) portait `serviceType: [6 métiers]` → « The property serviceType is not recognized by the schema (e.g. schema.org) for an object of type EmploymentAgency » (validator.schema.org) | Liste remontée dans un `OfferCatalog` « Services de personnel — particuliers et entreprises » : un `Offer` par métier, avec `itemOffered` = `Service` + `serviceType` (mêmes libellés que les pages service × ville). Le catalogue des frais de mise en relation reste un second `OfferCatalog`. Garde-fou : `verifier-seo.js` contrôle désormais le **domaine** de chaque propriété employée |
| **§6 P1** Une seule entité organisationnelle **et un seul domaine canonique** | **En attente** : `yallah.services` ne résout pas (NXDOMAIN, vérifié le 05/10) ; tout pointe sur `yallahservices-one.vercel.app` | Les `@id` et URL canoniques sont dérivés de `site.config.json` (`url`) dans le générateur : au changement de domaine, une ligne à modifier puis `node outils/generer-pages-villes.js` + `node build-site.js`. `verifier-contenu.js` §7.4 signalera toute URL restée sur l'ancien hébergement |
| **§6 P2** Pages, maillage, titles/H1/descriptions/canonical propres, pages utiles dans le sitemap | Conforme : 10 URL indexables, sitemap généré, titles ≤ 60 et descriptions 120–165 contrôlés, 4 à 5 liens locaux par page | Inchangé |
| **§6 P4** Mesure Search Console (requêtes par service et par ville, pages indexées/exclues, clics) | Fichier de vérification présent (`googlee184c103eb04f93a.html`), propriété à créer sur le domaine définitif | À faire côté direction, après l'achat du domaine |

**Écart assumé** : le guide écrit l'identifiant de l'organisation `#organization` ; le dépôt utilise
`#business`, déjà référencé par toutes les pages, le générateur et `verifier-seo.js`. L'exigence du
guide — un `@id` permanent et unique pour une seule entité — est remplie ; renommer n'apporterait
rien et casserait les références existantes.

**Contrôles ajoutés à cette occasion** (`outils/verifier-seo.js`, essayés en injectant chaque type
d'infraction avant d'être retirées) : entité organisationnelle unique et complète, `WebPage` avec
`isPartOf`/`publisher`/`about`/`breadcrumb`, `@id` du fil d'Ariane et du `Service`, `containedInPlace`
sur chaque ville, aucune adresse hors accueil, aucune note structurée sans consentement archivé.

**Vocabulaire (release 30.1)** : le contrôle automatique couvre aussi le **domaine des propriétés**
(`domainIncludes`) pour les propriétés employées sur le site — la table `DOMAINES_SCHEMA`/`PARENTS_SCHEMA`
de `outils/verifier-seo.js` est un extrait de `data/releases/30.1/schemaorg-current-https.jsonld`
(dépôt `schemaorg/schemaorg`). C'est ce qui aurait bloqué le `serviceType` de l'accueil : sur
validator.schema.org, une propriété employée hors de son domaine s'affiche comme un message d'erreur
(« n'est pas reconnue … pour un objet de type … »). Les services en ligne du catalogue de l'accueil
(`Offer.itemOffered`, sans `@id`) ne sont pas traités comme des entités locales : seuls les `Service`
identifiés (`#service` d'une page service × ville) portent `provider`, `areaServed` et un `@id` stable.
