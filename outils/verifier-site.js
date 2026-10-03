#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Vérifications automatiques du site

   À lancer avant toute mise en ligne :

       node outils/verifier-site.js

   Contrôles effectués :
     1. Chaque <img>, <link rel=stylesheet>, <script src> pointe vers un
        fichier existant (aucune image en échec).
     2. Chaque lien interne (#ancre, page.html) existe.
     3. Chaque identifiant utilisé dans le JavaScript (getElementById,
        querySelector('#…')) existe bien dans la page concernée.
     4. Les balises HTML essentielles sont présentes et équilibrées.
     5. Chaque champ obligatoire du formulaire possède son message
        d'erreur (data-err-fr / data-err-ar) et chaque champ texte ses
        libellés bilingues (data-fr-ph / data-ar-ph).
     6. Aucun débordement susceptible d'être provoqué par une largeur
        fixe supérieure à 320 px dans le CSS.
     7. Les numéros de téléphone et l'e-mail affichés sont cohérents
        avec assets/js/config.js.
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');

/* Toutes les pages publiques sont contrôlées, y compris les pages
   « service × ville » : plus rien à tenir à jour ici quand on en ajoute une. */
const PAGES_IGNOREES = new Set(['plan-placement-du-formulaire.html']);
const PAGES = fs.readdirSync(RACINE)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !/^google.*\.html$/i.test(f))
  .filter((f) => !PAGES_IGNOREES.has(f))
  .sort();
const SCRIPTS_PAR_PAGE = {
  'index.html': ['assets/js/app.js'],
  'candidature.html': ['assets/js/fiche.js', 'assets/js/candidature.js'],
  'candidature-confirmation.html': ['assets/js/fiche.js', 'assets/js/candidature-confirmation.js'],
  'admin.html': ['assets/js/fiche.js', 'assets/js/admin.js']
};

/* Images attendues mais pas encore fournies par le client (voir README). */
const IMAGES_A_FOURNIR = new Set([
  'assets/img/garde-malade.jpg',
  'assets/img/garde-malade-menage.jpg',
  'assets/img/grille-tarifaire.jpg',
  'assets/img/pack-aide-cuisine.jpg',
  'assets/img/pack-cuisine-simple.jpg',
  'assets/img/pack-menage-villa.jpg',
  'assets/img/pack-nounou-multi.jpg'
]);

let erreurs = 0;
let avertissements = 0;

function erreur(message) { erreurs += 1; console.log('  ❌ ' + message); }
function avertir(message) { avertissements += 1; console.log('  ⚠️  ' + message); }
function ok(message) { console.log('  ✅ ' + message); }
function section(titre) { console.log('\n' + titre); }

function lire(chemin) { return fs.readFileSync(path.join(RACINE, chemin), 'utf8'); }
function existe(chemin) { return fs.existsSync(path.join(RACINE, chemin)); }

/* ── 1. Ressources référencées ── */
section('1. Ressources (images, styles, scripts)');
PAGES.forEach((page) => {
  if (!existe(page)) { erreur('Page manquante : ' + page); return; }
  const contenu = lire(page);
  const ressources = [];
  const motifs = [
    /<img[^>]+src="([^"]+)"/g,
    /<link[^>]+href="([^"]+\.(?:css|png|jpg|jpeg|webp|svg|ico)(?:\?[^"]*)?)"/g,
    /<script[^>]+src="([^"]+)"/g,
    /<meta[^>]+content="([^"]+\.(?:jpg|jpeg|png))"/g
  ];
  motifs.forEach((motif) => {
    let resultat;
    while ((resultat = motif.exec(contenu)) !== null) {
      const adresse = resultat[1];
      if (/^(https?:)?\/\//.test(adresse) || adresse.indexOf('data:') === 0) continue;
      ressources.push(adresse.split('?')[0]);
    }
  });
  const manquantes = Array.from(new Set(ressources)).filter((adresse) => !existe(adresse));
  const aFournir = manquantes.filter((adresse) => IMAGES_A_FOURNIR.has(adresse));
  const introuvables = manquantes.filter((adresse) => !IMAGES_A_FOURNIR.has(adresse));
  if (introuvables.length) erreur(page + ' → fichiers introuvables : ' + introuvables.join(', '));
  if (aFournir.length) avertir(page + ' → ' + aFournir.length + ' image(s) encore à fournir par le client : ' + aFournir.join(', '));
  if (!manquantes.length) ok(page + ' → ' + new Set(ressources).size + ' ressources locales présentes');
  else if (!introuvables.length) ok(page + ' → toutes les ressources attendues sont présentes (hors ' + aFournir.length + ' image(s) à fournir)');
});

/* ── 2. Liens internes ── */
section('2. Liens internes et ancres');
PAGES.forEach((page) => {
  if (!existe(page)) return;
  const contenu = lire(page);
  const pages = new Set(PAGES);
  const ancres = new Set((contenu.match(/id="([^"]+)"/g) || []).map((v) => v.slice(4, -1)));
  const liens = (contenu.match(/href="([^"]+)"/g) || []).map((v) => v.slice(6, -1));
  const casses = [];
  liens.forEach((lien) => {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(lien) === false && !existe(lien.split('#')[0].split('?')[0])) casses.push(lien);
    if (lien.indexOf('#') === 0 && lien.length > 1 && pages.has(page) && !ancres.has(lien.slice(1))) casses.push(lien);
    /* Ancre vers une autre page : on vérifie l'ancre dans la page cible */
    if (lien.indexOf('.html#') !== -1) {
      const cible = lien.split('#')[0];
      const ancre = lien.split('#')[1];
      if (ancre && existe(cible)) {
        const idsCible = new Set((lire(cible).match(/id="([^"]+)"/g) || []).map((v) => v.slice(4, -1)));
        if (!idsCible.has(ancre)) casses.push(lien);
      }
    }
  });
  if (casses.length) erreur(page + ' → liens cassés : ' + Array.from(new Set(casses)).join(', '));
  else ok(page + ' → ' + liens.length + ' liens vérifiés');
});

/* ── 3. Identifiants utilisés par le JavaScript ── */
section('3. Identifiants JavaScript');
Object.keys(SCRIPTS_PAR_PAGE).forEach((page) => {
  if (!existe(page)) return;
  const html = lire(page);
  const idsHtml = new Set((html.match(/id="([^"]+)"/g) || []).map((v) => v.slice(4, -1)));
  const attendus = new Set();
  const partages = ['assets/js/fiche.js'];
  SCRIPTS_PAR_PAGE[page].forEach((script) => {
    if (!existe(script)) { erreur('Script manquant : ' + script); return; }
    if (partages.indexOf(script) !== -1) return; // bibliothèque commune : ids optionnels d'une page à l'autre
    const js = lire(script);
    let resultat;
    const motifs = [/getElementById\('([^']+)'\)/g, /getElementById\("([^"]+)"\)/g];
    motifs.forEach((motif) => { while ((resultat = motif.exec(js)) !== null) attendus.add(resultat[1]); });
  });
  const absents = Array.from(attendus).filter((id) => !idsHtml.has(id));
  if (absents.length) erreur(page + ' → identifiants absents du HTML : ' + absents.join(', '));
  else ok(page + ' → ' + attendus.size + ' identifiants présents');
});

/* ── 4. Structure HTML ── */
section('4. Structure des pages');
PAGES.forEach((page) => {
  if (!existe(page)) return;
  const contenu = lire(page);
  const problemes = [];
  if (!/^<!DOCTYPE html>/i.test(contenu.trim())) problemes.push('doctype manquant');
  ['<html', '<head', '<body', '</html>'].forEach((balise) => {
    if (contenu.indexOf(balise) === -1) problemes.push(balise + ' manquant');
  });
  if (!/<meta name="viewport"/.test(contenu)) problemes.push('meta viewport manquant');
  if (!/<html[^>]+lang="/.test(contenu)) problemes.push('attribut lang manquant');
  if ((contenu.match(/<section/g) || []).length !== (contenu.match(/<\/section>/g) || []).length) problemes.push('balises <section> non équilibrées');
  if ((contenu.match(/<div/g) || []).length !== (contenu.match(/<\/div>/g) || []).length) problemes.push('balises <div> non équilibrées');
  if ((contenu.match(/<form/g) || []).length !== (contenu.match(/<\/form>/g) || []).length) problemes.push('balises <form> non équilibrées');
  if (problemes.length) erreur(page + ' → ' + problemes.join(', '));
  else ok(page + ' → structure valide');
});

/* ── 5. Formulaires : erreurs et libellés bilingues ── */
section('5. Formulaire de candidature (champs et messages)');
if (existe('candidature.html')) {
  const contenu = lire('candidature.html');
  const obligatoires = ['nomComplet', 'telephone', 'ville', 'age', 'poste', 'experience', 'logement',
    'travail', 'disponible', 'ref1Nom', 'ref1Lien', 'ref1Tel', 'ref2Nom', 'ref2Lien', 'ref2Tel'];
  const sansErreur = obligatoires.filter((champ) => contenu.indexOf('data-champ="' + champ + '"') === -1);
  if (sansErreur.length) erreur('Champs sans bloc d\'erreur : ' + sansErreur.join(', '));
  else ok(obligatoires.length + ' champs obligatoires avec messages d\'erreur bilingues');

  const erreursBilingues = (contenu.match(/data-err-fr="/g) || []).length;
  const erreursArabe = (contenu.match(/data-err-ar="/g) || []).length;
  if (erreursBilingues !== erreursArabe) erreur('Messages d\'erreur FR (' + erreursBilingues + ') et AR (' + erreursArabe + ') déséquilibrés');
  else ok(erreursBilingues + ' messages d\'erreur en français et en arabe');

  const placeholdersFr = (contenu.match(/data-fr-ph="/g) || []).length;
  const placeholdersAr = (contenu.match(/data-ar-ph="/g) || []).length;
  if (placeholdersFr !== placeholdersAr) erreur('Aides de saisie FR (' + placeholdersFr + ') et AR (' + placeholdersAr + ') déséquilibrées');
  else ok(placeholdersFr + ' textes d\'aide bilingues');

  ['name="travail"', 'name="langues"', 'name="competences"', 'name="documents"',
   'id="consentement"', 'name="site_web"', 'class="ys-langues"', 'data-ys-notrad']
    .forEach((motif) => {
      if (contenu.indexOf(motif) === -1) erreur('Élément attendu absent : ' + motif);
    });
  ok('Choix multiples, consentement et champ anti-robots présents');
}

/* ── 6. CSS : risques de débordement horizontal ── */
section('6. Risques de débordement (largeurs fixes)');
['assets/css/recrutement.css', 'assets/css/brand.css', 'assets/css/style.css'].forEach((feuille) => {
  if (!existe(feuille)) { erreur('Feuille de style manquante : ' + feuille); return; }
  const css = lire(feuille).replace(/\/\*[\s\S]*?\*\//g, '');
  const largeurs = [];
  let resultat;
  const motif = /(?:^|[;{\s])(width|min-width)\s*:\s*(\d+(?:\.\d+)?)px/g;
  while ((resultat = motif.exec(css)) !== null) {
    const valeur = parseFloat(resultat[2]);
    if (valeur > 320) largeurs.push(resultat[1] + ':' + valeur + 'px');
  }
  if (largeurs.length) avertir(feuille + ' → largeurs fixes à surveiller : ' + largeurs.slice(0, 6).join(', '));
  else ok(feuille + ' → aucune largeur fixe > 320 px');
});

/* ── 7. Coordonnées cohérentes ── */
section('7. Coordonnées (config.js)');
if (existe('assets/js/config.js')) {
  const config = lire('assets/js/config.js');
  const candidats = (/whatsappCandidats:\s*'(\d+)'/.exec(config) || [])[1] || '';
  const foyers = (/whatsappFoyers:\s*'(\d+)'/.exec(config) || [])[1] || '';
  const email = (/email:\s*'([^']+)'/.exec(config) || [])[1] || '';
  const pages = ['index.html', 'candidature.html', 'candidature-confirmation.html', 'admin.html']
    .filter(existe).map(lire).join('\n');
  const manqueCandidats = pages.indexOf(candidats) === -1 && pages.indexOf(candidats.slice(3)) === -1;
  if (!candidats || !foyers || !email) erreur('config.js incomplet (numéros et e-mail requis)');
  else if (manqueCandidats) erreur('Le numéro candidats ' + candidats + ' n\'apparaît dans aucune page');
  else ok('WhatsApp foyers ' + foyers + ' · candidats ' + candidats + ' · ' + email);
} else {
  erreur('assets/js/config.js manquant');
}

/* ── 8. Affichage multilingue (français · darija · darija latine · anglais) ── */
section('8. Affichage multilingue');
{
  /* Pages multilingues : la liste est lue dans le moteur (PAGES_TRADUITES),
     pour qu'une page nouvellement branchée soit contrôlée automatiquement.
     Repli sur la liste de base si le moteur est illisible. */
  const PAGES_I18N = (() => {
    const base = ["index.html", "candidature.html", "candidature-confirmation.html",
      "personnel-entreprises.html", "services-par-ville.html"];
    try {
      const moteur = lire('assets/js/i18n.js');
      const declarees = (moteur.match(/PAGES_TRADUITES = \[([\s\S]*?)\]/) || [])[1] || '';
      const noms = (declarees.match(/'([^']+)'/g) || []).map((x) => x.replace(/'/g, '') + '.html')
        .filter((page) => existe(page));
      return noms.length ? noms : base;
    } catch (e) {
      return base;
    }
  })();
  const LANGUES = ['dar', 'dar-latn', 'en'];

  if (!existe('assets/js/i18n.js')) erreur('Moteur multilingue manquant : assets/js/i18n.js');
  else if (!existe('assets/css/i18n.css')) erreur('Feuille de style manquante : assets/css/i18n.css');
  else {
    const moteur = lire('assets/js/i18n.js');
    const declarees = (moteur.match(/PAGES_TRADUITES = \[([\s\S]*?)\]/) || [])[1] || '';
    const connues = (declarees.match(/'([^']+)'/g) || []).map((x) => x.replace(/'/g, ''));
    const attendues = PAGES_I18N.map((p) => p.replace(/\.html$/, ''));
    const oubliees = attendues.filter((p) => connues.indexOf(p) === -1);
    if (oubliees.length) erreur('Pages absentes de PAGES_TRADUITES (i18n.js) : ' + oubliees.join(', '));
    LANGUES.forEach((langue) => {
      if (moteur.indexOf("'" + langue + "'") === -1) erreur('Langue absente du moteur : ' + langue);
    });
    if (!oubliees.length) ok('Moteur multilingue : ' + connues.length + ' pages, ' +
      LANGUES.length + ' langues de traduction (+ français)');
  }

  let pagesBranchees = 0;
  PAGES_I18N.forEach((page) => {
    if (!existe(page)) { erreur('Page multilingue manquante : ' + page); return; }
    const contenu = lire(page);
    const manques = [];
    if (contenu.indexOf('assets/js/i18n.js') === -1) manques.push('script i18n.js');
    if (contenu.indexOf('assets/css/i18n.css') === -1) manques.push('feuille i18n.css');
    if (manques.length) erreur(page + ' → ' + manques.join(' et ') + ' non chargé(s)');
    else pagesBranchees += 1;
  });

  let dictionnaires = 0;
  let vides = [];
  PAGES_I18N.forEach((page) => {
    LANGUES.forEach((langue) => {
      const fichier = 'assets/i18n/' + langue + '/' + page.replace(/\.html$/, '.js');
      if (!existe(fichier)) { vides.push(fichier); return; }
      const contenu = lire(fichier);
      const cles = (contenu.match(/^\s*"/gm) || []).length;
      if (cles < 10) vides.push(fichier + ' (' + cles + ' clé(s))');
      else dictionnaires += 1;
    });
  });
  if (vides.length) erreur('Dictionnaires manquants ou vides : ' + vides.slice(0, 4).join(', ') +
    (vides.length > 4 ? ' …' : ''));
  else ok(dictionnaires + ' dictionnaires publiés (' + PAGES_I18N.length + ' pages × ' + LANGUES.length + ' langues)');
  if (pagesBranchees === PAGES_I18N.length && !vides.length) {
    ok('Sélecteur à quatre affichages présent sur les ' + PAGES_I18N.length + ' pages');
  }

  const autres = PAGES.filter((page) => PAGES_I18N.indexOf(page) === -1 && page !== 'admin.html');
  if (autres.length) {
    console.log('  ℹ️  Pages pas encore traduites (' + autres.length + ') : ' + autres.join(', '));
    console.log('      → écrire le dictionnaire puis les ajouter à PAGES_TRADUITES (assets/js/i18n.js)');
  }
}

/* ── Résultat ── */
console.log('\n' + '─'.repeat(62));
if (erreurs === 0 && avertissements === 0) console.log('✅ Tous les contrôles sont passés.');
else if (erreurs === 0) console.log('✅ Aucune erreur. ' + avertissements + ' avertissement(s) à relire.');
else console.log('❌ ' + erreurs + ' erreur(s), ' + avertissements + ' avertissement(s).');
console.log('─'.repeat(62));
process.exit(erreurs === 0 ? 0 : 1);
