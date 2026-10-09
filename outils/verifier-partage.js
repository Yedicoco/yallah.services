#!/usr/bin/env node
/* Vérifie la carte de partage dans le HTML initial des deux versions statiques. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { dimensions } = require('./generer-images');

const racine = path.resolve(__dirname, '..');
const site = 'https://yallahservices-one.vercel.app/';
const image = 'assets/img/yallah-services-partage-v2-1200x630.jpg';
const titre = 'Yallah Services | Aide à domicile au Maroc';
const description = 'Femmes de ménage, cuisinières, nounous, garde-malades, grand ménage et services aux entreprises. Contactez-nous sur WhatsApp au +212 691 733 585.';
const attendus = {
  'name:description': description,
  'property:og:title': titre,
  'property:og:description': description,
  'property:og:type': 'website',
  'property:og:url': site,
  'property:og:image': site + image,
  'property:og:image:type': 'image/jpeg',
  'property:og:image:width': '1200',
  'property:og:image:height': '630',
  'property:og:image:alt': 'Flyer Yallah Services, aide à domicile au Maroc et contact WhatsApp +212 691 733 585',
  'name:twitter:card': 'summary_large_image',
  'name:twitter:title': titre,
  'name:twitter:description': description,
  'name:twitter:image': site + image
};

function verifier(dossier) {
  const html = fs.readFileSync(path.join(dossier, 'index.html'), 'utf8');
  const head = html.match(/<head>([\s\S]*?)<\/head>/i);
  assert.ok(head, 'Balises présentes dans le HTML initial, pas injectées par JavaScript');
  const metas = [...head[1].matchAll(/<meta\b[^>]*>/gi)];
  for (const [cle, valeur] of Object.entries(attendus)) {
    const [attribut, nom] = cle.split(/:(.*)/s);
    const correspondants = metas.filter(([tag]) =>
      new RegExp(`\\b${attribut}="${nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i').test(tag));
    assert.equal(correspondants.length, 1, `${dossier}: ${cle} doit apparaître une seule fois`);
    assert.ok(correspondants[0][0].includes(`content="${valeur}"`), `${dossier}: ${cle} incorrect`);
  }
  assert.equal((head[1].match(/<link rel="canonical"/g) || []).length, 1);
  assert.ok(head[1].includes(`<link rel="canonical" href="${site}">`));
  assert.ok(!head[1].includes(site + 'assets/img/yallah-services-partage-1200x630.jpg'),
    `${dossier}: l'ancienne URL d'image ne doit plus être utilisée dans les métadonnées`);
  const fichier = path.join(dossier, image);
  assert.ok(fs.existsSync(fichier), `Image publique absente : ${fichier}`);
  assert.deepEqual(dimensions(fichier), { largeur: 1200, hauteur: 630 });
  const contenuImage = fs.readFileSync(fichier);
  assert.deepEqual([...contenuImage.subarray(0, 2)], [0xff, 0xd8], 'Image publique au format JPEG');
  assert.ok(contenuImage.length < 5 * 1024 * 1024, 'Image trop lourde pour les robots sociaux');
  console.log(`✅ ${path.relative(racine, dossier) || '.'}/ : métadonnées uniques dans le HTML initial et image JPEG 1200 × 630`);
}

verifier(racine);
verifier(path.join(racine, 'site-a-mettre-en-ligne'));
