# Galerie vidéo — intégration du 3 octobre 2026

## Sources et intégrité

Les quatre MP4 proviennent exclusivement de `Yedicoco/yallahservices` (sans point),
au commit `460986fbedef70194cb82fcaf4db88c364f421a0`, sous `public/videos/`.
Ils sont conservés **octet pour octet**, sans transcodage ni remplacement.
Les tailles, identifiants Git et empreintes SHA-256 sont consignés dans
[`videos-sources.json`](videos-sources.json). Les identifiants Git ont été comparés
aux métadonnées de l'API GitHub lors de la récupération.

Le dépôt cible est un site HTML statique, pas une application utilisant `public/` :
les médias sont donc publiés dans `assets/videos/`, automatiquement repris par
`build-site.js` dans `site-a-mettre-en-ligne/assets/videos/`.

| Fichier original | Placement |
|---|---|
| `besoin-d-aide-a-domicile.mp4` | Accueil, galerie `#videos` |
| `yallah-service.mp4` | Accueil, galerie `#videos` |
| `2026-08-28-151819708.mp4` | Accueil, galerie `#videos` |
| `prospection-b2b.mp4` | `personnel-entreprises.html#video-entreprises` uniquement |

La galerie de l'accueil suit `#temo` et précède `#packs`. La vidéo entreprises
est présentée après l'introduction et avant les secteurs. L'accueil affiche aussi
une vignette-teaser et un lien direct vers ce lecteur (le MP4 n'est pas dupliqué
sur l'accueil). Aucun tarif ni offre n'a été modifié. Les titres restent sobres, sans témoignage ou promesse ajouté.

## Affichage et lecture

- Charte existante : variables `--brand-*`, boutons `pwb` / `local-btn-main`.
- Trois colonnes sur ordinateur, une colonne jusqu'à 760 px ; B2B en carte unique.
- Format vertical 9:16 préservé, sans recadrage (`object-fit: contain`).
- `<video controls playsinline preload="none">`, sans autoplay ni script de lecture.
- Liens WhatsApp préremplis distincts vers le numéro clients existant `212691733585`.
- Textes et messages ajoutés aux dictionnaires anglais, darija arabe et latine.
- Le serveur Node connaît `video/mp4` et les requêtes HTTP Range ; Vercel sert
  directement les fichiers statiques.

Les quatre vignettes JPEG de `assets/img/videos/` sont de vraies images extraites
à **00:00:01** dans chaque MP4, non des illustrations générées. L'attribut natif
`<video poster>` n'accepte ni `srcset` ni `<picture>` : les trois posters de
l'accueil ont donc été ramenés de **640×1138 à 480×854** et recompressés en JPEG
(qualité ImageMagick 70). Leur poids cumulé passe de **402 272 à 188 269 octets**,
soit **−53,2 %**, sans changer les URLs référencées par le lecteur, `VideoObject`
ou le sitemap. 480 px couvrent les cartes affichées jusqu'à 400 px CSS. Le poster
B2B reste à 640 px : cette source alimente aussi son teaser responsive 240/360/640.

Pour réextraire les images depuis les MP4, en gardant cette stratégie (qualité
indicative ; les octets ne seront pas identiques à la recompression ImageMagick) :

```bash
for f in assets/videos/*.mp4; do
  nom=$(basename "$f" .mp4)
  largeur=480; qualite=5
  if [ "$nom" = prospection-b2b ]; then largeur=640; qualite=3; fi
  ffmpeg -y -ss 1 -i "$f" -frames:v 1 -vf "scale=${largeur}:-2" -q:v "$qualite" \
    "assets/img/videos/$nom.jpg"
done
node build-site.js
```

## Vérifications reproductibles

```bash
node outils/verifier-videos.js
node build-site.js
node outils/verifier-videos.js --dossier site-a-mettre-en-ligne
node outils/verifier-site.js
node outils/extraire-i18n.js --verifier
node outils/generer-i18n.js --verifier
# Outils de développement uniquement, non nécessaires au site publié :
npm install --no-save --package-lock=false playwright jsdom
npx playwright install chromium
node outils/tester-i18n.js
# Dans un autre terminal : node server.js
node apercus/tester-videos.js http://localhost:3000
```

Résultats de l'intégration :

- Intégrité des quatre MP4 et chemins des posters : validés à la racine et dans le build.
- Test Chromium à 320, 390, 760 et 1280 px, sur les deux pages : aucun débordement,
  aucun téléchargement MP4 avant clic (y compris après défilement et changement
  de langue), lecture effective des quatre vidéos par les commandes natives.
- Vérifications multilingues existantes : 77 contrôles réussis.
- HTTP local : `HEAD` 200, plages initiales et finales 206, plages impossibles 416.
- Sections `packs`, `grille` et `frais` : strictement identiques au commit de départ.
- `verifier-site.js` : aucune erreur, un avertissement préexistant sur quatre pages
  locales non traduites.
- **Contrôles existants encore en échec, reproduits sur le commit de départ** :
  `verifier-contenu.js` signale les mêmes 15 erreurs éditoriales (pages locales trop
  courtes, duplication, FAQ/maillage) et deux avertissements ;
  `tester-messages.js` s'arrête car son faux DOM ne fournit pas
  `document.documentElement.setAttribute`. Ces problèmes ne sont pas modifiés
  par ce travail vidéo.

Les captures `apercus/videos-*.png` sont régénérables et ignorées par Git.
Les vérifications navigateur sont locales ; elles ne constituent pas un contrôle
sur appareil physique ni une vérification du déploiement Vercel en production.

## Référencement vidéo

Les pages contenant les vidéos incluent chacune leurs entités Schema.org `VideoObject`.
Le fichier `contenu/videos-seo.json` centralise les titres, descriptions, vignettes,
URL MP4 et date de mise en ligne initiale des galeries (3 octobre 2026). `node outils/generer-sitemap.js`
produit également `video-sitemap.xml` et déclare les deux sitemaps dans `robots.txt`.
Le build statique les régénère dans `site-a-mettre-en-ligne/`.

Après publication, soumettre `https://<domaine-canonique>/video-sitemap.xml` dans
Google Search Console (Sitemaps), puis contrôler les URL de page concernées et le
rapport d'indexation des vidéos. L'indexation reste à la décision de Google : une
soumission ou un balisage valide ne garantit pas l'apparition d'un résultat vidéo.
Vérifier aussi que les URL canoniques, le sitemap, les MP4 et les vignettes utilisent
le même domaine public. Le domaine canonique configuré est actuellement
`https://menage-nounou.web.app` ; basculer vers `https://yallah.services`
uniquement lorsque ce domaine sera réellement publié et choisi comme canonique.
