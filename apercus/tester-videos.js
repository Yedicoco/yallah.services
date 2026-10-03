#!/usr/bin/env node
/* Serveur déjà lancé : node server.js
   npm i --no-save playwright && npx playwright install chromium
   node apercus/tester-videos.js [http://localhost:3000]
   CHROMIUM_PATH permet d'utiliser un navigateur installé autrement.
   Captures régénérables, ignorées par Git. Aucun message WhatsApp envoyé. */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:3000';

(async () => {
  const navigateur = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    for (const largeur of [320, 390, 760, 1280]) {
      for (const [page, selecteur, nombre] of [
        ['index.html', '#videos', 3], ['personnel-entreprises.html', '#video-entreprises', 1]
      ]) {
        const contexte = await navigateur.newContext({ viewport: { width: largeur, height: 900 }, locale: 'fr-MA' });
        const onglet = await contexte.newPage();
        const requetesMp4 = [];
        const erreurs = [];
        onglet.on('request', r => { if (/\.mp4(?:\?|$)/.test(r.url())) requetesMp4.push(r.url()); });
        onglet.on('pageerror', e => erreurs.push(e.message));
        await onglet.route('https://fonts.googleapis.com/**', r => r.abort());
        await onglet.route('https://fonts.gstatic.com/**', r => r.abort());
        await onglet.goto(base + '/' + page, { waitUntil: 'networkidle' });
        const galerie = onglet.locator(selecteur);
        await galerie.scrollIntoViewIfNeeded();
        await onglet.waitForFunction(sel => [...document.querySelectorAll(sel + ' video')].every(v => v.paused && v.readyState === 0), selecteur);
        assert.equal(await galerie.locator('video').count(), nombre);
        assert.equal(requetesMp4.length, 0, 'Aucun MP4 ne doit être téléchargé avant le clic');
        assert.equal(await onglet.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${page} déborde à ${largeur}px`);
        assert.equal(await galerie.locator('video').evaluateAll(videos => videos.every(v => {
          const rect = v.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= innerWidth && Math.abs(rect.width / rect.height - 9 / 16) < .01;
        })), true, 'Vidéos sans débordement ni recadrage');
        if (largeur === 390 || largeur === 1280) {
          await galerie.screenshot({ path: path.join(__dirname, `videos-${page.replace('.html', '')}-${largeur}.png`) });
        }
        // Le changement de langue ne doit ni retirer les lecteurs ni charger les MP4.
        for (const langue of ['dar', 'dar-latn', 'en', 'fr']) {
          await onglet.evaluate(l => window.YSI18N.definir(l), langue);
          await onglet.waitForFunction(l => window.YSI18N.langue() === l, langue);
          assert.equal(await galerie.locator('video').count(), nombre);
          assert.equal(await onglet.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        }
        assert.equal(requetesMp4.length, 0);
        // Clic sur le bouton lecture natif, puis vérification du décodage réel.
        for (const video of await galerie.locator('video').all()) {
          await video.scrollIntoViewIfNeeded();
          const dimensions = await video.boundingBox();
          await video.click({ position: { x: 24, y: dimensions.height - 48 } });
          await video.evaluate(v => new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Lecture non démarrée : ' + v.currentSrc)), 15000);
            const verifier = () => {
              if (v.currentTime > 0 && !v.paused && v.videoWidth > 0) {
                clearTimeout(timer); v.removeEventListener('timeupdate', verifier); resolve();
              }
            };
            v.addEventListener('timeupdate', verifier); verifier();
          }));
          await video.evaluate(v => v.pause());
        }
        assert.equal(erreurs.length, 0, erreurs.join('\n'));
        console.log(`✅ ${page} — ${largeur}px : aucun chargement avant clic, lecture native OK, FR/DAR/EN sans débordement`);
        await contexte.close();
      }
    }
  } finally { await navigateur.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
