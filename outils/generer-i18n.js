#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Génération des dictionnaires de traduction

   Les traductions s'écrivent dans contenu/i18n/traductions/ :

       contenu/i18n/traductions/<page>.<langue>.json

       {
         "1": "Home",
         "2": "Yallah Services, home",
         "12": "Our services, city by city"
       }

   Les nombres renvoient à la liste des chaînes extraites par
   outils/extraire-i18n.js (--json), dans l'ordre du document :
   · langue « en »            → liste française de la page ;
   · darija (dar / dar-latn)  → liste arabe d'origine pour les pages
     candidat (qui portent déjà les deux langues), liste française sinon.

   Ce script produit assets/i18n/<langue>/<page>.js, avec les clés
   exactes du HTML : aucune faute de frappe possible dans les clés, et
   toute chaîne oubliée ou renseignée deux fois est signalée.

       node outils/generer-i18n.js             écrit les dictionnaires
       node outils/generer-i18n.js --verifier  contrôle sans écrire
       node outils/generer-i18n.js --page index.html --langue en

   Si le HTML change, relancer d'abord :
       node outils/extraire-i18n.js --json
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RACINE = path.resolve(__dirname, '..');
const FICHIER_CLES = path.join(RACINE, 'contenu', 'i18n', 'cles.json');
const DOSSIER_TRAD = path.join(RACINE, 'contenu', 'i18n', 'traductions');
const LANGUES = ['dar', 'dar-latn', 'en'];

function argument(nom, defaut) {
  const position = process.argv.indexOf(nom);
  return position !== -1 && process.argv[position + 1] ? process.argv[position + 1] : defaut;
}

const VERIFIER = process.argv.includes('--verifier');
const SEULE_PAGE = argument('--page', null);
const SEULE_LANGUE = argument('--langue', null);

if (!fs.existsSync(FICHIER_CLES)) {
  console.error('❌ contenu/i18n/cles.json absent. Lancez : node outils/extraire-i18n.js --json');
  process.exit(1);
}
const CLES = JSON.parse(fs.readFileSync(FICHIER_CLES, 'utf8'));

/* Toutes les sources du site : sert à vérifier que les traductions libres
   (_extra) correspondent bien à un texte réellement écrit par le site. */
const SOURCES = (() => {
  let tout = '';
  const lire = (dossier, filtre) => {
    fs.readdirSync(dossier).filter(filtre).forEach((nom) => {
      tout += fs.readFileSync(path.join(dossier, nom), 'utf8');
    });
  };
  lire(RACINE, (f) => f.endsWith('.html'));
  lire(path.join(RACINE, 'assets', 'js'), (f) => f.endsWith('.js'));
  return new Set([tout]);
})();

/* Découpe un texte en phrases : permet de dire « cette clé existe » même
   lorsqu'elle est construite différemment dans le code. */
function sourceContient(texte) {
  for (const bloc of SOURCES) {
    /* les apostrophes et guillemets sont échappés dans le code source */
    const detendu = bloc.replace(/\\'/g, "'").replace(/\\"/g, '"');
    if (bloc.indexOf(texte) !== -1 || detendu.indexOf(texte) !== -1) return true;
  }
  return false;
}

/* Liste des chaînes attendues pour un couple page / langue. */
function listeAttendue(page, langue) {
  const entree = CLES[page];
  if (!entree) return null;
  if (langue === 'en') return entree.clesFrancais;
  return entree.bilingue ? entree.clesArabe : entree.clesFrancais;
}

/* Empreinte de la liste des chaînes : si le HTML change, les indices des
   traductions ne correspondent plus, et on le voit tout de suite. */
function empreinte(cles) {
  return crypto.createHash('sha1').update(cles.map((c) => c.cle).join('\u0000')).digest('hex').slice(0, 16);
}

function fichierTrad(page, langue) {
  return path.join(DOSSIER_TRAD, page.replace(/\.html$/, '') + '.' + langue + '.json');
}

function echapper(texte) {
  return JSON.stringify(String(texte));
}

/* Une clé « @attribut:texte » indique au moteur OÙ écrire la traduction
   (attribut alt / placeholder / title, meta, message WhatsApp pré-rempli).
   Le préfixe ne fait jamais partie du texte affiché : une traduction qui le
   reprend écrit « @alt:… » dans la page, ou « @wa:… » en tête du message que
   le visiteur envoie. */
const PREFIXE_CLE = /^@(?:placeholder|title|alt|aria-label|meta:|wa:)/;


/* Écrit un fichier lisible : une clé par ligne, dans l'ordre du document,
   puis les traductions libres de « _extra » (textes écrits par le
   JavaScript : messages d'erreur, récapitulatif de la fiche, tableau de
   suivi…), qui ne figurent pas dans le HTML. */
function rendreDictionnaire(page, langue, cles, traductions) {
  const nomPage = page.replace(/\.html$/, '');
  const lignes = [];
  let manquantes = 0;
  cles.forEach((entree, position) => {
    const valeur = traductions[position + 1];
    if (valeur === undefined || valeur === '') { manquantes += 1; return; }
    lignes.push('  ' + echapper(entree.cle) + ': ' + echapper(valeur) + ',');
  });
  const libres = traductions._extra || {};
  const dejaVues = new Set(cles.map((c) => c.cle));
  Object.keys(libres).forEach((cle) => {
    const valeur = libres[cle];
    if (!valeur) { manquantes += 1; return; }
    if (dejaVues.has(cle)) { console.log('   ⚠️  « ' + cle.slice(0, 50) + ' » est déjà traduit automatiquement.'); return; }
    if (!sourceContient(cle)) {
      console.log('   ⚠️  clé libre introuvable dans les sources : « ' + cle.slice(0, 60) + ' »' +
        (cle.length > 12 ? ' — vérifiez l\'orthographe, sinon la traduction ne s\'appliquera jamais.' : ''));
    }
    lignes.push('  ' + echapper(cle) + ': ' + echapper(valeur) + ',');
  });
  if (lignes.length) lignes[lignes.length - 1] = lignes[lignes.length - 1].replace(/,$/, '');
  const entete =
    '/* ══════════════════════════════════════════════════════════════════\n' +
    '   YALLAH SERVICES — Dictionnaire ' + langue.toUpperCase() + ' · ' + page + '\n' +
    '   ' + cles.length + ' chaînes, clés = textes d\'origine de la page.\n' +
    '   Généré par outils/generer-i18n.js depuis\n' +
    '   contenu/i18n/traductions/' + nomPage + '.' + langue + '.json — ne pas\n' +
    '   modifier ce fichier à la main : modifier la traduction puis relancer\n' +
    '       node outils/generer-i18n.js\n' +
    '══════════════════════════════════════════════════════════════════ */\n';
  return { contenu: entete + 'YS_TRAD(' + echapper(langue) + ', ' + echapper(nomPage) + ', {\n' + lignes.join('\n') + '\n});\n', manquantes };
}

function traiter(page, langue) {
  const cles = listeAttendue(page, langue);
  if (!cles) { console.log('⚠️  ' + page + ' : page inconnue de l\'extraction.'); return 0; }
  const fichier = fichierTrad(page, langue);
  if (!fs.existsSync(fichier)) {
    console.log('⬜ ' + page + ' · ' + langue + ' : ' + cles.length + ' chaînes à traduire — fichier ' +
      path.relative(RACINE, fichier) + ' à créer.');
    return cles.length;
  }
  let traductions;
  try {
    traductions = JSON.parse(fs.readFileSync(fichier, 'utf8'));
  } catch (e) {
    console.log('❌ ' + page + ' · ' + langue + ' : ' + path.relative(RACINE, fichier) + ' illisible (' + e.message + ').');
    return 0;
  }

  const problemes = [];
  const utilisees = new Set();

  /* Contrôle d'empreinte : les traductions sont écrites par indice, elles
     ne valent que pour la version du HTML qui les a produites. */
  const signature = empreinte(cles);
  if (traductions._empreinte && traductions._empreinte !== signature) {
    problemes.push('le HTML de la page a changé depuis ces traductions (empreinte ' +
      traductions._empreinte + ' → ' + signature + '). Relancez l\'extraction puis vérifiez les ' +
      'indices avant de régénérer.');
  }

  Object.keys(traductions).forEach((indice) => {
    if (indice === '_extra' || indice === '_empreinte') return;
    const nombre = parseInt(indice, 10);
    if (!Number.isFinite(nombre) || String(nombre) !== indice) { problemes.push('indice non numérique : « ' + indice + ' »'); return; }
    if (nombre < 1 || nombre > cles.length) { problemes.push('indice hors liste : ' + nombre + ' (1 à ' + cles.length + ')'); return; }
    if (utilisees.has(nombre)) problemes.push('indice écrit deux fois : ' + nombre);
    utilisees.add(nombre);
    if (String(traductions[indice]).trim() === '') problemes.push('traduction vide à l\'indice ' + nombre + ' (' + cles[nombre - 1].cle.slice(0, 45) + '…)');
    const prefixe = PREFIXE_CLE.exec(cles[nombre - 1].cle);
    if (prefixe && String(traductions[indice]).startsWith(prefixe[0])) {
      problemes.push('indice ' + nombre + ' : la traduction reprend le préfixe de la clé « ' + prefixe[0] +
        ' » — retirez-le, ce préfixe dit seulement où écrire le texte');
    }
  });

  Object.keys(traductions._extra || {}).forEach((cle) => {
    const prefixe = PREFIXE_CLE.exec(cle);
    if (prefixe && String(traductions._extra[cle]).startsWith(prefixe[0])) {
      problemes.push('clé libre « ' + cle.slice(0, 40) + ' » : la traduction reprend le préfixe « ' + prefixe[0] + ' »');
    }
  });

  const resultat = rendreDictionnaire(page, langue, cles, traductions);
  const absentes = cles.length - resultat.manquantes;

  if (problemes.length) {
    console.log('❌ ' + page + ' · ' + langue + ' :\n   - ' + problemes.slice(0, 12).join('\n   - ') +
      (problemes.length > 12 ? '\n   - … et ' + (problemes.length - 12) + ' autre(s)' : ''));
  }

  const cible = path.join(RACINE, 'assets', 'i18n', langue, page.replace(/\.html$/, '.js'));
  if (!VERIFIER && !problemes.length) {
    if (traductions._empreinte !== signature) {
      traductions._empreinte = signature;
      fs.writeFileSync(fichier, JSON.stringify(traductions, null, 2) + '\n', 'utf8');
    }
    fs.mkdirSync(path.dirname(cible), { recursive: true });
    fs.writeFileSync(cible, resultat.contenu, 'utf8');
  }

  const etat = resultat.manquantes === 0 && problemes.length === 0 ? '✅' : '⚠️ ';
  console.log(etat + ' ' + page + ' · ' + langue + ' : ' + absentes + '/' + cles.length + ' traduites' +
    (resultat.manquantes ? ' — ' + resultat.manquantes + ' sans traduction' : '') +
    (problemes.length ? ' — ' + problemes.length + ' problème(s) d\'indice' : '') +
    (VERIFIER ? ' (vérification seule)' : ' → assets/i18n/' + langue + '/' + page.replace(/\.html$/, '.js')));
  return resultat.manquantes + problemes.length;
}

let restant = 0;
Object.keys(CLES).forEach((page) => {
  if (SEULE_PAGE && page !== SEULE_PAGE) return;
  LANGUES.forEach((langue) => {
    if (SEULE_LANGUE && langue !== SEULE_LANGUE) return;
    restant += traiter(page, langue);
  });
});

console.log('');
if (restant === 0 && !VERIFIER) console.log('✅ Dictionnaires à jour.');
else if (VERIFIER) console.log(restant === 0 ? '✅ Tout est traduit.' : '❌ ' + restant + ' chaîne(s) en attente de traduction.');
/* Un dictionnaire incomplet ou mal écrit n'est jamais publié : le fichier
   reste dans son état précédent. Autant le dire franchement (code 1), sinon
   la publication continue avec un dictionnaire périmé. */
process.exit(restant === 0 ? 0 : 1);
