# YALLAH SERVICES — Aides à domicile au Maroc

Reproduction du site **https://yalla-services.netlify.app/** — agence de placement de personnel
subsaharien qualifié (ménage, nounou, cuisine, garde malade) au Maroc.
**Slogan : Simplifiez-vous la vie !**

## 📞 Contacts officiels

| Canal | Coordonnées |
|---|---|
| **WhatsApp** | **+212 691 733 585** → [wa.me/212691733585](https://wa.me/212691733585) |
| **E-mail** | **servicesyallah@gmail.com** |
| Villes | Casablanca · Rabat · Marrakech · Fès · Tanger · Agadir · Meknès · Oujda · Kénitra · Salé · Tétouan |

> Les liens WhatsApp sont générés à partir de la constante `WA_NUMBER` dans `assets/js/app.js`.
> Pour changer de numéro, modifiez-la **et** remplacez les liens `https://wa.me/212691733585` dans `index.html`.

## 🗂️ Structure du dépôt

```
.
├── index.html              # Page unique complète (toutes les sections)
├── assets/
│   ├── css/style.css       # Thème or/noir (grille) + navy #0a1946 + vert WhatsApp
│   ├── js/app.js           # Onglets, FAQ, popup, facture, compteur live, clics grille
│   └── img/                # Logo officiel, photo hero, visuels des services, flyer, avatars
├── netlify.toml            # Configuration de déploiement Netlify
├── robots.txt · sitemap.xml
└── README.md
```

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

## 🧭 Sections de la page (dans l'ordre)

1. **Navigation fixe** — logo officiel, liens d'ancrage, bouton WhatsApp, menu mobile.
2. **Hero** — visuel plein largeur, badge « Agence N°1 », *Votre maison, entre de bonnes mains*,
   slogan « Simplifiez-vous la vie ! », compteur de visiteurs, compte à rebours, statistiques.
3. **Bandeau de confiance** — ✅ Profils vérifiés et sélectionnés · ⭐ Expérience et professionnalisme ·
   🤝 Accompagnement personnalisé *(garanties du flyer officiel)*.
4. **Comment ça marche** — 4 étapes : formulaire → profil en 24h → rencontre & placement → suivi.
5. **Mini-formulaire** — nom, téléphone + service (19 options de la grille), ville (11 villes), préférence, délai.
6. **Avis clients** — 3 témoignages 5 étoiles + **flyer de la grille tarifaire officielle**.
7. **Nos Pack & Tarifs** — 5 onglets : 🧹 Ménage · 🧸 Nounou · 🍳 Cuisine · ❤️ Garde malade · ⏰ À la journée
   (17 cartes de service avec visuels et bouton « Réserver »).
8. **Grille tarifaire des services** — tableau complet des 14 services en version web cliquable.
9. **Frais de Mise en relation** — 💎 Premium 1 000 DH · 🛡️ Sérénité 500 DH.
10. **FAQ** — 12 questions/réponses, salaires issus de la grille officielle.
11. **Formulaire de réservation** — confirmation + **facture YS-XXXXXX**.
12. **Éléments persistants** — bouton WhatsApp flottant, bandeau « Demandes d'emploi non acceptées », footer.

## ⚙️ Comportements JavaScript (`assets/js/app.js`)

- Compteur de visiteurs, compte à rebours d'offre (mémorisé en `localStorage`).
- Notifications de preuve sociale alignées sur la grille officielle (toutes les 22 s).
- Onglets des packs, accordéon FAQ, animations au scroll.
- **Clic sur une ligne de la grille** (ou sur une carte) → popup « Réserver ce pack » pré-rempli.
- Validation des formulaires (nom + téléphone obligatoires, surlignage + secousse).
- Génération de la **facture de confirmation** (n° `YS-######`, date, service, garanties, étapes)
  et lien « Confirmer sur WhatsApp » pré-rempli.
- Normalisation automatique des numéros : `06…` → `+212 6…`.

## 🚀 Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## 🎨 Charte

| Élément | Valeur |
|---|---|
| Or (grille, accents) | `#d8b361` / `#f2db9b` / `#b68b39` |
| Noir / navy | `#030f20` · `#0b2035` |
| Rouge (flyer) | `#c1121f` |
| Vert WhatsApp | `#08733d` / `#004c2b` |
| Titres | Playfair Display · Textes : Inter |

## ✏️ À personnaliser

- **Photos réelles** de l'agence dans `assets/img/` (garder les mêmes noms de fichiers).
- **Logo** : `assets/img/logo.png` (également utilisé comme favicon).
- **Flyer** : `assets/img/grille-tarifaire.jpg` — pour utiliser la version originale, remplacez
  simplement ce fichier par votre image (mêmes nom et extension).
- **Pixel Facebook / Google Analytics** : à ajouter avant toute campagne publicitaire.

### Images binaires à fournir

Le diff fourni ne contient pas les données binaires. Le logo existant est conservé ;
sa nouvelle version reste à fournir, ainsi que les fichiers suivants dans `assets/img/` :

- `garde-malade-menage.jpg`
- `garde-malade.jpg`
- `grille-tarifaire.jpg`
- `pack-aide-cuisine.jpg`
- `pack-cuisine-simple.jpg`
- `pack-menage-villa.jpg`
- `pack-nounou-multi.jpg`

Les références HTML du diff sont conservées : ces sept images ne s'afficheront pas
avant l'ajout des fichiers originaux.

### Visuel d’accueil

`assets/img/hero-services.jpg` est une illustration photoréaliste générée par IA,
inspirée de la présentation de Yallah Services (personnel pour particuliers et
entreprises au Maroc). Elle ne représente pas l’équipe réelle ni des candidats
disponibles. Elle sert également de visuel de partage Open Graph.

### Thème inspiré de l’affiche publicitaire

`assets/css/brand.css`, chargé après les styles de structure, décline le bleu nuit,
l’or satiné, le blanc et le vert profond sur les sections, cartes, formulaires,
fenêtres de réservation et confirmation. Montserrat et Barlow Condensed sont
des équivalents visuels des lettres de l’affiche, dont les polices sources ne
sont pas connues. Le rouge reste réservé aux erreurs de saisie.
