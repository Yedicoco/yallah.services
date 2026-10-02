# Yalla Services — Aides à domicile au Maroc

Reproduction du site **https://yalla-services.netlify.app/** — agence de placement de personnel
subsaharien qualifié (femme de ménage, nounou, cuisinière) au Maroc.

## 📞 Contacts officiels

| Canal | Coordonnées |
|---|---|
| **WhatsApp** | **+212 691 733 585** → [wa.me/212691733585](https://wa.me/212691733585) |
| **E-mail** | **servicesyallah@gmail.com** |
| Zones | Casablanca · Rabat · Marrakech · Tanger · Agadir · Fès · Meknès |

> Les liens WhatsApp sont générés automatiquement à partir de la constante `WA_NUMBER`
> dans `assets/js/app.js`. Pour changer de numéro, il suffit de la modifier **et** de remplacer
> les liens `https://wa.me/212691733585` dans `index.html`.

## 🗂️ Structure du dépôt

```
.
├── index.html              # Page unique complète (toutes les sections)
├── assets/
│   ├── css/style.css       # Feuille de style (thème navy #0a1946 + or #f0a500 + vert WhatsApp)
│   ├── js/app.js           # Interactions (onglets, FAQ, popup, facture, compteur live…)
│   └── img/                # Logo, photo hero, visuels des packs, avatars des avis
├── netlify.toml            # Configuration de déploiement Netlify
└── README.md
```

## 🧭 Sections de la page (dans l'ordre)

1. **Navigation fixe** — logo, liens d'ancrage, bouton WhatsApp, menu mobile (hamburger).
2. **Hero** — visuel plein largeur, badge « Agence N°1 », titre *Votre maison, entre de bonnes mains*,
   compteur de visiteurs en direct, compte à rebours d'urgence, statistiques (500+ familles,
   100 % remplacement, 24 h, 6 mois de garantie) et mention « Demandes d'emploi non acceptées ».
3. **Bandeau de confiance** — Personnel vérifié · Remplacement garanti · Profil en 24 h · 500+ familles.
4. **Comment ça marche** — 4 étapes : formulaire → profil en 24 h → rencontre & placement → suivi.
5. **Mini-formulaire (above the fold)** — nom, téléphone + service, ville, nationalité, logée/non logée, délai.
6. **Avis clients** — 3 témoignages 5 étoiles + conversation WhatsApp type « clients réels » (vérifiés).
7. **Nos Packs & Offres** — 3 onglets :
   - 🏠 **Logée** : Ménage 3 000 DH/mois · Nounou 3 000 DH/mois · Cuisine 4 000 DH/mois ·
     Ménage + Nounou 3 500 DH/mois · Ménage + Cuisine 3 500 DH/mois · Nouvelle Fille 2 500 DH/mois
   - ⏰ **Non logée** (8 h max · Casa & Rabat) : Ménage 600 DH/sem · Ménage + Cuisine 800 DH/sem ·
     Ménage + Nounou 800 DH/sem
   - 🧹 **Partiel** : Ménage normal (Villa 400 / Appart 300 DH) · Grand ménage (Villa 700 / Appart 500 DH)
     — 💰 paiement après service · 🧴 matériel fourni par le client · 📅 réservez 1 jour à l'avance
8. **Frais d'agence** — 💎 Premium 1 000 DH (remplacements gratuits 6 mois) ·
   🛡️ Sérénité 500 DH (remplacements gratuits 2 mois) — payés **après validation du profil**.
9. **FAQ** — 12 questions/réponses (délais, garanties, paiement, logée/non logée, villes, salaires,
   rencontre, langues, maladie/départ, recrutement direct, contrat).
10. **Formulaire de réservation** — nom, WhatsApp, service (13 options), ville, préférence, délai,
    type de poste, message → confirmation + **facture YS-XXXXXX** téléchargeable visuellement.
11. **Popup « Réserver ce pack »** — s'ouvre depuis n'importe quelle carte de pack.
12. **Éléments persistants** — bouton WhatsApp flottant, bandeau rouge bas de page, footer.

## ⚙️ Comportements JavaScript (`assets/js/app.js`)

- Compteur de visiteurs aléatoire (14–47) rafraîchi toutes les 6 s.
- Compte à rebours d'offre (2 j 14 h 32 m) mémorisé dans `localStorage`.
- Notifications de preuve sociale (réservations récentes) toutes les 22 s.
- Onglets des packs, accordéon FAQ, animations d'apparition au scroll.
- Validation des formulaires (nom + téléphone obligatoires, surlignage rouge + secousse).
- Génération de la **facture de confirmation** (numéro `YS-######`, date, service, garanties,
  prochaines étapes) et lien « Confirmer sur WhatsApp » pré-rempli.
- Normalisation automatique des numéros : `06…` → `+212 6…`.

## 🚀 Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## ☁️ Déployer sur Netlify

Le fichier `netlify.toml` est déjà configuré (dossier publié : racine du dépôt).
Deux options :

1. **Netlify Drop** — glisser/déposer le dossier sur https://app.netlify.com/drop
2. **Git** — connecter le dépôt GitHub, aucune commande de build n'est nécessaire.

## 🎨 Charte

| Élément | Valeur |
|---|---|
| Bleu nuit | `#0a1946` / `#050c28` |
| Or | `#f0a500` / `#ffcc44` |
| Vert WhatsApp | `#25D366` / `#1aab55` |
| Titres | Playfair Display |
| Textes | Inter |

## ✏️ À personnaliser

- **Remplacer les visuels** de `assets/img/` par les photos réelles de l'agence
  (conserver les mêmes noms de fichiers ou mettre à jour les `src` dans `index.html`).
- **Logo** : `assets/img/logo.png` (carré, fond bleu nuit — utilisé aussi en favicon).
- **Avatars des avis** : `assets/img/avis-fatima.jpg`, `avis-karim.jpg`, `avis-nadia.jpg`.
- **Pixel Facebook / Google Analytics** : balises non incluses (pensez à les ajouter avant
  toute campagne publicitaire).
