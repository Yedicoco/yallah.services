# Audit SEO page par page — Yallah Services

**Date de l’audit : 8 octobre 2026**  
**Périmètre :** les 15 URL du sitemap de `https://menage-nounou.web.app`, contenus visibles, sitemap, `robots.txt`, sitemap vidéo et HTML publié dans le dépôt.

## Synthèse exécutive

### Verdict

Le socle éditorial et on-page est **bon à très bon** : les 15 pages demandées existent dans le sitemap et leur contenu est récupérable ; les pages principales ont une intention distincte, des titres et descriptions différenciés, un H1 unique, des liens internes et des appels à l’action. Les pages locales ne sont pas des pages creuses : elles détaillent les besoins, les quartiers, les conditions, les prix disponibles et les limites réelles du service.

**Le constat prioritaire de l’audit initial a été corrigé dans le dépôt.** Le sitemap et `robots.txt` live utilisaient Firebase tandis que le HTML source et la configuration par défaut conservaient Vercel. La configuration, les balises canonical, Open Graph, les identifiants Schema.org, `llms.txt`, les sitemaps et les fichiers du dossier publié sont maintenant alignés sur `https://menage-nounou.web.app`. Les workflows Firebase s’appuient maintenant sur cette URL unique dans `site.config.json` au lieu de répéter une variable `SITE_URL` séparée.

Le domaine `https://yallah.services` reste noté comme domaine souhaité ultérieurement. Il ne faut basculer le canonique vers celui-ci qu’une fois ce domaine réellement configuré et choisi comme domaine de production. Le changement fait ici aligne le dépôt sur le domaine Firebase demandé ; il ne déploie pas le site à lui seul.

Avant correctif, le contrôle du dossier publié remontait **168 signalements** lorsque Firebase était donné comme domaine attendu, principalement dus à l’hôte Vercel. Après alignement, le contrôle SEO passe avec Firebase comme domaine de référence.

### Points positifs vérifiés

- Le sitemap live contient les **15 URL demandées**. Les 15 pages ont retourné leur titre et leur contenu lors de l’inspection.
- Le `robots.txt` live autorise le site public et référence le sitemap HTML ainsi que le sitemap vidéo. Les pages admin/API sont exclues.
- Dans le HTML du dossier publié : **15 titres distincts** (32–57 caractères), **15 descriptions distinctes** (128–162 caractères) et un H1 par page. Ces tailles sont cohérentes avec les contrôles SEO du dépôt.
- Aucune image sans texte alternatif n’a été détectée. Le test du site passe aussi les contrôles de ressources locales, liens internes, ancres, structure HTML et affichage mobile.
- Les pages de services locales disposent de contenu substantiel, de FAQ, de parcours de prise de contact et de Schema.org (`Service`, `BreadcrumbList`, `FAQPage`). Le balisage FAQ ne garantit toutefois pas un résultat enrichi Google.
- Les pages sur la garde-malade, la garde d’enfants et le gardiennage délimitent plutôt bien les prestations et évitent des promesses de soins, de vérification ou de sécurité qu’elles ne peuvent pas garantir. C’est un bon signal de confiance à conserver.

### Priorités de correction

| Priorité | Action |
|---|---|
| **P0 — domaine/indexation** | Choisir le domaine canonique de production, puis aligner canonicals, `og:url`, `@id` Schema.org, sitemap et robots.txt. Tester le HTML servi après déploiement. |
| **P1 — SEO multilingue** | Le site propose des traductions côté navigateur sur une partie des pages, mais les langues ne disposent pas d’URL distinctes ni d’alternates `hreflang` cohérents. Les moteurs voient principalement la version française. Créer des URL statiques par langue si le référencement en arabe/darija/anglais est un objectif. |
| **P2 — sémantique de tableaux** | Dans les pages chauffeur et vigile, les colonnes « Prestation / Repère mensuel » décrivent en réalité des facteurs de prix, sans montant mensuel. Renommer les colonnes pour qu’elles correspondent aux cellules. |
| **P2 — liens d’accueil** | Plusieurs pages renvoient à `index.html` alors que le sitemap utilise `/`. Préférer le chemin canonique `/` et rediriger `/index.html` vers `/` si l’hébergeur le permet. |
| **P2 — preuve locale** | Ajouter, uniquement si elle existe et avec consentement, une mission ou un avis propre à la ville sur les pages qui n’en ont pas. Ne pas inventer de témoignage ni de note. |

## Audit page par page

### 1. Accueil — `/`

- **Requête principale :** services d’aide à domicile au Maroc ; femme de ménage, nounou et cuisinière au Maroc.
- **Title :** « Ménage, nounou et cuisinière au Maroc | Yallah Services » — 55 caractères. **Description :** 155 caractères. **H1 :** « Femme de ménage, nounou et cuisinière au Maroc : des services selon vos besoins ».
- **Bon :** page d’entrée claire, services et publics identifiables, CTA WhatsApp dès le haut de page, parcours en quatre étapes, tarifs, avis/retours de mission, vidéos et liens vers les pages spécialisées. Le contenu explique aussi que l’agence met en relation, ce qui évite de laisser croire qu’elle est l’employeur.
- **À optimiser :** l’accueil couvre beaucoup de sujets à la fois. Garder une promesse principale orientée foyer, puis séparer visuellement les chemins « foyer », « entreprise » et « candidat ». Remplacer les liens internes `index.html` par `/` pour consolider l’URL d’accueil. La cohérence de domaine est le correctif prioritaire commun à cette page.
- **Priorité page :** haute.

### 2. Services par ville — `/services-par-ville.html`

- **Requête principale :** services à domicile par ville au Maroc.
- **Title :** « Nos services par ville au Maroc | Yallah Services » — 49 caractères. **Description :** 128 caractères. **H1 :** « Nos services, ville par ville ».
- **Bon :** rôle de page-hub pertinent ; elle relie les pages Casablanca et les pages ménage/nounou de Rabat, Marrakech et Tanger, puis explique la couverture réelle, les autres villes et les limites d’intervention. Bon maillage vers les services particuliers et entreprises.
- **À optimiser :** vérifier que chaque lien de service important reste facilement visible sans dépendre du JavaScript. Maintenir cette page comme source de vérité de la couverture géographique et ne créer de nouvelles pages ville-service que si elles disposent d’informations réellement spécifiques.
- **Priorité page :** haute (maillage et découverte des pages locales).

### 3. Candidature — `/candidature.html`

- **Requête principale :** candidature / emploi femme de ménage, nounou, cuisinière ou garde-malade au Maroc.
- **Title :** « Espace candidats — Fiche de candidature | Yallah Services » — 57 caractères. **Description :** 153 caractères. **H1 :** « Fiche de candidature ».
- **Bon :** l’intention candidat est distincte de celle des clients ; le formulaire explique les étapes, les références, la confidentialité, l’absence de frais et le consentement. La page est bilingue français/arabe et le formulaire bénéficie de contrôles spécifiques.
- **À optimiser :** si la page cible aussi des recherches en arabe, annoter correctement les blocs de langue (`lang`) et prévoir des URL/versions indexables distinctes plutôt que de s’appuyer uniquement sur une traduction client-side. Vérifier régulièrement que le texte de consentement et la politique de conservation correspondent au traitement réel des références et données candidates.
- **Priorité page :** moyenne à haute pour l’acquisition de candidats ; la garder hors de la navigation foyer principale, mais la lier clairement depuis l’accueil.

### 4. Chauffeur à Casablanca — `/chauffeur-casablanca.html`

- **Requête principale :** chauffeur à Casablanca.
- **Title :** « Chauffeur à Casablanca | Yallah Services » — 40 caractères. **Description :** 142 caractères. **H1 :** « Chauffeur à Casablanca ».
- **Bon :** page différenciée autour des trajets, horaires, véhicule, secteurs et vérifications à faire par le client. Les FAQ répondent aux objections sans prétendre vérifier des documents qui ne le sont pas. Le CTA WhatsApp demande des informations utiles.
- **À corriger :** le tableau de prix porte les en-têtes « Prestation » et « Repère mensuel », mais ses cellules listent des facteurs (« amplitude horaire », « jours », « trajets ») et leur impact, pas des prix. Le `<caption>` indique bien « Ce qui fait varier le montant », mais les en-têtes de colonnes restent trompeurs. Les renommer, par exemple **« Facteur » / « Impact sur le poste »**.
- **Priorité page :** haute ; corriger la sémantique du tableau.

### 5. Cuisinière à Casablanca — `/cuisiniere-casablanca.html`

- **Requête principale :** cuisinière à Casablanca ; aide en cuisine à Casablanca.
- **Title :** « Cuisinière à Casablanca | Yallah Services » — 41 caractères. **Description :** 153 caractères. **H1 :** « Cuisinière à Casablanca ».
- **Bon :** distingue cuisine quotidienne, aide en cuisine et réceptions ; les repères tarifaires sont chiffrés et réexpliqués dans la FAQ. Les contraintes alimentaires et allergies sont abordées avec prudence. Bon CTA et maillage vers les services associés.
- **À optimiser :** la mission affichée en preuve sociale est à Bouznika, pas à Casablanca. Si une mission casablancaise réelle et publiable existe, elle renforcera la pertinence locale ; sinon, conserver la transparence actuelle plutôt que de forcer une preuve locale.
- **Priorité page :** haute.

### 6. Femme de ménage à Casablanca — `/femme-menage-casablanca.html`

- **Requête principale :** femme de ménage à Casablanca ; ménage à domicile Casablanca.
- **Title :** « Femme de ménage à Casablanca | Yallah Services » — 46 caractères. **Description :** 147 caractères. **H1 :** « Femme de ménage à Casablanca ».
- **Bon :** une des meilleures pages commerciales du lot : différences villa/appartement/grand ménage, quartiers, postes logés ou non, tarifs mensuels et à la journée, processus, deux missions publiées et FAQ détaillée. L’intention locale est claire.
- **À optimiser :** garder les conditions tarifaires, la date de mise à jour et la distinction salaire/frais de mise en relation synchronisées avec la grille officielle et les autres pages. Les preuves de Bouskoura et Dar Bouazza sont pertinentes comme périphérie casablancaise, à condition que les autorisations de publication soient conservées.
- **Priorité page :** très haute.

### 7. Femme de ménage à Marrakech — `/femme-menage-marrakech.html`

- **Requête principale :** femme de ménage à Marrakech.
- **Title :** « Femme de ménage à Marrakech | Yallah Services » — 45 caractères. **Description :** 155 caractères. **H1 :** « Femme de ménage à Marrakech ».
- **Bon :** contenu réellement distinct : résidences principales/secondaires, Palmeraie, Guéliz, maisons d’été et prise en charge à distance depuis Casablanca. La page précise les limites géographiques et distingue le ménage familial des besoins de riad/hôtel.
- **À optimiser :** la grille tarifaire est nationale ; garder cette explication visible pour éviter qu’un tarif générique soit interprété comme une offre locale garantie. Ajouter une mission ou un retour de client à Marrakech uniquement si disponible et autorisé. Cette page fait partie des pages locales non traduites dans le moteur du dépôt.
- **Priorité page :** haute.

### 8. Femme de ménage à Rabat — `/femme-menage-rabat.html`

- **Requête principale :** femme de ménage à Rabat.
- **Title :** « Femme de ménage à Rabat | Yallah Services » — 41 caractères. **Description :** 156 caractères. **H1 :** « Femme de ménage à Rabat ».
- **Bon :** page contextualisée (Souissi, Hay Riad, Agdal, Témara), précise l’absence de bureau local, explique les formules et donne les tarifs mensuels et journaliers. Une mission à Rabat est présentée comme preuve, avec prudence sur la desserte.
- **À optimiser :** maintenir la cohérence entre prix, conditions de journée et informations du hub. Cette page est actuellement une page importante mais n’a pas de traduction dans le moteur du dépôt.
- **Priorité page :** très haute.

### 9. Femme de ménage à Tanger — `/femme-menage-tanger.html`

- **Requête principale :** femme de ménage à Tanger.
- **Title :** « Femme de ménage à Tanger | Yallah Services » — 42 caractères. **Description :** 154 caractères. **H1 :** « Femme de ménage à Tanger ».
- **Bon :** différenciation éditoriale convaincante autour des maisons d’été, des résidents à l’étranger, de Malabata, Jbel Kbir et des besoins saisonniers. Le texte indique clairement que la prestation à la journée ne couvre pas Tanger et que l’agence travaille depuis Casablanca.
- **À optimiser :** ajouter une preuve locale authentique si elle existe ; ne pas laisser entendre qu’un bureau est implanté à Tanger. Page actuellement non traduite dans le moteur du dépôt.
- **Priorité page :** haute.

### 10. Garde-malade à Casablanca — `/garde-malade-casablanca.html`

- **Requête principale :** garde-malade à Casablanca ; accompagnement de personne âgée à domicile.
- **Title :** « Garde-malade à Casablanca | Yallah Services » — 43 caractères. **Description :** 151 caractères. **H1 :** « Garde-malade à Casablanca ».
- **Bon :** le périmètre est bien délimité : présence et aide quotidienne, sans soins infirmiers ni actes médicaux. Les tarifs, modalités, limites et attentes de la famille sont abordés. Pour un sujet sensible, cette absence de promesse médicale est importante.
- **À optimiser :** conserver cette distinction dans toutes les traductions et annonces. Renforcer la confiance par une explication factuelle du processus de présentation/références, sans revendiquer de certification ou de contrôle non démontré.
- **Priorité page :** haute, avec vigilance accrue sur la véracité des promesses.

### 11. Mentions légales — `/mentions-legales.html`

- **Requête principale :** page de réassurance et d’information légale, pas une page d’acquisition SEO.
- **Title :** « Mentions légales | Yallah Services » — 34 caractères. **Description :** 157 caractères. **H1 :** « Mentions légales ».
- **Bon :** contact, base à Casablanca, hébergeur, nature du service, frais, données personnelles et loi 09-08 sont expliqués. Le numéro distinct pour les candidats est utile.
- **À vérifier :** faire valider par la personne compétente que l’identification de l’éditeur et du directeur de publication est assez précise pour la situation juridique réelle ; « la direction de Yallah Services » est une formule générique. Côté SEO, conserver l’accès depuis le pied de page ; son inclusion au sitemap est secondaire et sa priorité `0.6` n’apporte pas d’avantage Google particulier. Page non traduite.
- **Priorité page :** faible pour le trafic, importante pour la confiance et la conformité.

### 12. Nounou à Casablanca — `/nounou-casablanca.html`

- **Requête principale :** nounou à Casablanca ; garde d’enfants à domicile Casablanca.
- **Title :** « Nounou à Casablanca | Yallah Services » — 37 caractères. **Description :** 158 caractères. **H1 :** « Nounou à Casablanca ».
- **Bon :** contenu utile aux familles : âges, horaires, tâches, langues, sorties d’école, formule logée/non logée, tarifs, références et FAQ. Le texte reste explicite sur ce qui est déclaré et ce que la famille doit vérifier ; c’est préférable à une promesse vague de « nounou vérifiée ».
- **À optimiser :** le témoignage affiché mentionne une cliente de Rabat. Si un retour authentique de Casablanca peut être utilisé avec consentement, le privilégier sur cette page. Renforcer sans surpromettre les informations que les parents doivent vérifier lors de l’entretien.
- **Priorité page :** très haute.

### 13. Nounou à Rabat — `/nounou-rabat.html`

- **Requête principale :** nounou à Rabat ; garde d’enfants à domicile Rabat.
- **Title :** « Nounou à Rabat | Yallah Services » — 32 caractères. **Description :** 152 caractères. **H1 :** « Nounou à Rabat ».
- **Bon :** différenciation par l’organisation des journées de travail, les trajets école/maison, les quartiers de Rabat et la distinction garde seule/garde avec ménage. Le tableau tarifaire est clair ; la FAQ précise que les antécédents et références ne sont pas garantis par l’agence.
- **À optimiser :** ajouter une preuve de mission locale si elle est disponible ; renforcer les liens vers les pages de ménage à Rabat et vers la page hub. Page non traduite dans le moteur du dépôt.
- **Priorité page :** très haute.

### 14. Personnel pour entreprises — `/personnel-entreprises.html`

- **Requête principale :** recrutement / mise en relation de personnel pour entreprises au Maroc.
- **Title :** « Personnel pour entreprises au Maroc | Yallah Services » — 53 caractères. **Description :** 146 caractères. **H1 :** « Du personnel pour votre entreprise ».
- **Bon :** page B2B distincte des services aux foyers ; elle couvre hôtellerie, restauration, chantiers, nettoyage, PME et événementiel, puis sépare clairement permanent, temporaire et journalier. Les responsabilités respectives sont exposées et une vidéo/CTA sont présents.
- **À optimiser :** une ou deux études de cas B2B vérifiables (secteur, type de poste, ville, saison/délai, sans données confidentielles) aideraient davantage qu’une page supplémentaire générique. Ne publier des pages par secteur ou ville que si le contenu et l’offre correspondants sont réellement distincts.
- **Priorité page :** haute pour le segment entreprises.

### 15. Vigile et gardien à Casablanca — `/vigile-casablanca.html`

- **Requête principale :** gardien / vigile à Casablanca.
- **Title :** « Vigile et gardien à Casablanca | Yallah Services » — 48 caractères. **Description :** 162 caractères. **H1 :** « Vigile et gardien à Casablanca ».
- **Bon :** explique les différences de contexte, le périmètre des missions et ce qui n’est pas proposé : pas d’intervention physique, d’agent certifié ou de société de sécurité. Les limites et obligations d’organisation sont claires, ce qui réduit le risque de promesse trompeuse.
- **À corriger :** comme sur la page chauffeur, le tableau annonce « Prestation / Repère mensuel » mais détaille des facteurs de variation et non des montants. Renommer les colonnes en **« Facteur » / « Impact sur le poste »**. Ne pas ajouter un prix générique si l’équipe ne peut pas le confirmer.
- **Priorité page :** haute ; corriger le tableau sémantique.

## Sitemap, exploration et signaux techniques

- **15 URL** sont listées dans le sitemap live ; les pages exclues (confirmation de candidature et espace admin) ne figurent pas dans la liste communiquée. La page de confirmation porte un `noindex` dans la version du dépôt, ce qui est cohérent.
- Le sitemap live utilise le domaine Firebase, et `robots.txt` pointe bien vers les deux sitemaps Firebase. Le sitemap vidéo est aussi accessible et référence quatre vidéos.
- Les 15 entrées ont la même valeur `lastmod` (`2026-10-08`). C’est acceptable uniquement si les 15 pages ont réellement été mises à jour ce jour-là ; le générateur du dépôt sait reprendre la date de dernier changement Git, il vaut mieux éviter de rafraîchir artificiellement toutes les dates à chaque build.
- `changefreq` et `priority` peuvent rester dans le fichier, mais Google ne les utilise pas pour décider de l’indexation ou du classement : ne pas consacrer de temps d’optimisation à ces valeurs.
- Les liens internes vers `index.html` créent un alias de l’accueil, alors que le sitemap ne publie que `/`. Uniformiser les liens et conserver une seule URL canonique.
- Dans le dépôt, les pages de service ont les balisages Schema.org `Service`, `FAQPage` et `BreadcrumbList`; la page d’accueil inclut les entités du site/agence. Après correctif, les identifiants JSON-LD et URL associées utilisent le domaine Firebase configuré.

## Multilingue et SEO local

Le dépôt contient des dictionnaires français/arabe (darija)/anglais appliqués côté navigateur sur **10 des 15 pages du sitemap** ; cinq pages listées ne disposent pas de ces traductions : ménage à Marrakech, ménage à Rabat, ménage à Tanger, mentions légales et nounou à Rabat. La page candidature contient par ailleurs du français et de l’arabe.

Une traduction activée par JavaScript/localStorage améliore l’expérience de certains visiteurs, mais ne constitue pas à elle seule une architecture SEO multilingue. Pour gagner des recherches non francophones, il faudrait des versions accessibles sous des URL propres, avec contenu et métadonnées traduits, canonicals propres et `hreflang` réciproques. Si ce chantier n’est pas prévu, traiter les langues comme une fonction de confort et ne pas compter sur elles pour générer des pages de recherche indexées.

Pour le référencement local externe, non inclus dans cet audit faute d’accès aux comptes : vérifier la fiche Google Business Profile de la base réelle à Casablanca, la cohérence des coordonnées/adresses et la collecte d’avis authentiques. Ne pas créer de fausses fiches d’établissement dans les villes où Yallah Services indique ne pas avoir de bureau.

## Vérifications effectuées et limites

- Consultation du sitemap, de `robots.txt`, du sitemap vidéo et du contenu des 15 URL sur `menage-nounou.web.app`.
- Audit statique des 15 fichiers HTML présents dans le dossier publié indiqué par `firebase.json` (`site-a-mettre-en-ligne/`) : titres, descriptions, H1, canonicals, Open Graph, robots et JSON-LD.
- `node outils/verifier-site.js` : contrôles du dépôt réussis (ressources, liens, ancres, structure et attributs d’images inclus).
- Après le correctif : `node outils/verifier-seo.js` et `SITE_URL=https://menage-nounou.web.app node outils/verifier-seo.js --dossier site-a-mettre-en-ligne` passent ; le sitemap contient 15 URL cohérentes.
- `node outils/verifier-site.js` passe également après le correctif.
- La vue de page consultée ne donne pas les en-têtes HTTP ni le HTML brut de la version live. Le dépôt est maintenant aligné, mais les codes de statut exacts et les canonicals réellement servis ne seront confirmés côté production qu’après le prochain déploiement. Core Web Vitals/Lighthouse, Search Console, positions, backlinks, conversions et fiche Google Business Profile restent à vérifier avant de conclure sur l’indexation ou la performance réelle.
