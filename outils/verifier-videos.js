#!/usr/bin/env node
/* Sans dépendance : node outils/verifier-videos.js [--dossier site-a-mettre-en-ligne]
   Vérifie les originaux, leur placement et les attributs de lecture. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const racine = path.resolve(__dirname, '..');
const option = process.argv.indexOf('--dossier');
const dossier = option < 0 ? racine : path.resolve(racine, process.argv[option + 1]);
const manifeste = JSON.parse(fs.readFileSync(path.join(racine, 'contenu/videos-sources.json'), 'utf8'));
const attendus = ['besoin-d-aide-a-domicile.mp4', 'yallah-service.mp4', '2026-08-28-151819708.mp4', 'prospection-b2b.mp4'];
assert.deepEqual(manifeste.files.map(f => path.basename(f.source)), attendus);
for (const f of manifeste.files) {
  const contenu = fs.readFileSync(path.join(dossier, f.destination));
  assert.equal(contenu.length, f.bytes, f.destination);
  assert.equal(crypto.createHash('sha256').update(contenu).digest('hex'), f.sha256, f.destination);
  assert.equal(crypto.createHash('sha1').update(`blob ${contenu.length}\0`).update(contenu).digest('hex'), f.gitBlob);
}
const attribut = (html, nom) => (html.match(new RegExp(`\\b${nom}="([^"]*)"`)) || [])[1];
for (const [page, noms] of [['index.html', attendus.slice(0, 3)], ['personnel-entreprises.html', attendus.slice(3)]]) {
  const html = fs.readFileSync(path.join(dossier, page), 'utf8');
  const videos = [...html.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/g)];
  assert.equal(videos.length, noms.length, page);
  videos.forEach(([tout, attrs, contenu], i) => {
    assert.match(attrs, /\bcontrols\b/);
    assert.match(attrs, /\bplaysinline\b/);
    assert.equal(attribut(attrs, 'preload'), 'none');
    assert.doesNotMatch(attrs, /\b(?:autoplay|loop)\b/);
    assert.match(contenu, /type="video\/mp4"/);
    assert.equal(attribut(contenu, 'src'), 'assets/videos/' + noms[i]);
    const poster = attribut(attrs, 'poster');
    assert.equal(poster, 'assets/img/videos/' + noms[i].replace('.mp4', '.jpg'));
    assert.ok(fs.statSync(path.join(dossier, poster)).size > 0);
    assert.ok(html.includes('id="' + attribut(attrs, 'aria-labelledby') + '"'));
  });
  const cartes = [...html.matchAll(/<article class="video-card">([\s\S]*?)<\/article>/g)];
  assert.equal(cartes.length, noms.length);
  cartes.forEach(([, carte]) => {
    const lien = carte.match(/<a[^>]+href="(https:\/\/wa.me\/[^\"]+)"[^>]*>/)[0];
    const url = new URL(attribut(lien, 'href'));
    assert.equal(url.pathname, '/212691733585');
    assert.ok(url.searchParams.get('text').startsWith('Bonjour Yallah Services,'));
    assert.match(attribut(lien, 'rel'), /noopener/);
  });
  if (page === 'index.html') {
    assert.ok(html.indexOf('id="temo"') < html.indexOf('id="videos"'));
    assert.ok(html.indexOf('id="videos"') < html.indexOf('id="packs"'));
    assert.ok(!html.includes('prospection-b2b.mp4'));
  } else {
    attendus.slice(0, 3).forEach(nom => assert.ok(!html.includes(nom)));
  }
}
console.log('✅ Quatre MP4 identiques aux sources ; chemins, vignettes, placement, commandes natives et WhatsApp valides (' + path.relative(racine, dossier) + ').');
