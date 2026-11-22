# Audit SEO et propositions — à valider avant publication

Date : 22 novembre 2026. Base : branche de travail issue de `main`, inspection du HTML racine, des fichiers de configuration et des scripts de contrôle. La page d’accueil, les deux pages univers, robots.txt et le sitemap publics ont aussi été consultés. Les observations ci-dessous distinguent l’état vérifié du travail à faire ; elles ne prouvent pas l’indexation effective par Google.

L’inventaire exhaustif des 18 pages du sitemap, leurs titres, descriptions, H1, images, canonicals et la liste Search Console sont dans [inventaire-technique.md](inventaire-technique.md).

## 1. Audit initial priorisé

| Page ou périmètre | Constat | Action recommandée | Priorité |
|---|---|---|---|
| Accueil | Quatre univers et CTA WhatsApp présents ; un H1. Page longue avec grilles, FAQ, avis et formulaires. | Conserver tous les contenus ; proposer une simplification seulement après validation d’un plan de déplacement, sans perdre les ancres et liens. | Moyenne |
| Froid et climatisation | Page publique accessible, liée depuis l’accueil et les menus, incluse au sitemap, canonical propre et pas de noindex dans le dépôt. Elle affiche tarifs et services supplémentaires contraires à la fiche de référence. | Faire valider offre et tarifs avant toute correction, suppression ou création de pages dérivées. | Haute |
| Esthétique et bien-être | Page publique accessible, liée et indexable techniquement. Prix fixes pour esthétique et massages ; la fiche dit « sur devis uniquement ». Les massages et leurs prix ont été fournis par la direction précédemment ; le soin du visage hors massage est à confirmer. Coiffure validée dans la fiche mais absente de l’offre visible de cette page. | Arbitrer les tarifs et le périmètre ; proposer l’ajout de la coiffure après validation du texte. | Haute |
| Formulaires de l’accueil | Le formulaire principal prépare un message WhatsApp ; nom, téléphone, service, ville, période et message existent. Pas de champ quartier/date précise, ni choix froid ou esthétique. Le mini-formulaire n’offre pas de description libre. Les libellés du formulaire principal n’étaient pas associés à leurs champs. | Associations de libellés corrigées sur la branche ; ajouter les services, quartier et date dans une étape ultérieure, en testant les trois langues et le récapitulatif WhatsApp sans changer le parcours existant. | Haute |
| Femme de ménage, nounou, cuisinière, garde-malade Casablanca | Les pages demandées existent déjà sous des URL différentes et sont indexables ; textes, FAQ, Service et fil d’Ariane présents. | Améliorer les pages existantes plutôt que créer des doublons ou renommer les URL ; pas de 301 nécessaire si elles restent stables. | Haute |
| Grand ménage | Service présent dans l’accueil, le formulaire et la fiche entreprise ; aucune page dédiée dans le sitemap. | Proposer une page originale après validation de son texte, de ses conditions et de sa couverture à Casablanca. | Moyenne |
| Entreprises | `personnel-entreprises.html` existe, avec FAQ, vidéos et parcours WhatsApp. | Conserver cette URL plutôt que créer une page Casablanca concurrente ; confirmer le périmètre géographique par service. | Moyenne |
| Climatisation et beauté, pages détaillées | Des pages séparées demandées n’existent pas dans le sitemap. Leur intérêt et leurs contenus spécifiques ne sont pas encore démontrés. | D’abord améliorer les pages univers ; créer des pages spécialisées uniquement après validation des informations et si elles répondent à une intention distincte. | Moyenne |
| Pages Casablanca, Rabat, Marrakech et Tanger | 10 pages locales déjà indexables ; l’outil interne ne détecte pas de couple dépassant son seuil de recopie de 40 %. | Maintenir les pages existantes ; contrôle éditorial et de couverture réel à poursuivre. Le seuil automatique ne prouve pas l’absence de duplication. | Moyenne |
| Toutes les pages du sitemap | 18 pages avec un seul H1, canonical attendu, JSON-LD syntaxiquement analysable et images avec attribut `alt` dans l’inventaire statique. | Vérifier l’utilité des alt, la hiérarchie, l’affichage et la validité sémantique des données structurées manuellement ; la syntaxe seule ne prouve pas l’éligibilité Google. | Moyenne |
| Candidature | `og:title` et `og:description` manquent. L’outil de cohérence SEO ne s’exécutait pas à cause de deux expressions régulières invalides. | Contrôle réparé sur la branche ; compléter les métadonnées après validation des textes. Il signale désormais cette anomalie réelle. | Moyenne |
| Images | Tous les `img` du périmètre disposent d’un alt ; une partie est servie en AVIF/WebP, les images des nouveaux massages en JPEG. La fiche interdit les photos non fournies, tandis que le site affiche des illustrations, dont certaines générées par IA à la demande du propriétaire. | Confirmer la règle pour les illustrations IA ; évaluer poids et variantes modernes sans changer les URL inutilement. Le sitemap images n’est pas nécessaire si les images sont découvrables sur les pages. | Moyenne |
| Vidéos | Lecteurs HTML avec titre, `controls`, `playsinline`, poster et `preload="none"` ; sitemap vidéo et JSON-LD présents. Le contrôle local actuel passe pour les quatre MP4. | Vérifier la lecture réelle sur appareil mobile et les URL en production ; une ancienne note README mentionne une divergence historique, non reproduite par le contrôle actuel. | Moyenne |
| Sitemap et robots | 18 URL dans le sitemap, aucune noindex selon le contrôle local ; robots exclut l’administration et l’API. La date de la page bien-être était antérieure à son dernier changement de contenu. | Date de cette page mise à jour ; ne pas ajouter des URL qui n’existent pas. Soumettre les sitemaps après déploiement. | Moyenne |
| Couverture et coordonnées | Le site et `site.config.json` annoncent 13 villes, dont Dar Bouazza et Bouznika ; la liste principale de la fiche de référence ne les cite pas explicitement. Casablanca est la seule zone mentionnée pour les deux nouveaux univers. | Confirmer les deux villes supplémentaires et distinguer couverture générale, froid et esthétique ; ne pas extrapoler les quartiers. Coordonnées observées : +212 691 733 585, candidats +212 710 359 446, servicesyallah@gmail.com, base Hay Hassani 20220. | Haute |
| Avis et promesses | La page présente des témoignages nominatifs ; le contrôle interne rappelle que les consentements restent à archiver. La page froid promet notamment un « air plus sain » et présente une disponibilité d’urgence. | Vérifier consentements et formulations avec le propriétaire ; ne pas supprimer sans son accord. | Haute |
| Mobile, performance et accessibilité | Contrôles statiques du dépôt passés ; aucune mesure Lighthouse ou navigation réelle effectuée dans cette session. Captures antérieures présentes dans `apercus/etape-1-2`, mais elles ne représentent pas un test complet actuel. | Faire une revue Chromium desktop/mobile, clavier, lecteur d’écran, WhatsApp et Lighthouse après installation du navigateur ; tester chaque formulaire. | Haute |

## 2. Plan des URL et des étapes

L’architecture ci-dessous privilégie les URL existantes. Les chemins demandés qui suivent ne sont **pas** créés ni redirigés automatiquement :

| Intention demandée | URL existante ou décision proposée |
|---|---|
| `/femme-de-menage-casablanca.html` | Améliorer `/femme-menage-casablanca.html`. |
| `/nounou-a-domicile-casablanca.html` | Améliorer `/nounou-casablanca.html`. |
| `/cuisiniere-a-domicile-casablanca.html` | Améliorer `/cuisiniere-casablanca.html`. |
| `/garde-malade-a-domicile-casablanca.html` | Améliorer `/garde-malade-casablanca.html`. |
| `/grand-menage-casablanca.html` | Page distincte envisageable après validation du contenu, des conditions et de la zone. |
| `/services-aux-entreprises-casablanca.html` | Améliorer `/personnel-entreprises.html`, sans limiter son périmètre à Casablanca sans confirmation. |
| `/maintenance-climatisation-casablanca.html` et `/depannage-climatisation-casablanca.html` | D’abord enrichir `/froid-climatisation.html` ; examiner deux pages si des questions et détails propres les justifient. |
| `/esthetique-a-domicile-casablanca.html`, `/coiffure-a-domicile-casablanca.html`, `/maquillage-a-domicile-casablanca.html` | D’abord enrichir `/esthetique-bien-etre.html` ; pages spécialisées seulement après validation de leurs détails et de leur utilité distincte. |

Étapes proposées :
1. **Audit et corrections techniques sans changement commercial** : correction du vérificateur SEO, association des libellés de contact, date `lastmod` bien-être ; commits séparés sur cette branche.
2. **Validation propriétaire** : réponses aux questions de la section 5, choix des textes ci-dessous et décision sur les contenus déjà publiés contradictoires.
3. **Contenus et maillage** : modifier les pages existantes et, si justifié et validé, ajouter les pages spécialisées avec contenus distincts. Préserver les FAQ, prix, mentions, ancres et liens actuels ; toute suppression ou déplacement nécessite accord explicite.
4. **Formulaires** : ajouter froid, esthétique, quartier et date sans perdre l’envoi du récapitulatif WhatsApp ; maintenir traductions et tests des anciens services.
5. **Technique et livraison** : vérifier données structurées visibles, canonicals, robots, sitemap et éventuellement 301 si une URL est changée explicitement ; captures desktop/mobile, tests de formulaires et mesures de performance. Un commit par étape ; validation avant publication.

## 3. Textes SEO proposés — brouillons, non publiés

Les titres et descriptions ci-dessous sont des propositions. Les descriptions ne modifient aucun tarif. Les longueurs sont indicatives, pas une garantie d’affichage complet. Les propositions ne donnent aucune garantie de disponibilité ni de résultat. Pour les autres pages indexables, les titres et descriptions existants sont recensés intégralement dans l’inventaire ; leur remplacement n’est pas automatique.

### Accueil — `/`
- **Title** : Yallah Services | Aide à domicile et services au Maroc
- **Meta** : Besoin d’aide à domicile, de climatisation ou de soins à Casablanca ? Présentez votre demande à Yallah Services sur WhatsApp.
- **H1 proposé** : Services à domicile et personnel selon vos besoins au Maroc
- **Introduction** : Yallah Services met en relation particuliers et entreprises avec des profils et partenaires selon leurs besoins. Découvrez nos univers et décrivez votre demande sur WhatsApp.
- **FAQ proposée** : Comment faire une demande ? Indiquez le service, la ville et vos besoins ; le récapitulatif peut être transmis sur WhatsApp. La disponibilité et les conditions sont à confirmer.

### Femme de ménage — `/femme-menage-casablanca.html`
- **Title** : Femme de ménage à Casablanca | Yallah Services
- **Meta** : Vous cherchez une femme de ménage à Casablanca ? Décrivez votre logement, les tâches et les horaires souhaités sur WhatsApp.
- **Texte proposé** : Selon votre logement et vos besoins, précisez les tâches d’entretien, la fréquence et les horaires souhaités. Yallah Services recherche un profil correspondant à vos critères.
- **FAQ** : Comment choisir la formule ? Présentez la fréquence et les tâches souhaitées ; demandez les conditions applicables avant validation.

### Nounou — `/nounou-casablanca.html`
- **Title** : Nounou à domicile à Casablanca | Yallah Services
- **Meta** : Cherchez une nounou à Casablanca selon les besoins de votre famille. Indiquez les horaires et les tâches souhaités sur WhatsApp.
- **Texte proposé** : Décrivez le nombre d’enfants, leurs besoins, les horaires et les tâches attendues. Les informations sur le profil sont à discuter et à vérifier avant votre décision.
- **FAQ** : Que préciser pour une recherche de nounou ? Le nombre d’enfants, les horaires, les tâches et les compétences que vous souhaitez vérifier.

### Cuisinière — `/cuisiniere-casablanca.html`
- **Title** : Cuisinière à domicile à Casablanca | Yallah Services
- **Meta** : Cherchez une cuisinière à Casablanca en précisant vos repas, vos horaires et vos besoins. Présentez votre demande sur WhatsApp.
- **Texte proposé** : Repas quotidiens ou aide en cuisine : indiquez les habitudes de votre foyer, les tâches et le rythme souhaités pour orienter la recherche d’un profil.
- **FAQ** : Peut-on demander aussi une aide pour le ménage ? Précisez les tâches souhaitées et demandez les conditions de la formule adaptée.

### Garde-malade — `/garde-malade-casablanca.html`
- **Title** : Garde-malade à Casablanca | Yallah Services
- **Meta** : Cherchez une aide pour accompagner une personne à Casablanca. Décrivez les tâches et les horaires souhaités sur WhatsApp.
- **Texte proposé** : Précisez l’accompagnement du quotidien, les horaires et les besoins de la personne. Les tâches et compétences requises sont à discuter avant la mise en relation.
- **FAQ** : Une garde-malade remplace-t-elle un professionnel de santé ? Les tâches d’accompagnement sont à définir ; les actes médicaux nécessitent les professionnels compétents.

### Grand ménage — page éventuelle `/grand-menage-casablanca.html`
- **Title** : Grand ménage à Casablanca | Yallah Services
- **Meta** : Vous préparez un grand ménage à Casablanca ? Présentez la surface, les tâches et la date souhaitée sur WhatsApp.
- **Texte proposé** : Décrivez le logement, les pièces et les tâches à prévoir pour une demande ponctuelle. Les conditions et disponibilités sont à confirmer avant intervention.
- **FAQ** : Que faut-il préciser ? La surface, les pièces, les tâches attendues et la date souhaitée. Les produits et modalités sont à convenir.

### Entreprises — `/personnel-entreprises.html`
- **Title** : Personnel pour entreprises au Maroc | Yallah Services
- **Meta** : Hôtels, restaurants, chantiers ou événements : décrivez votre besoin de personnel et échangez avec Yallah Services sur WhatsApp.
- **Texte proposé** : Vous recherchez du personnel pour votre activité ? Indiquez le secteur, le lieu, les postes et la durée. Yallah Services recherche des profils et facilite la mise en relation.
- **FAQ** : Quels types de besoins présenter ? Décrivez vos postes permanents, temporaires ou de renfort, ainsi que le lieu et la période.

### Climatisation — `/froid-climatisation.html`
- **Title** : Climatisation à Casablanca | Yallah Services
- **Meta** : Entretien, diagnostic ou dépannage de climatisation à Casablanca : décrivez votre appareil et demandez un devis sur WhatsApp.
- **Texte proposé** : Pour un entretien, un nettoyage ou un problème de fonctionnement, indiquez le type d’appareil et votre quartier. Une mise en relation avec un technicien partenaire peut être étudiée selon votre demande.
- **FAQ** : Que préciser pour un devis ? Le type d’appareil, les symptômes ou l’entretien souhaité et le quartier. Les conditions sont à confirmer avant intervention.

### Maintenance — page éventuelle `/maintenance-climatisation-casablanca.html`
- **Title** : Maintenance climatisation Casablanca | Yallah Services
- **Meta** : Pour l’entretien de votre climatisation à Casablanca, indiquez le type et le nombre d’appareils et demandez un devis sur WhatsApp.
- **Texte proposé** : Une demande d’entretien peut porter sur le nettoyage ou la maintenance préventive. Décrivez vos équipements et, si nécessaire, votre besoin de suivi régulier.
- **FAQ** : Peut-on demander un contrat ? Présentez le nombre d’équipements et vos besoins ; les modalités sont à confirmer sur devis.

### Dépannage — page éventuelle `/depannage-climatisation-casablanca.html`
- **Title** : Dépannage climatisation Casablanca | Yallah Services
- **Meta** : Votre climatisation présente un problème à Casablanca ? Décrivez les symptômes et demandez une intervention sur WhatsApp.
- **Texte proposé** : Un appareil qui ne fonctionne pas comme prévu peut nécessiter un diagnostic. Indiquez le modèle si vous le connaissez, les symptômes et le quartier d’intervention.
- **FAQ** : Le prix est-il fixé avant diagnostic ? Demandez un devis et les conditions applicables avant de valider l’intervention.

### Esthétique — `/esthetique-bien-etre.html`
- **Title** : Esthétique à domicile Casablanca | Yallah Services
- **Meta** : Maquillage, manucure ou épilation à domicile à Casablanca : indiquez votre besoin et contactez Yallah Services sur WhatsApp.
- **Texte proposé** : Choisissez la prestation souhaitée et précisez votre quartier ainsi que la date envisagée. Les possibilités et les conditions sont confirmées lors de votre demande.
- **FAQ** : Comment réserver ? Indiquez la prestation, le quartier et la date souhaitée sur WhatsApp, puis confirmez disponibilité et conditions.

### Coiffure — page éventuelle `/coiffure-a-domicile-casablanca.html`
- **Title** : Coiffure à domicile Casablanca | Yallah Services
- **Meta** : Vous cherchez une prestation de coiffure à domicile à Casablanca ? Décrivez votre besoin et demandez un devis sur WhatsApp.
- **Texte proposé** : Pour une demande de coiffure à domicile, indiquez le style recherché, votre quartier et la date souhaitée. Les prestations possibles sont à confirmer avec la professionnelle.
- **FAQ** : Quels détails transmettre ? Décrivez la coiffure recherchée, la date et le lieu ; demandez les conditions avant de confirmer.

### Maquillage — page éventuelle `/maquillage-a-domicile-casablanca.html`
- **Title** : Maquillage à domicile Casablanca | Yallah Services
- **Meta** : Pour un maquillage à domicile à Casablanca, précisez votre occasion et la date souhaitée. Contactez-nous sur WhatsApp.
- **Texte proposé** : Pour un maquillage de jour, de soirée ou une préparation beauté, décrivez l’occasion et vos attentes. La disponibilité et les conditions sont à confirmer.
- **FAQ** : Peut-on demander une préparation pour un événement ? Indiquez l’occasion et la date ; un devis pourra être demandé selon la prestation.

## 4. JSON-LD proposé — brouillon, non publié

L’activité est une mise en relation, pas une entreprise de construction. Conserver le type `EmploymentAgency` déjà utilisé sur l’accueil plutôt que suggérer `HomeAndConstructionBusiness` sans justification. Exemple de `Service` à ajouter à la page climatisation **seulement après validation du texte visible**. Ne pas ajouter des adresses ou garanties non visibles :

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Entretien et dépannage de climatisation à Casablanca",
  "serviceType": "Mise en relation pour l’entretien et le dépannage de climatisation",
  "url": "https://yallahservices-one.vercel.app/froid-climatisation.html",
  "provider": {
    "@type": "EmploymentAgency",
    "name": "Yallah Services",
    "url": "https://yallahservices-one.vercel.app/",
    "telephone": "+212691733585",
    "email": "servicesyallah@gmail.com"
  },
  "areaServed": {"@type": "City", "name": "Casablanca"}
}
```

Ne publier `FAQPage` que si questions et réponses correspondantes sont visibles et validées. Le balisage ne garantit ni résultats enrichis ni indexation. Vérifier chaque bloc avec les outils Google après déploiement.

## 5. Décisions et informations à valider

1. La fiche indique « sur devis uniquement », mais les pages publiées affichent des prix froid et esthétique. Les tarifs massages ont été expressément fournis auparavant ; faut-il les conserver, ainsi que les autres prix, ou passer ces pages sur devis ? Toute suppression ou modification attend votre accord.
2. Confirmez-vous la recharge de gaz, l’installation, les remplacements, le dépannage d’urgence et les prestations électroménager actuellement publiés sur la page froid ? La fiche les considère non confirmés ou ne les mentionne pas.
3. Confirmez-vous la coiffure à domicile à Casablanca et les détails des prestations proposées ? Confirmez-vous le soin du visage hors massage déjà affiché ?
4. Confirmez-vous Dar Bouazza et Bouznika pour l’activité générale ? Les services froid et esthétique restent-ils limités à Casablanca ? Les quartiers et autres villes ne doivent pas être extrapolés.
5. Confirmez-vous les conditions et qualifications du « massage médical », sans promesse thérapeutique automatique ? Faut-il maintenir ce libellé ?
6. Les photos générées par IA sont-elles autorisées en dérogation à la fiche interdisant les photos non fournies par l’agence ? Les huit illustrations de massage ont été demandées et signalées comme telles.
7. Les consentements pour les témoignages nominatifs sont-ils archivés ? Les conditions et prix des formules historiques sont-ils toujours à jour ?
8. Approuvez-vous les textes proposés ci-dessus et la stratégie consistant à conserver les URL existantes plutôt que d’en créer des doublons ?

## 6. Contrôles et limites

- `node outils/verifier-site.js` : réussi après l’association des labels.
- `node outils/extraire-i18n.js --verifier` : couverture des chaînes suivies réussie. La section massages est volontairement hors traduction et reste en français.
- `node outils/verifier-seo.js` : réussi pour les contrôles locaux et 18 URL dans le sitemap.
- `node outils/verifier-contenu.js` : réussi pour ses seuils de contenu local et contrôles automatisés. Il ne remplace pas la validation commerciale ; il ne relève pas toutes les contradictions ci-dessus.
- `node outils/verifier-videos.js` : réussi sur les fichiers locaux actuels.
- `node outils/verifier-seo-coherence.js` : réparé ; signale maintenant l’absence d’`og:title` et d’`og:description` sur candidature. Ce point reste ouvert, aucun nouveau texte n’étant publié sans validation.
- Aucun crawl HTTP complet, contrôle Search Console, test de redirection en production, mesure Core Web Vitals ou audit d’accessibilité complet n’a été exécuté. Chromium/Playwright ne sont pas installés dans cet environnement : captures desktop/mobile actuelles et tests réels restent à faire. Les captures existantes sont historiques, pas une preuve des modifications de cette branche.
- Le dépôt est superficiel (`git rev-parse --is-shallow-repository` donne `true`) : régénérer tous les `lastmod` via l’historique local donne des dates trompeuses. Seule la date de la page bien-être, dont le changement récent est connu, a été corrigée ; les 18 URL restent inchangées.
