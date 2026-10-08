#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Vérification des sitemaps EN LIGNE

       node outils/verifier-sitemaps.js
       node outils/verifier-sitemaps.js --url https://yallah.services
       node outils/verifier-sitemaps.js --url http://127.0.0.1:8000   # test local

   Contrôle exactement ce que Google doit pouvoir lire sur le domaine
   publié, depuis une machine extérieure au site :

     1. /robots.txt répond 200 et déclare les deux sitemaps sous ce domaine.
     2. /sitemap.xml et /video-sitemap.xml répondent 200, en XML,
        SANS redirection (Google ne suit pas les redirections de sitemap)
        et en « no-cache » (sinon le CDN peut servir une version périmée).
     3. Toutes les <loc> du sitemap appartiennent au domaine testé
        (c'est ce qui casse après un changement d'adresse : l'ancien
        domaine reste dans le fichier et Google refuse le sitemap).
     4. Chaque page listée, chaque vidéo MP4 et chaque vignette du
        video-sitemap.xml répond 200.

   Sortie : rapport ✅ / ❌ et code de sortie 1 au moindre problème.
   Lancé automatiquement après chaque déploiement par
   .github/workflows/firebase-hosting-merge.yml.

   Options :
       --url <adresse>      domaine à tester (défaut : site.config.json / SITE_URL)
       --tentatives <n>     nombre d'essais après échec (défaut 3, 5 s d'écart)
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(RACINE, 'site.config.json'), 'utf8'));

function argument(nom, defaut) {
  const index = process.argv.indexOf(nom);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : defaut;
}

const BASE = String(argument('--url', process.env.SITE_URL || CONFIG.url || '')).replace(/\/+$/, '');
const TENTATIVES = Math.max(1, Number(argument('--tentatives', '3')) || 1);
const ATTENTE_MS = 5000;

function sansEntites(xml) {
  return String(xml)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function balises(xml, nom) {
  const motif = new RegExp('<' + nom + '>([^<]+)</' + nom + '>', 'g');
  const valeurs = [];
  let resultat;
  while ((resultat = motif.exec(xml)) !== null) valeurs.push(sansEntites(resultat[1]).trim());
  return valeurs;
}

async function verifier(signal) {
  const lignes = [];
  const problemes = [];
  const ok = (message) => lignes.push('  ✅ ' + message);
  const erreur = (message) => { lignes.push('  ❌ ' + message); problemes.push(message); };
  const section = (titre) => lignes.push('\n' + titre);

  async function lire(adresse, options) {
    const reponse = await fetch(adresse, { redirect: 'manual', signal, ...options });
    return reponse;
  }

  /* ── 1. robots.txt ── */
  section('robots.txt');
  const robots = await lire(BASE + '/robots.txt');
  if (robots.status !== 200) {
    erreur('robots.txt répond ' + robots.status + ' (attendu : 200)');
  } else {
    const contenu = await robots.text();
    const attendus = ['sitemap.xml', 'video-sitemap.xml'];
    attendus.forEach((fichier) => {
      const adresse = BASE + '/' + fichier;
      if (contenu.includes('Sitemap: ' + adresse)) ok('Sitemap déclaré : ' + adresse);
      else erreur('robots.txt ne déclare pas « Sitemap: ' + adresse + ' »');
    });
  }

  /* ── 2. Sitemaps principaux ── */
  const aVerifier = [];
  async function controlerSitemap(fichier, estVideo) {
    section(fichier);
    const adresse = BASE + '/' + fichier;
    const reponse = await lire(adresse);
    if (reponse.status >= 300 && reponse.status < 400) {
      erreur('redirection ' + reponse.status + ' vers ' + (reponse.headers.get('location') || '?') +
        ' — Google ne suit pas les redirections de sitemap');
      return;
    }
    if (reponse.status !== 200) {
      erreur(adresse + ' répond ' + reponse.status + ' (attendu : 200)');
      return;
    }
    const type = String(reponse.headers.get('content-type') || '');
    if (!/xml/i.test(type)) erreur('Content-Type « ' + type + ' » (attendu : un type XML)');
    else ok('200 · ' + type.split(';')[0] + ' · sans redirection');

    const cache = String(reponse.headers.get('cache-control') || '');
    if (!/no-cache|no-store|max-age=0/.test(cache)) {
      erreur('Cache-Control « ' + cache + ' » : le CDN peut resservir une version périmée ' +
        '(attendu « no-cache » pour les .xml dans firebase.json)');
    } else {
      ok('Cache-Control : ' + cache);
    }

    const xml = await reponse.text();
    if (!/^<\?xml/.test(xml.trim())) erreur('le fichier ne commence pas par <?xml — format inattendu');
    const pages = balises(xml, 'loc');
    if (pages.length === 0) erreur('aucune balise <loc> trouvée');
    const horsDomaine = pages.filter((page) => page.indexOf(BASE) !== 0);
    if (horsDomaine.length) {
      erreur(horsDomaine.length + ' URL n’appartiennent pas à ' + BASE + ' — Google refusera le sitemap : ' +
        horsDomaine.slice(0, 3).join(' · '));
    } else if (pages.length) {
      ok(pages.length + ' URL, toutes sous ' + BASE);
    }
    pages.forEach((page) => aVerifier.push({ adresse: page, quoi: 'page' }));

    if (estVideo) {
      const videos = balises(xml, 'video:content_loc');
      const vignettes = balises(xml, 'video:thumbnail_loc');
      const titres = balises(xml, 'video:title');
      const descriptions = balises(xml, 'video:description');
      if (!videos.length || !vignettes.length || !titres.length || !descriptions.length) {
        erreur('video-sitemap incomplet : ' + videos.length + ' vidéo(s), ' + vignettes.length +
          ' vignette(s), ' + titres.length + ' titre(s), ' + descriptions.length + ' description(s)');
      } else {
        ok(videos.length + ' vidéo(s), ' + vignettes.length + ' vignette(s), ' +
          titres.length + ' titre(s), ' + descriptions.length + ' description(s)');
      }
      videos.forEach((v) => aVerifier.push({ adresse: v, quoi: 'vidéo' }));
      vignettes.forEach((v) => aVerifier.push({ adresse: v, quoi: 'vignette' }));
    }
    return fichier;
  }

  await controlerSitemap('sitemap.xml', false);
  await controlerSitemap('video-sitemap.xml', true);

  /* ── 3. Chaque ressource répond 200 ── */
  section('Ressources listées (' + aVerifier.length + ')');
  const echecs = [];
  for (const element of aVerifier) {
    let statut;
    try {
      statut = (await lire(element.adresse, { method: 'HEAD' })).status;
      if (statut === 405 || statut === 501) {
        const reponse = await lire(element.adresse, { method: 'GET' });
        statut = reponse.status;
        if (reponse.body) await reponse.body.cancel();
      }
    } catch (erreur) {
      statut = 'erreur réseau — ' + erreur.message;
    }
    if (statut !== 200) echecs.push(statut + '  ' + element.adresse + ' (' + element.quoi + ')');
  }
  if (echecs.length) {
    erreur(echecs.length + ' ressource(s) ne répondent pas 200 :');
    echecs.slice(0, 10).forEach((ligne) => lignes.push('     · ' + ligne));
  } else if (aVerifier.length) {
    ok(aVerifier.length + '/' + aVerifier.length + ' ressource(s) répondent 200');
  }

  return { lignes, problemes };
}

async function principal() {
  if (typeof fetch !== 'function') {
    console.error('❌ Node 18 ou plus récent est nécessaire (fetch intégré).');
    process.exit(2);
  }
  if (!/^https?:\/\//.test(BASE)) {
    console.error('❌ Adresse invalide : « ' + BASE + ' » (exemple : --url https://yallah.services)');
    process.exit(2);
  }

  console.log('Vérification des sitemaps en ligne — ' + BASE + '\n');
  let dernier = null;
  for (let essai = 1; essai <= TENTATIVES; essai += 1) {
    const controleur = new AbortController();
    const minuterie = setTimeout(() => controleur.abort(), 30000);
    try {
      dernier = await verifier(controleur.signal);
    } catch (erreur) {
      dernier = { lignes: ['  ❌ ' + BASE + ' injoignable : ' + erreur.message], problemes: [erreur.message] };
    }
    clearTimeout(minuterie);
    if (!dernier.problemes.length) break;
    if (essai < TENTATIVES) {
      console.log('  ⏳ nouvel essai dans ' + (ATTENTE_MS / 1000) + ' s… (' + essai + '/' + TENTATIVES + ')');
      await new Promise((resoudre) => setTimeout(resoudre, ATTENTE_MS));
    }
  }

  dernier.lignes.forEach((ligne) => console.log(ligne));
  console.log('\n' + (dernier.problemes.length
    ? '❌ ' + dernier.problemes.length + ' problème(s) : le sitemap en ligne ne peut pas être lu par Google.'
    : '✅ Tout est en ligne, lisible par Google, sans redirection ni cache périmé.'));
  process.exit(dernier.problemes.length ? 1 : 0);
}

principal();
