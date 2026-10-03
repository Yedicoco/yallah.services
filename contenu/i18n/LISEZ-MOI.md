# Affichage multilingue — mode d'emploi

Le site s'affiche en **quatre affichages** à partir du même fichier HTML :

| Bouton | Ce que voit le visiteur | Sens de lecture |
|---|---|---|
| **FR** | français | gauche → droite |
| **الدارجة** | darija marocaine en **lettres arabes** | **droite → gauche** |
| **Darija** | darija marocaine en **lettres latines** (Arabizi) | gauche → droite |
| **EN** | anglais | gauche → droite |

Le sélecteur est dans la barre de navigation de toutes les pages couvertes
(et dans le menu du téléphone, sur l'accueil). Le choix du visiteur est
mémorisé : il le retrouve sur la page suivante.

## Voir le résultat

* Sur la version locale (aperçu) : `http://localhost:3000/`
* En forçant une langue : ajoutez `?langue=dar`, `?langue=dar-latn`,
  `?langue=en` ou `?langue=fr` à l'adresse.
  Exemple : `http://localhost:3000/candidature.html?langue=dar`

## Pages déjà en quatre langues

| Page | Chaînes traduites |
|---|---|
| `index.html` (accueil) | 457 |
| `candidature.html` (fiche candidat) | 94 en anglais · 79 en darija |
| `candidature-confirmation.html` | 48 en anglais · 32 en darija |
| `personnel-entreprises.html` (hub entreprises) | 93 |
| `services-par-ville.html` (hub ville) | 89 |

**Total : 2 281 traductions.** Les dix pages « service × ville »
(`nounou-casablanca.html`, `femme-menage-marrakech.html`, `nounou-rabat.html`…)
restent en français : le site ne peut pas « casser », elles s'affichent simplement
dans leur langue de base et sans sélecteur. Elles viendront avec le même outil
(les six pages de Casablanca sont générées par `outils/generer-pages-villes.js`,
la traduction doit donc y passer par `contenu/pages/*.json`).

## Ce qui est traduit automatiquement

Le texte visible, mais aussi : les champs de saisie (`placeholder`), les
infobulles et libellés d'accessibilité (`title`, `aria-label`), les descriptions
d'images (`alt`), les **noms de packs** affichés et envoyés sur WhatsApp, les
**messages WhatsApp pré-remplis** (le message part dans la langue choisie), le
titre de l'onglet du navigateur et les balises meta (description, Open Graph,
Twitter).

Les textes écrits par le JavaScript (messages d'erreur du formulaire,
récapitulatif de la fiche, notifications) sont retraduits au fur et à mesure.

## Modifier une traduction

1. Ouvrir `contenu/i18n/traductions/<page>.<langue>.json`
   (exemple : `index.dar-latn.json`).
2. Repérer le numéro de la phrase à corriger : il correspond à la liste donnée par
   `node outils/extraire-i18n.js`.
3. Corriger le texte, puis relancer :

```bash
node outils/generer-i18n.js       # recompile les dictionnaires du site
node outils/extraire-i18n.js --verifier   # 0 manquante = tout est traduit
```

### Si le texte français du HTML a changé

Les numéros sont des **positions** dans la liste des chaînes : corriger une
phrase, ajouter un paragraphe ou supprimer une section décale les suivantes.
L'extraction garde la liste précédente et l'outil de réindexation replace
chaque traduction sur sa clé (le texte d'origine, qui ne bouge pas) :

```bash
node outils/extraire-i18n.js --json      # cles.json + cles.prec.json (liste d'avant)
node outils/reindexer-i18n.js --ecrire   # replace les traductions, signale les nouvelles
#   → écrire les chaînes signalées (elles sont listées avec leur numéro)
node outils/generer-i18n.js
node outils/extraire-i18n.js --verifier  # doit afficher 0
```

Les fichiers `assets/i18n/…` sont **générés** : ne pas les modifier à la main,
tout changement serait écrasé à la prochaine compilation.

## Ajouter une page à traduire

```bash
node outils/extraire-i18n.js --json        # 1. relève les chaînes de la page
# 2. écrire contenu/i18n/traductions/<page>.en.json (et .dar.json, .dar-latn.json)
node outils/generer-i18n.js                # 3. compile
node outils/verifier-site.js               # 4. contrôle (section 8)
```

Puis ajouter le nom de la page (sans `.html`) dans la liste `PAGES_TRADUITES`
de `assets/js/i18n.js`.

## Garde-fous

* **Rien ne peut casser une page** : sans dictionnaire, la page reste dans sa
  langue de base et le sélecteur n'est pas affiché.
* **Empreinte des clés** : si le HTML change, le générateur refuse d'écrire les
  dictionnaires (aucun risque de traduction décalée en silence).
* **Test automatique** (`node outils/tester-i18n.js`, avec `npm i jsdom`) :
  vérifie les 4 affichages sur les 5 pages — langue, sens d'écriture,
  application des 2 281 clés, retour au français sans résidu.
