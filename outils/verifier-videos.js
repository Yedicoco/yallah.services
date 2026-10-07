#!/usr/bin/env node
/* Sans dépendance : node outils/verifier-videos.js [--dossier site-a-mettre-en-ligne]
   Vérifie les originaux, leur placement et les attributs de lecture. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { dimensions } = require('./generer-images.js');
const racine = path.resolve(__dirname, '..');
const option = process.argv.indexOf('--dossier');
const dossier = option < 0 ? racine : path.resolve(racine, process.argv[option + 1]);
const manifeste = JSON.parse(fs.readFileSync(path.join(racine, 'contenu/videos-sources.json'), 'utf8'));
const attendus = ['besoin-d-aide-a-domicile.mp4', 'yallah-service.mp4', '2026-08-28-151819708.mp4', 'prospection-b2b.mp4'];
const LARGEUR_POSTER_ACCUEIL = 480;
const TAILLE_MAX_POSTER_ACCUEIL = 90 * 1024;
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
    const cheminPoster = path.join(dossier, poster);
    const taillePoster = fs.statSync(cheminPoster).size;
    assert.ok(taillePoster > 0);
    if (page === 'index.html') {
      const taille = dimensions(cheminPoster);
      assert.ok(taille, 'Dimensions du poster illisibles : ' + poster);
      assert.equal(taille.largeur, LARGEUR_POSTER_ACCUEIL, poster);
      assert.ok(Math.abs(taille.largeur / taille.hauteur - 9 / 16) < 0.002, poster);
      assert.ok(taillePoster <= TAILLE_MAX_POSTER_ACCUEIL, poster + ' dépasse 90 Kio');
    }
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
    assert.ok(html.includes('href="personnel-entreprises.html#video-entreprises"'));
    assert.ok(html.includes('src="assets/img/videos/prospection-b2b.jpg"'));
    assert.ok(html.includes('id="video-business-promo-title"'));
  } else {
    assert.ok(html.includes('href="#video-entreprises">Vidéo B2B</a>'));
    attendus.slice(0, 3).forEach(nom => assert.ok(!html.includes(nom)));
  }
}

// Contrôle que sitemap vidéo et VideoObject décrivent exactement les mêmes MP4 que la galerie.
const seo = JSON.parse(fs.readFileSync(path.join(racine, 'contenu/videos-seo.json'), 'utf8'));
const config = JSON.parse(fs.readFileSync(path.join(racine, 'site.config.json'), 'utf8'));
const base = config.url.replace(/\/+$/, '');
assert.equal(seo.videos.length, attendus.length);
const sitemapVideo = fs.readFileSync(path.join(dossier, 'video-sitemap.xml'), 'utf8');
assert.match(sitemapVideo, /xmlns:video="http:\/\/www\.google\.com\/schemas\/sitemap-video\/1\.1"/);
assert.equal((sitemapVideo.match(/<video:video>/g) || []).length, attendus.length);
assert.equal((sitemapVideo.match(/<video:content_loc>/g) || []).length, attendus.length);
for (const video of seo.videos) {
  assert.ok(sitemapVideo.includes('<video:title>' + video.name + '</video:title>'));
  assert.ok(sitemapVideo.includes(base + '/' + video.content));
  const html = fs.readFileSync(path.join(dossier, video.page), 'utf8');
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const graph = scripts.flatMap(([, body]) => {
    const json = JSON.parse(body);
    return json['@graph'] || [json];
  });
  const entity = graph.find(item => item['@type'] === 'VideoObject' && item['@id'] === base + '/' + (video.page === 'index.html' ? '' : video.page) + '#' + video.id);
  assert.ok(entity, 'VideoObject manquant : ' + video.id);
  assert.equal(entity.name, video.name);
  assert.equal(entity.description, video.description);
  assert.equal(entity.contentUrl, base + '/' + video.content);
  assert.deepEqual(entity.thumbnailUrl, [base + '/' + video.thumbnail]);
  assert.equal(entity.uploadDate, seo.publicationDate);
  assert.match(html, /max-video-preview:-1/);
}
const robots = fs.readFileSync(path.join(dossier, 'robots.txt'), 'utf8');
assert.ok(robots.includes(base + '/sitemap.xml'));
assert.ok(robots.includes(base + '/video-sitemap.xml'));
const cible = path.relative(racine, dossier);
console.log('✅ Quatre MP4, posters accueil 480 px / <90 Kio, VideoObject, video-sitemap.xml, robots.txt et contrôles de lecture validés' +
  (cible ? ' (' + cible + ')' : '') + '.');
