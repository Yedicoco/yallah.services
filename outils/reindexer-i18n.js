#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Réindexation des traductions après une modification
   du HTML

   Les traductions sont écrites par NUMÉRO DE LIGNE dans la liste des
   chaînes relevées par outils/extraire-i18n.js :

       contenu/i18n/traductions/index.dar.json  { "1": "…", "2": "…" }

   Corriger une phrase, ajouter un paragraphe ou supprimer une section
   décale donc tous les numéros suivants : sans réindexation, chaque
   traduction s'applique à la mauvaise phrase (ou à aucune). Ce script
   retrouve les traductions par leur CLÉ (le texte français d'origine,
   qui ne bouge pas) et les réécrit au bon numéro dans la nouvelle liste.

   Utilisation :

       node outils/extraire-i18n.js --json     # écrit cles.json et garde
                                               # l'ancienne en cles.prec.json
       node outils/reindexer-i18n.js           # contrôle (n'écrit rien)
       node outils/reindexer-i18n.js --ecrire  # réécrit les traductions
       node outils/generer-i18n.js             # compile les dictionnaires

   Autres fichiers de référence (par exemple une version conservée dans
   git) :

       node outils/reindexer-i18n.js --avant /tmp/cles-avant.json --ecrire

   Rien n'est inventé : une chaîne nouvelle n'est pas traduite ici, elle
   est signalée avec son numéro pour que le traducteur la complète (le
   générateur, lui, refuse d'écrire un dictionnaire incomplet).
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');
const DOSSIER_I18N = path.join(RACINE, 'contenu', 'i18n');
const DOSSIER_TRAD = path.join(DOSSIER_I18N, 'traductions');
const LANGUES = ['dar', 'dar-latn', 'en'];

function argument(nom, defaut) {
  const position = process.argv.indexOf(nom);
  return position !== -1 && process.argv[position + 1] ? process.argv[position + 1] : defaut;
}

const ECRIRE = process.argv.includes('--ecrire');
const FICHIER_AVANT = argument('--avant', path.join(DOSSIER_I18N, 'cles.prec.json'));
const FICHIER_APRES = argument('--apres', path.join(DOSSIER_I18N, 'cles.json'));

function lireJson(fichier, role) {
  if (!fs.existsSync(fichier)) {
    console.error('❌ ' + role + ' introuvable : ' + path.relative(RACINE, fichier));
    if (role.indexOf('avant') !== -1) {
      console.error('   (relancez d\'abord « node outils/extraire-i18n.js --json » : la version');
      console.error('    précédente y est conservée automatiquement, ou indiquez --avant <fichier>)');
    }
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(fichier, 'utf8'));
  } catch (e) {
    console.error('❌ ' + path.relative(RACINE, fichier) + ' illisible (' + e.message + ').');
    process.exit(1);
  }
}

const AVANT = lireJson(FICHIER_AVANT, 'fichier de clés « avant »');
const APRES = lireJson(FICHIER_APRES, 'fichier de clés « après »');

/* Mêmes règles que outils/generer-i18n.js : l'anglais part des chaînes
   françaises ; la darija part de la version arabe d'origine quand la page
   en porte une (pages candidat), sinon du français. */
function listeAttendue(entree, langue) {
  if (!entree) return [];
  if (langue === 'en') return (entree.clesFrancais || []).map((c) => c.cle);
  return (entree.bilingue ? entree.clesArabe : entree.clesFrancais || []).map((c) => c.cle);
}

function fichierTrad(page, langue) {
  return path.join(DOSSIER_TRAD, page.replace(/\.html$/, '') + '.' + langue + '.json');
}

let totalConservees = 0;
let totalSupprimees = 0;
let totalNouvelles = 0;
let totalConflits = 0;
const aTraduire = [];

Object.keys(APRES).forEach((page) => {
  const ancienne = AVANT[page];
  if (!ancienne) {
    console.log('🆕 ' + page + ' : page nouvelle, ses traductions sont à créer.');
  }

  LANGUES.forEach((langue) => {
    const nouvelles = listeAttendue(APRES[page], langue);
    const anciennes = listeAttendue(ancienne, langue);
    const fichier = fichierTrad(page, langue);
    if (!fs.existsSync(fichier)) {
      if (nouvelles.length) {
        console.log('⬜ ' + page + ' · ' + langue + ' : ' + nouvelles.length +
          ' chaînes à traduire — fichier à créer.');
      }
      return;
    }

    let traductions;
    try {
      traductions = JSON.parse(fs.readFileSync(fichier, 'utf8'));
    } catch (e) {
      console.log('❌ ' + page + ' · ' + langue + ' : ' + path.relative(RACINE, fichier) +
        ' illisible (' + e.message + ').');
      return;
    }

    const positions = new Map();
    nouvelles.forEach((cle, position) => {
      /* une même chaîne peut apparaître deux fois dans une page : on garde
         la première position, comme l'extraction */
      if (!positions.has(cle)) positions.set(cle, position + 1);
    });

    const sortie = {};
    let conservees = 0;
    let supprimees = 0;
    let conflits = 0;

    Object.keys(traductions).forEach((indice) => {
      if (indice === '_extra' || indice === '_empreinte') return;
      const nombre = parseInt(indice, 10);
      if (!Number.isFinite(nombre) || String(nombre) !== indice) return;
      const cle = anciennes[nombre - 1];
      const valeur = traductions[indice];
      if (cle === undefined) { conflits += 1; return; }
      const nouvellePosition = positions.get(cle);
      if (!nouvellePosition) { supprimees += 1; return; }
      if (Object.prototype.hasOwnProperty.call(sortie, String(nouvellePosition))) {
        if (sortie[String(nouvellePosition)] !== valeur) conflits += 1;
        return;
      }
      sortie[String(nouvellePosition)] = valeur;
      conservees += 1;
    });

    const manquantes = [];
    nouvelles.forEach((cle, position) => {
      const numero = String(position + 1);
      if (sortie[numero] === undefined || sortie[numero] === '') {
        manquantes.push({ numero: position + 1, cle });
      }
    });

    const libres = traductions._extra || {};
    if (Object.keys(libres).length) sortie._extra = libres;

    totalConservees += conservees;
    totalSupprimees += supprimees;
    totalConflits += conflits;

    if (ECRIRE && conflits === 0) {
      fs.writeFileSync(fichier, JSON.stringify(sortie, null, 2) + '\n', 'utf8');
    }

    const etat = conflits ? '⚠️ ' : (manquantes.length ? '🟡' : '✅');
    console.log(etat + ' ' + page + ' · ' + langue + ' : ' + conservees + ' traduction(s) replacée(s)' +
      (supprimees ? ', ' + supprimees + ' devenue(s) sans objet' : '') +
      (manquantes.length ? ', ' + manquantes.length + ' à écrire' : '') +
      (conflits ? ', ' + conflits + ' conflit(s) d\'indice' : '') +
      (ECRIRE ? (conflits ? ' — fichier laissé tel quel' : ' → ' + path.relative(RACINE, fichier)) : ' (contrôle seul)'));

    manquantes.forEach((m) => aTraduire.push({ page, langue, numero: m.numero, cle: m.cle }));
    totalNouvelles += manquantes.length;
  });
});

if (aTraduire.length) {
  console.log('\nChaînes sans traduction (' + aTraduire.length + ') — à écrire dans le fichier indiqué,\n' +
    'à la clé « numéro » du fichier JSON :\n');
  aTraduire.slice(0, 40).forEach((m) => {
    console.log('  ' + m.page.replace(/\.html$/, '') + '.' + m.langue + '.json  n°' + m.numero +
      '  « ' + m.cle.slice(0, 78) + (m.cle.length > 78 ? '…' : '') + ' »');
  });
  if (aTraduire.length > 40) console.log('  … et ' + (aTraduire.length - 40) + ' autre(s).');
  console.log('\nAprès écriture :  node outils/generer-i18n.js');
} else if (totalConflits === 0) {
  console.log('\n✅ Toutes les traductions ont retrouvé leur place.');
}

console.log('\n' + totalConservees + ' traduction(s) replacée(s) · ' + totalNouvelles + ' à écrire · ' +
  totalSupprimees + ' sans objet (texte retiré du HTML)');
if (!ECRIRE && totalNouvelles === 0 && totalSupprimees === 0) {
  console.log('Rien à réindexer : les deux listes de clés sont identiques.');
}
process.exit(0);
