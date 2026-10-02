#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Test de l'affichage multilingue en vrai DOM

   Ouvre chaque page dans un DOM headless (jsdom) avec chacune des
   quatre langues et vérifie :

     1. le chargement se fait sans erreur JavaScript ;
     2. <html lang> et <html dir> correspondent à la langue choisie ;
     3. titre, meta description et textes sont bien remplacés ;
     4. aucune chaîne du dictionnaire n'est restée dans la langue source ;
     5. le sélecteur compte quatre boutons et marque la langue active ;
     6. le retour au français restitue la page (aucun résidu) ;
     7. un visiteur arrivant en français peut cliquer vers chaque langue,
        charger son dictionnaire et revenir au français.

   Prérequis (outil de développement, absent du site publié) :
       npm i jsdom
       node outils/tester-i18n.js
       node outils/tester-i18n.js --page index.html
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');

let jsdom;
try {
  jsdom = require('jsdom');
} catch (e) {
  console.log('ℹ️  jsdom n\'est pas installé — test du DOM ignoré.');
  console.log('   Pour l\'activer :  npm i jsdom  puis  node outils/tester-i18n.js');
  process.exit(0);
}
const { JSDOM } = jsdom;

/* Les scripts locaux doivent se charger ; les polices et autres ressources
   distantes sont neutralisées pour que le test fonctionne hors réseau. */
let OPTIONS_RESEAU = 'usable';
if (typeof jsdom.requestInterceptor === 'function') {
  OPTIONS_RESEAU = {
    interceptors: [jsdom.requestInterceptor((requete) => {
      if (!/^file:/.test(requete.url)) {
        return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
      }
      return undefined;
    })]
  };
} else if (typeof jsdom.ResourceLoader === 'function') {
  class ChargeurLocal extends jsdom.ResourceLoader {
    fetch(url, options) {
      if (!/^file:/.test(url)) return Promise.resolve(Buffer.alloc(0));
      return super.fetch(url, options);
    }
  }
  OPTIONS_RESEAU = new ChargeurLocal();
}

const PAGES = ['index.html', 'services-par-ville.html', 'personnel-entreprises.html',
  'candidature.html', 'candidature-confirmation.html'];
const LANGUES = ['fr', 'dar', 'dar-latn', 'en'];
const ATTENDU = {
  fr: ['fr-MA', 'ltr', 'fr'],
  dar: ['ar-MA', 'rtl', 'ar'],
  'dar-latn': ['ar-Latn-MA', 'ltr', 'ar'],
  en: ['en', 'ltr', 'fr']
};

let erreurs = 0;
let verifies = 0;
function erreur(message) { erreurs += 1; console.log('   ❌ ' + message); }
function ok(message) { console.log('   ✅ ' + message); }

function dictionnaire(page, langue) {
  const fichier = path.join(RACINE, 'assets', 'i18n', langue, page.replace(/\.html$/, '.js'));
  if (!fs.existsSync(fichier)) return null;
  const contenu = {};
  try {
    new Function('YS_TRAD', fs.readFileSync(fichier, 'utf8'))((code, nomPage, cles) => Object.assign(contenu, cles));
  } catch (e) {
    return { erreur: e.message };
  }
  return contenu;
}

function ouvrir(page, langue) {
  const chemin = path.join(RACINE, page);
  const erreursJs = [];
  return new Promise((resoudre) => {
    const dom = new JSDOM(fs.readFileSync(chemin, 'utf8'), {
      url: 'file://' + chemin + '?langue=' + langue,
      runScripts: 'dangerously',
      resources: OPTIONS_RESEAU,
      pretendToBeVisual: true,
      beforeParse(fenetre) {
        fenetre.addEventListener('error', (e) => erreursJs.push(e.message || String(e.error)));
        fenetre.addEventListener('unhandledrejection', (e) => erreursJs.push('promesse rejetée : ' + e.reason));
      }
    });
    let resolue = false;
    let garde;
    function terminer() {
      if (resolue) return;
      resolue = true;
      clearTimeout(garde);
      resoudre({ dom, erreursJs });
    }
    dom.window.addEventListener('load', () => setTimeout(terminer, 150), { once: true });
    garde = setTimeout(terminer, 8000);
  });
}

function texteNormalise(el) { return String(el.textContent || '').replace(/\s+/g, ' ').trim(); }

/* Texte visible d'une traduction, balises retirées. */
function texteDeTraduction(valeur) {
  return String(valeur).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/* Texte réellement affiché : les pages candidat portent les deux versions
   (française et arabe) dans le même document ; seule la base active est
   visible (règle CSS html[data-ys-base]). */
function texteAffiche(doc) {
  const base = doc.documentElement.getAttribute('data-ys-base') || 'fr';
  const morceaux = [];
  (function parcourir(noeud) {
    if (noeud.nodeType === 3) { morceaux.push(noeud.nodeValue); return; }
    if (noeud.nodeType !== 1) return;
    const nom = String(noeud.tagName || '').toUpperCase();
    if (nom === 'SCRIPT' || nom === 'STYLE' || nom === 'NOSCRIPT') return;
    if (noeud.hasAttribute('data-ys-notrad')) return;
    const langue = noeud.getAttribute && noeud.getAttribute('data-lang');
    if (langue && langue !== base) return;
    const enfants = noeud.childNodes;
    for (let i = 0; i < enfants.length; i += 1) parcourir(enfants[i]);
  })(doc.body);
  return morceaux.join(' ').replace(/\s+/g, ' ').trim();
}

function attendreCondition(condition, delaiMax) {
  const delai = delaiMax || 5000;
  const echeance = Date.now() + delai;
  return new Promise((resoudre, rejeter) => {
    function verifier() {
      if (condition()) { resoudre(); return; }
      if (Date.now() >= echeance) { rejeter(new Error('délai dépassé (' + delai + ' ms)')); return; }
      setTimeout(verifier, 25);
    }
    verifier();
  });
}

/* Contrôle réutilisé pour le chargement direct et pour le vrai clic. */
function verifierTraductionAppliquee(page, langue, doc, dico, contexte) {
  const prefixe = (contexte ? page + ' · ' + contexte : page) + ' — ';
  const infos = ATTENDU[langue];

  if (dico['@title'] && doc.title !== dico['@title']) {
    erreur(prefixe + 'titre non traduit : « ' + doc.title + ' »');
  }
  if (dico['@meta:description']) {
    const meta = doc.querySelector('meta[name="description"]');
    if (meta && meta.getAttribute('content') !== dico['@meta:description']) erreur(prefixe + 'meta description non traduite');
    else if (meta) ok(prefixe + 'titre et meta description traduits');
  }

  /* Aucune chaîne connue du dictionnaire ne doit rester affichée. */
  const restes = [];
  const elements = doc.body.querySelectorAll('*');
  for (let i = 0; i < elements.length; i += 1) {
    const el = elements[i];
    if (el.children.length > 4) continue;
    if (el.closest('[data-ys-notrad]')) continue;
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
    const texte = texteNormalise(el);
    if (!texte || texte.length > 200) continue;
    if (el.closest('[data-lang]:not([data-lang="' + infos[2] + '"])')) continue;
    /* Une traduction identique à la source (FAQ, WhatsApp, e-mail, noms de
       villes…) n'est pas un oubli : on ne signale que les vraies absences. */
    if (Object.prototype.hasOwnProperty.call(dico, texte) && texteDeTraduction(dico[texte]) !== texte) {
      restes.push(el.tagName + ' : « ' + texte + ' »');
    }
  }
  if (restes.length) {
    restes.slice(0, 5).forEach((r) => erreur(prefixe + 'texte non traduit — ' + r));
    if (restes.length > 5) erreur(prefixe + '… et ' + (restes.length - 5) + ' autre(s) texte(s) non traduit(s)');
  } else {
    ok(prefixe + 'les ' + Object.keys(dico).length + ' clés du dictionnaire sont appliquées');
  }
}

async function tester(page, langue) {
  const { dom, erreursJs } = await ouvrir(page, langue);
  const doc = dom.window.document;
  const racine = doc.documentElement;
  const infos = ATTENDU[langue];
  console.log('\n' + page + ' · ' + langue);
  verifies += 1;

  const serieux = erreursJs.filter((e) => !/Could not load|Not implemented|stylesheet|css\b/i.test(e));
  if (serieux.length) serieux.slice(0, 3).forEach((e) => erreur('JavaScript : ' + e));
  else ok('chargement sans erreur JavaScript');

  if (racine.getAttribute('lang') !== infos[0]) erreur('lang = ' + racine.getAttribute('lang') + ' (attendu ' + infos[0] + ')');
  if (racine.getAttribute('dir') !== infos[1]) erreur('dir = ' + racine.getAttribute('dir') + ' (attendu ' + infos[1] + ')');
  if (racine.getAttribute('data-ys-base') !== infos[2]) erreur('base = ' + racine.getAttribute('data-ys-base') + ' (attendu ' + infos[2] + ')');

  const groupes = doc.querySelectorAll('.ys-i18n');
  const boutons = doc.querySelectorAll('.ys-i18n button');
  if (!groupes.length) erreur('aucun sélecteur de langue');
  else if (boutons.length !== groupes.length * 4) {
    erreur(boutons.length + ' bouton(s) de langue pour ' + groupes.length + ' sélecteur(s) (4 attendus par sélecteur)');
  } else {
    const actifs = doc.querySelectorAll('.ys-i18n button.on');
    const bons = Array.prototype.filter.call(actifs, (b) => b.getAttribute('data-langue') === langue);
    if (bons.length !== groupes.length) erreur('langue active mal marquée');
    else ok('sélecteur à 4 langues, langue active marquée (' + groupes.length + ' emplacement(s))');
  }

  const dico = dictionnaire(page, langue);
  if (!dico) {
    console.log('   ⬜ pas encore de dictionnaire pour cette page (affichage de base conservé)');
    dom.window.close();
    return;
  }
  if (dico.erreur) { erreur('dictionnaire illisible : ' + dico.erreur); dom.window.close(); return; }
  if (langue === 'fr') { dom.window.close(); return; }

  verifierTraductionAppliquee(page, langue, doc, dico, 'chargement direct');

  /* Retour au français : la page doit retrouver ses textes d'origine. */
  const avant = texteAffiche(doc);
  dom.window.YSI18N.definir('fr');
  const apres = texteAffiche(doc);
  if (racine.getAttribute('lang') !== 'fr-MA' && racine.getAttribute('lang') !== 'fr') {
    erreur('retour au français : lang = ' + racine.getAttribute('lang'));
  }
  /* Après retour au français, aucune traduction ne doit subsister. */
  const sourcePage = fs.readFileSync(path.join(RACINE, page), 'utf8');
  const residus = Object.keys(dico).filter((cle) => {
    if (cle.charAt(0) === '@' || cle.length < 8) return false;
    const traduit = dico[cle];
    if (!traduit || traduit === cle) return false;
    if (sourcePage.indexOf(traduit) !== -1) return false;   /* mot déjà présent en français */
    return apres.indexOf(traduit) !== -1;
  });
  if (residus.length) erreur(residus.length + ' résidu(s) de traduction après retour au français (ex. « ' + dico[residus[0]].slice(0, 40) + ' »)');
  else if (apres === avant) erreur('le retour au français n\'a rien changé');
  else ok('retour au français complet (' + Math.abs(avant.length - apres.length) + ' caractères restitués)');

  dom.window.close();
}

/* Reproduit le parcours de production : arrivée en français, puis sélection
   successive des trois langues non françaises depuis les boutons réels. */
async function testerBasculeParClic(page) {
  const { dom, erreursJs } = await ouvrir(page, 'fr');
  const doc = dom.window.document;
  const racine = doc.documentElement;
  const moteur = dom.window.YSI18N;
  const nomPage = page.replace(/\.html$/, '');
  console.log('\n' + page + ' · parcours réel par clic (départ fr)');

  if (!moteur) {
    erreur('moteur YSI18N absent dans le parcours par clic');
    dom.window.close();
    return;
  }
  if (moteur.langue() !== 'fr') erreur('le parcours par clic ne démarre pas en français');
  const texteFrancais = texteAffiche(doc);

  for (const langue of LANGUES) {
    if (langue === 'fr') continue;
    verifies += 1;
    console.log('   ↪ clic vers ' + langue);

    const bouton = doc.querySelector('.ys-i18n button[data-langue="' + langue + '"]');
    if (!bouton) {
      erreur('bouton de langue absent pour le clic vers ' + langue);
      continue;
    }
    bouton.click();

    try {
      await attendreCondition(() => {
        const dicoActif = moteur.dictionnaire(langue, nomPage);
        const meta = doc.querySelector('meta[name="description"]');
        return moteur.langue() === langue && Object.keys(dicoActif).length > 0 &&
          (!dicoActif['@meta:description'] ||
            (meta && meta.getAttribute('content') === dicoActif['@meta:description']));
      }, 5000);
    } catch (e) {
      erreur('clic vers ' + langue + ' : dictionnaire non chargé (' + e.message + ')');
      continue;
    }

    const infos = ATTENDU[langue];
    if (racine.getAttribute('lang') !== infos[0]) erreur('clic ' + langue + ' : lang = ' + racine.getAttribute('lang') + ' (attendu ' + infos[0] + ')');
    if (racine.getAttribute('dir') !== infos[1]) erreur('clic ' + langue + ' : dir = ' + racine.getAttribute('dir') + ' (attendu ' + infos[1] + ')');
    if (racine.getAttribute('data-ys-base') !== infos[2]) erreur('clic ' + langue + ' : base = ' + racine.getAttribute('data-ys-base') + ' (attendu ' + infos[2] + ')');

    const groupes = doc.querySelectorAll('.ys-i18n');
    const actifs = doc.querySelectorAll('.ys-i18n button.on');
    const bons = Array.prototype.filter.call(actifs, (b) => b.getAttribute('data-langue') === langue);
    if (!groupes.length || bons.length !== groupes.length) erreur('clic ' + langue + ' : bouton actif mal marqué');
    else ok('clic ' + langue + ' : bouton actif et dictionnaire chargé');

    verifierTraductionAppliquee(page, langue, doc, moteur.dictionnaire(langue, nomPage), 'clic ' + langue);
  }

  const boutonFr = doc.querySelector('.ys-i18n button[data-langue="fr"]');
  if (boutonFr) {
    boutonFr.click();
    if (moteur.langue() !== 'fr') erreur('le clic de retour ne rétablit pas le français');
    if (racine.getAttribute('lang') !== 'fr-MA' && racine.getAttribute('lang') !== 'fr') {
      erreur('retour par clic : lang = ' + racine.getAttribute('lang'));
    }
    const texteRestitue = texteAffiche(doc);
    if (texteRestitue !== texteFrancais) erreur('retour par clic : les textes français ne sont pas entièrement restitués');
    else ok('retour par clic au français complet');
  } else {
    erreur('bouton français absent pour le retour par clic');
  }

  const serieux = erreursJs.filter((e) => !/Could not load|Not implemented|stylesheet|css\b/i.test(e));
  if (serieux.length) serieux.slice(0, 3).forEach((e) => erreur('JavaScript pendant les clics : ' + e));
  dom.window.close();
}

(async () => {
  const position = process.argv.indexOf('--page');
  const pages = position !== -1 && process.argv[position + 1] ? [process.argv[position + 1]] : PAGES;
  for (const page of pages) {
    for (const langue of LANGUES) await tester(page, langue);
    await testerBasculeParClic(page);
  }
  console.log('\n' + (erreurs === 0
    ? '✅ Test multilingue : ' + verifies + ' vérifications page × langue et par clic sans problème.'
    : '❌ ' + erreurs + ' problème(s) sur ' + verifies + ' vérifications.'));
  process.exit(erreurs === 0 ? 0 : 1);
})();
