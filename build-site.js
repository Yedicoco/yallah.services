#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Génération du site statique prêt à publier

   Produit le dossier « site-a-mettre-en-ligne/ » : la version sans
   serveur du site, à déposer telle quelle chez n'importe quel
   hébergeur (OVH, Hostinger, Netlify, GitHub Pages, PlanetHoster…).

   Dans cette version, la fiche candidat n'est pas enregistrée en base :
   elle reçoit un numéro de dossier local, puis part sur WhatsApp et
   par e-mail (comme le demande le parcours candidat).

   Utilisation :
       node build-site.js
       WHATSAPP_CANDIDATS=212710359446 CONTACT_EMAIL=servicesyallah@gmail.com node build-site.js
       node build-site.js --sortie site-a-mettre-en-ligne

   Copie toutes les pages publiques (accueil, candidature, confirmation et
   pages « service × ville »), puis régénère sitemap.xml à partir du domaine
   défini dans site.config.json.

   Variables d'environnement :
       WHATSAPP_FOYERS      (défaut 212691733585)
       WHATSAPP_CANDIDATS   (défaut 212710359446, repli : WHATSAPP_NUMBER)
       CONTACT_EMAIL        (défaut servicesyallah@gmail.com)
       SITE_URL             (défaut : url de site.config.json)
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = __dirname;

function argument(nom, defaut) {
  const index = process.argv.indexOf(nom);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : defaut;
}

const SORTIE = path.resolve(RACINE, argument('--sortie', 'site-a-mettre-en-ligne'));
const WHATSAPP_FOYERS = process.env.WHATSAPP_FOYERS || '212691733585';
const WHATSAPP_CANDIDATS = process.env.WHATSAPP_CANDIDATS || process.env.WHATSAPP_NUMBER || '212710359446';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'servicesyallah@gmail.com';

/* Fichiers/pages copiés dans la version statique.
   Toutes les pages publiques sont copiées automatiquement, y compris les
   pages « service × ville » : ajouter un fichier suffit, rien à modifier ici.
   Le sitemap.xml n'est plus recopié, il est régénéré depuis le site publié. */
const PAGES_IGNOREES = new Set(['admin.html', 'plan-placement-du-formulaire.html']);
/* Le fichier de vérification Search Console (google….html) est copié aussi :
   il doit rester accessible sur le domaine publié. Il est seulement exclu du sitemap. */
const PAGES = fs.readdirSync(RACINE)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !PAGES_IGNOREES.has(f))
  .sort();
const DOSSIERS = ['assets'];
const FICHIERS = ['robots.txt', 'netlify.toml'];
const EXCLUS = new Set(['admin.html', 'admin.js']);

/* Adresse publique : variable d'environnement > site.config.json */
const CONFIG = JSON.parse(fs.readFileSync(path.join(RACINE, 'site.config.json'), 'utf8'));
const SITE_URL = (process.env.SITE_URL || CONFIG.url || '').replace(/\/+$/, '');

/* Numéros par défaut présents dans le HTML, remplacés si l'on change de numéro */
const NUMERO_FOYERS_DEFAUT = '212691733585';
const NUMERO_CANDIDATS_DEFAUT = '212710359446';

function copier(cheminRelatif) {
  const source = path.join(RACINE, cheminRelatif);
  const cible = path.join(SORTIE, cheminRelatif);
  const statistiquesSource = fs.statSync(source);

  if (statistiquesSource.isDirectory()) {
    fs.mkdirSync(cible, { recursive: true });
    fs.readdirSync(source).forEach((entree) => {
      if (EXCLUS.has(entree)) return;
      copier(path.join(cheminRelatif, entree));
    });
    return;
  }

  fs.mkdirSync(path.dirname(cible), { recursive: true });
  fs.copyFileSync(source, cible);
}

function afficherNumero(wa) {
  const n = String(wa).replace(/\D/g, '');
  if (n.length === 12 && n.startsWith('212')) {
    return '+' + n.slice(0, 3) + ' ' + n.slice(3, 4) + n.slice(4, 6) + ' ' + n.slice(6, 9) + ' ' + n.slice(9);
  }
  return '+' + n;
}

function ecrireConfigStatique() {
  const contenu = '/* Généré par build-site.js — version statique (sans serveur).\n' +
    '   Modifiez les numéros ici puis relancez la génération, ou modifiez\n' +
    '   directement ce fichier sur l\'hébergeur. */\n' +
    'window.YS_CONFIG = ' + JSON.stringify({
      whatsappFoyers: WHATSAPP_FOYERS,
      whatsappFoyersAffiche: afficherNumero(WHATSAPP_FOYERS),
      whatsappCandidats: WHATSAPP_CANDIDATS,
      whatsappCandidatsAffiche: afficherNumero(WHATSAPP_CANDIDATS),
      email: CONTACT_EMAIL,
      agence: 'Yallah Services',
      ville: 'Casablanca',
      mode: 'statique'
    }, null, 2) + ';\n';
  fs.writeFileSync(path.join(SORTIE, 'assets/js/config.js'), contenu, 'utf8');
}

/* Remplace les numéros/e-mail dans le HTML si l'on change les variables d'environnement */
function adapterHtml() {
  const remplacements = [];
  if (WHATSAPP_FOYERS !== NUMERO_FOYERS_DEFAUT) {
    remplacements.push([new RegExp(NUMERO_FOYERS_DEFAUT, 'g'), WHATSAPP_FOYERS]);
    remplacements.push([/\+212 691 733 585/g, afficherNumero(WHATSAPP_FOYERS)]);
  }
  if (WHATSAPP_CANDIDATS !== NUMERO_CANDIDATS_DEFAUT) {
    remplacements.push([new RegExp(NUMERO_CANDIDATS_DEFAUT, 'g'), WHATSAPP_CANDIDATS]);
    remplacements.push([/\+212 710 359 446/g, afficherNumero(WHATSAPP_CANDIDATS)]);
  }
  if (CONTACT_EMAIL !== 'servicesyallah@gmail.com') {
    remplacements.push([/servicesyallah@gmail\.com/g, CONTACT_EMAIL]);
  }
  if (remplacements.length === 0) return 0;

  /* Fichiers à adapter : les pages, puis les dictionnaires de traduction
     (les numéros y figurent aussi, en français comme en darija). */
  const fichiers = PAGES.slice();
  const dossierTrad = path.join(SORTIE, 'assets', 'i18n');
  if (fs.existsSync(dossierTrad)) {
    fs.readdirSync(dossierTrad).forEach((langue) => {
      const dossier = path.join(dossierTrad, langue);
      if (!fs.statSync(dossier).isDirectory()) return;
      fs.readdirSync(dossier).forEach((fichier) => fichiers.push(path.join('assets', 'i18n', langue, fichier)));
    });
  }

  let total = 0;
  fichiers.forEach((fichier) => {
    const chemin = path.join(SORTIE, fichier);
    if (!fs.existsSync(chemin)) return;
    let contenu = fs.readFileSync(chemin, 'utf8');
    remplacements.forEach(([motif, valeur]) => {
      const avant = contenu;
      contenu = contenu.replace(motif, valeur);
      if (avant !== contenu) total += 1;
    });
    fs.writeFileSync(chemin, contenu, 'utf8');
  });
  return total;
}

function ecrireLisezMoi() {
  const lignes = [
    'YALLAH SERVICES — SITE PRÊT À METTRE EN LIGNE',
    '=============================================',
    '',
    'Cette version fonctionne SANS serveur : déposez tout le contenu de ce',
    'dossier à la racine de votre hébergement (ou par FTP), et le site est en ligne.',
    '',
    'Pages :',
    '  index.html                        → accueil foyers',
    '  candidature.html                  → fiche de candidature (FR / AR)',
    '  candidature-confirmation.html     → numéro de dossier + WhatsApp + e-mail',
    '  <service>-<ville>.html            → pages locales (ménage, nounou… par ville)',
    '  sitemap.xml                       → régénéré automatiquement à chaque build',
    '',
    'Coordonnées configurées :',
    '  WhatsApp foyers    : ' + afficherNumero(WHATSAPP_FOYERS),
    '  WhatsApp candidats : ' + afficherNumero(WHATSAPP_CANDIDATS),
    '  E-mail références  : ' + CONTACT_EMAIL,
    '',
    'Dans cette version, le numéro de dossier est généré par le navigateur du',
    'candidat (YS-AAAA-0001, 0002…) puis la fiche est transmise sur WhatsApp.',
    'Aucune donnée n\'est stockée sur le serveur : rien à sauvegarder, rien à',
    'protéger côté hébergement. Pour disposer d\'une base de dossiers et de',
    'l\'espace recruteur, utilisez la version serveur (node server.js).',
    '',
    'Pour changer un numéro : modifiez assets/js/config.js (ou régénérez avec',
    'WHATSAPP_CANDIDATS=… CONTACT_EMAIL=… node build-site.js).',
    '',
    'Rappel loi 09-08 : sans deux références, la candidature n\'est ni validée',
    'ni présentée à un foyer. Les données des candidats reçues par e-mail ou',
    'WhatsApp doivent être conservées 12 mois maximum.',
    ''
  ];
  fs.writeFileSync(path.join(SORTIE, 'LISEZ-MOI.txt'), lignes.join('\n'), 'utf8');
}

/* ─────────── GÉNÉRATION ─────────── */

if (SORTIE === RACINE || SORTIE.indexOf(RACINE + path.sep) !== 0) {
  console.error('Dossier de sortie invalide : ' + SORTIE);
  process.exit(1);
}

console.log('Génération du site statique dans ' + path.relative(RACINE, SORTIE) + '/ …');
fs.rmSync(SORTIE, { recursive: true, force: true });
fs.mkdirSync(SORTIE, { recursive: true });

PAGES.forEach(copier);
DOSSIERS.forEach(copier);
FICHIERS.forEach((fichier) => {
  if (fs.existsSync(path.join(RACINE, fichier))) copier(fichier);
});

ecrireConfigStatique();
const remplacements = adapterHtml();
ecrireLisezMoi();

/* Sitemap régénéré depuis les pages réellement publiées (lastmod = git) */
const sitemap = require('./outils/generer-sitemap');
const entrees = sitemap.ecrire(SITE_URL, SORTIE);
console.log('  Sitemap                : ' + entrees.length + ' page(s) → sitemap.xml');

/* Vérifications rapides */
const attendus = ['index.html', 'candidature.html', 'candidature-confirmation.html',
  'sitemap.xml', 'assets/js/config.js', 'assets/js/fiche.js', 'assets/js/candidature.js',
  'assets/js/candidature-confirmation.js', 'assets/css/recrutement.css'];
const manquants = attendus.filter((f) => !fs.existsSync(path.join(SORTIE, f)));

let poids = 0;
let nombre = 0;
(function mesurer(dossier) {
  fs.readdirSync(dossier).forEach((entree) => {
    const chemin = path.join(dossier, entree);
    const statistiques = fs.statSync(chemin);
    if (statistiques.isDirectory()) mesurer(chemin);
    else { poids += statistiques.size; nombre += 1; }
  });
})(SORTIE);

console.log('  Fichiers copiés        : ' + nombre + ' (' + (poids / 1048576).toFixed(1) + ' Mo)');
console.log('  WhatsApp foyers        : ' + afficherNumero(WHATSAPP_FOYERS));
console.log('  WhatsApp candidats     : ' + afficherNumero(WHATSAPP_CANDIDATS));
console.log('  E-mail références      : ' + CONTACT_EMAIL);
if (remplacements) console.log('  Remplacements HTML     : ' + remplacements);
if (manquants.length) {
  console.error('  ⚠️  Fichiers manquants : ' + manquants.join(', '));
  process.exit(1);
}
console.log('  ✅ Site statique prêt : ouvrez ' + path.relative(RACINE, SORTIE) + '/index.html');
