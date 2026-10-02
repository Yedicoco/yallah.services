#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Captures d'écran du site (ordinateur + mobile)

   Produit les images de revue dans ce dossier :
       accueil-ordinateur.png          1200 × 900
       accueil-mobile.png               390 × 844
       candidature-ordinateur.png      1200 × 900
       candidature-mobile.png           390 × 844
       candidature-arabe-ordinateur.png 1200 × 900
       confirmation-ordinateur.png     1200 × 900
       admin-ordinateur.png            1200 × 900

   Prérequis : un Chromium fourni par Playwright.

       npm i -D playwright && npx playwright install chromium
       node apercus/generer-apercus.js

   Le script démarre lui-même le serveur (node server.js) s'il n'y en a
   pas déjà un, puis s'arrête. Il vérifie aussi qu'aucune page ne
   déborde horizontalement (défilement latéral).

   Options :
       --url http://localhost:3000     site déjà en ligne à photographier
       --dossier apercus               dossier de sortie
       --cle MONTEST                   clé ADMIN_KEY pour la capture /admin
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const RACINE = path.resolve(__dirname, '..');

function argument(nom, defaut) {
  const position = process.argv.indexOf(nom);
  return position !== -1 && process.argv[position + 1] ? process.argv[position + 1] : defaut;
}

const URL_BASE = argument('--url', '');
const SORTIE = path.resolve(RACINE, argument('--dossier', 'apercus'));
const CLE = argument('--cle', process.env.ADMIN_KEY || 'yallah2026');
const PORT = 3199;

let chromium;
try {
  chromium = require('playwright').chromium;
} catch (erreur) {
  console.error("Playwright n'est pas installé.");
  console.error('  npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

/* ── Pages à photographier ──
   fiche : paramètres de la page de confirmation (sinon elle affiche
   « fiche introuvable » puisque rien n'a été envoyé). */
const CANDIDATURE = {
  nomComplet: 'Aminata Diallo', telephone: '0612345678', ville: 'Casablanca', quartier: 'Sidi Bernoussi',
  age: '32', origine: "Côte d'Ivoire", poste: 'Nounou', experience: '3 à 5 ans', salaire: '3500',
  logement: 'Logée', travail: ['Temps plein'], disponible: '2026-11-01', jours: '6 jours',
  langues: ['Français', 'Darija marocaine'], competences: ["Garde d'enfants"], documents: ['CIN ou passeport'],
  ref1Nom: 'Mme Bennani', ref1Lien: 'Ancien employeur', ref1Tel: '0661223344',
  ref2Nom: 'M. Alaoui', ref2Lien: "Responsable d'entreprise", ref2Tel: '0655443322',
  message: 'Disponible rapidement.', consentement: 'oui'
};

async function demarrerServeur() {
  if (URL_BASE) return { url: URL_BASE, arreter: () => {} };
  return new Promise((resoudre, rejeter) => {
    const processus = spawn('node', ['server.js'], {
      cwd: RACINE,
      env: Object.assign({}, process.env, { PORT: String(PORT), ADMIN_KEY: CLE })
    });
    let minuteur = setTimeout(() => rejeter(new Error('Le serveur ne répond pas.')), 15000);
    processus.stdout.on('data', (donnees) => {
      if (String(donnees).indexOf('serveur de recrutement') !== -1) {
        clearTimeout(minuteur);
        setTimeout(() => resoudre({
          url: 'http://localhost:' + PORT,
          arreter: () => { try { processus.kill('SIGTERM'); } catch (e) { /* ignore */ } }
        }), 300);
      }
    });
    processus.stderr.on('data', (donnees) => process.stderr.write(donnees));
    processus.on('exit', (code) => { if (code !== null && code !== 0) rejeter(new Error('Serveur arrêté (' + code + ').')); });
  });
}

async function principal() {
  const { url, arreter } = await demarrerServeur();
  const navigateur = await chromium.launch({ args: ['--no-sandbox'] });
  const contexte = await navigateur.newContext();
  const debordements = [];

  async function capture(nom, adresse, taille, avant) {
    const page = await contexte.newPage({ viewport: taille, deviceScaleFactor: 1 });
    await page.goto(url + adresse, { waitUntil: 'networkidle' });
    if (avant) await avant(page);
    await page.waitForTimeout(400);

    const mesure = await page.evaluate(() => ({
      deborde: document.documentElement.scrollWidth > window.innerWidth + 1,
      largeur: document.documentElement.scrollWidth,
      fenetre: window.innerWidth
    }));
    if (mesure.deborde) debordements.push(nom + ' : ' + mesure.largeur + ' px pour une fenêtre de ' + mesure.fenetre + ' px');

    await page.screenshot({ path: path.join(SORTIE, nom + '.png'), fullPage: false });
    console.log('  📸 ' + nom + '.png');
    await page.close();
  }

  await capture('accueil-ordinateur', '/', { width: 1200, height: 900 });
  await capture('accueil-mobile', '/', { width: 390, height: 844 });
  await capture('candidature-ordinateur', '/candidature.html', { width: 1200, height: 900 });
  await capture('candidature-mobile', '/candidature.html', { width: 390, height: 844 });
  await capture('candidature-arabe-ordinateur', '/candidature.html', { width: 1200, height: 900 }, async (page) => {
    await page.click('#btnAr');
    await page.waitForTimeout(300);
  });
  await capture('confirmation-ordinateur', '/candidature-confirmation.html', { width: 1200, height: 900 }, async (page) => {
    await page.evaluate((fiche) => {
      const numero = 'YS-' + new Date().getFullYear() + '-0001';
      const enregistrement = JSON.stringify({ fiche: fiche, numero: numero, mode: 'statique', quand: Date.now() });
      window.localStorage.setItem('ys_derniere_candidature', enregistrement);
      window.sessionStorage.setItem('ys_derniere_candidature', enregistrement);
    }, CANDIDATURE);
    await page.reload({ waitUntil: 'networkidle' });
  });
  await capture('admin-ordinateur', '/admin', { width: 1200, height: 900 }, async (page) => {
    await page.evaluate((cle) => { window.sessionStorage.setItem('ys_admin_cle', cle); }, CLE);
    await page.reload({ waitUntil: 'networkidle' });
  });

  await navigateur.close();
  arreter();

  console.log('');
  if (debordements.length) {
    console.error('⚠️  Débordement horizontal détecté :');
    debordements.forEach((ligne) => console.error('   - ' + ligne));
    process.exitCode = 1;
  } else {
    console.log('✅ Aucun débordement horizontal sur les ' + (fs.readdirSync(SORTIE).filter((f) => f.endsWith('.png')).length) + ' captures.');
  }
}

principal().catch((erreur) => {
  console.error('Échec des captures : ' + erreur.message);
  process.exit(1);
});
