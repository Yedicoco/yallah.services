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

## 4. Ce qui est conforme et ne change pas

- Grille des 14 services et prestations à la journée (source : flyer officiel).
- « Paiement des frais après validation du profil » · « Gratuit pour les candidats ».
- Deux numéros WhatsApp distincts (clients / candidats) et l'e-mail unique.
- Parcours candidat (fiche, références obligatoires, consentement loi 09-08).
- Comptes officiels en pied de page : Facebook, Instagram, TikTok, LinkedIn — **identiques** à la fiche.
- Mention « Demandes d'emploi non acceptées » sur le parcours client (séparation des deux publics).
