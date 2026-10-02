# Pack SEO Yallah Services

## 1. Fichiers
| Fichier | Où |
|---|---|
| head-snippet.html | remplace title/description/keywords/OG/Twitter dans `<head>` de index.html + `<html lang="fr-MA">` |
| robots.txt, llms.txt, vercel.json | racine du projet (ou `public/`) |
| generate_pages.py | `BASE_URL=https://votre-domaine.ma python3 generate_pages.py` → `out/` : 6 pages locales + sitemap.xml, à copier à la racine |

## 2. Retouches on-page (index.html)
- H1 : `<h1>Femme de ménage, nounou et cuisinière au Maroc : <em>une aide fiable pour votre maison</em></h1>`
- H2 « Comment ça marche ? » → « Comment trouver une femme de ménage ou une nounou au Maroc ? »
- H2 « Nos Pack & Tarifs » → « Tarifs femme de ménage, nounou, cuisinière au Maroc (2026) »
- Sous-titre « en 3 étapes » : la section en affiche 4 → corriger en « 4 étapes ». Les pages locales générées affichent maintenant « Comment ça marche en 4 étapes ».
- Délai harmonisé partout : « dans un délai de 24 à 72 heures » (titres, CTA, texte et FAQ).
- Images : `loading="lazy" decoding="async" width= height=` partout sauf le hero ; hero en `fetchpriority="high"`.
- Convertir PNG/JPG en WebP (`cwebp -q 80 img.png -o img.webp`) : le hero PNG est le plus gros frein LCP.
- Pied de page : ajouter les liens vers TOUTES les pages locales (aujourd'hui seulement 2).
- Texte des liens : « Réserver » → « Réserver une nounou pour 1 enfant » (ancre descriptive).

## 3. Hors page
1. Domaine propre (ex. yallahservices.ma) : un sous-domaine vercel.app plafonne l'autorité et la confiance. Après migration : 301 de l'ancien vers le nouveau, mise à jour de BASE dans le script et des canonicals.
2. Google Search Console + Bing Webmaster : soumettre sitemap.xml, demander l'indexation de chaque page locale.
3. Fiche Google Business Profile en « entreprise de services à domicile » (zone de chalandise : Casablanca, Rabat, Tanger…), sans afficher l'adresse personnelle. Numéro, site et horaires identiques au site (cohérence NAP).
4. Contenu (1 page/semaine) : « Salaire femme de ménage au Maroc 2026 », « Prix d'une nounou à Casablanca », « Contrat employée de maison : ce que dit la loi 19.12 » (vérifier le texte avant publication), « Logée ou non logée : que choisir ».
5. Liens entrants : annuaires marocains, groupes d'expatriés, blogs maternité/maison, partenaires conciergerie/immobilier.
6. Mesure : GSC (requêtes par ville), clics WhatsApp suivis via paramètres UTM sur les liens wa.me.

## 4. Vérifications effectuées

- Le générateur Python est syntaxiquement valide.
- Les 6 pages locales et `sitemap.xml` sont régénérés dans `out/`.
- Chaque page locale contient un seul `<title>`, un seul `<h1>` et un seul bloc JSON-LD.
- Les pages générées utilisent toutes le délai « 24 à 72 heures » et annoncent 4 étapes.
- Le sitemap contient la page d'accueil, la page candidature, les 2 pages existantes et les 6 nouvelles pages.

Le domaine par défaut reste `https://yallahservices-one.vercel.app`. Avant déploiement, remplacer cette valeur par le domaine canonique définitif via `BASE_URL`, puis régénérer le dossier `out/`.
