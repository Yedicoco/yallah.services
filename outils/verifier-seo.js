#!/usr/bin/env node
/* Contrôle technique SEO statique, sans dépendance.
   Usage: node outils/verifier-seo.js [--dossier site-a-mettre-en-ligne]
   Vérifie canonicals, metas, Schema.org JSON-LD et cohérence du sitemap.
*/
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const RACINE = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(RACINE, 'site.config.json'), 'utf8'));
const optionDossier = process.argv.indexOf('--dossier');
const DOSSIER = optionDossier < 0
  ? RACINE
  : path.resolve(RACINE, process.argv[optionDossier + 1]);
const BASE = String(process.env.SITE_URL || CONFIG.url || '').replace(/\/+$/, '');
const HORS_SITEMAP = new Set(CONFIG.pagesHorsSitemap || []);
let erreurs = 0;

function erreur(message) {
  erreurs += 1;
  console.error('  ❌ ' + message);
}
function ok(message) {
  console.log('  ✅ ' + message);
}
function attr(tag, nom) {
  const motif = new RegExp("\\b" + nom + "\\s*=\\s*([\"'])(.*?)\\1", "i");
  return (tag.match(motif) || [])[2] || '';
}
function balises(html, nom) {
  return html.match(new RegExp('<' + nom + '\\b[^>]*>', 'gi')) || [];
}
function sansIndexation(html) {
  return balises(html, 'meta').some((tag) => {
    const nom = attr(tag, 'name').trim();
    const contenu = attr(tag, 'content');
    return /^(robots|googlebot|bingbot)$/i.test(nom) && /(?:^|[\s,])noindex(?:$|[\s,])/i.test(contenu);
  });
}
function decodeHtml(text) {
  return String(text).replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&#x0*27;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
}
function texteBalise(html, nom) {
  const match = html.match(new RegExp('<' + nom + '\\b[^>]*>([\\s\\S]*?)<\\/' + nom + '>', 'i'));
  return match ? decodeHtml(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) : '';
}
function fichierGoogle(fichier) {
  return /^google.*\.html$/i.test(fichier);
}
function canoniqueAttendu(fichier) {
  return BASE + '/' + (fichier === 'index.html' ? '' : fichier);
}
function lireSitemap() {
  const fichier = path.join(DOSSIER, 'sitemap.xml');
  if (!fs.existsSync(fichier)) {
    erreur('sitemap.xml absent dans ' + path.relative(RACINE, DOSSIER));
    return [];
  }
  const xml = fs.readFileSync(fichier, 'utf8');
  return Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi), (match) => decodeHtml(match[1].trim()));
}
function analyserSchema(html, fichier) {
  const scripts = Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))
    .filter((match) => /application\/ld\+json/i.test(attr('<script ' + match[1] + '>', 'type')));
  const noeuds = [];
  scripts.forEach((match, index) => {
    try {
      noeuds.push(JSON.parse(match[2]));
    } catch (cause) {
      erreur(fichier + ' : JSON-LD n°' + (index + 1) + ' invalide (' + cause.message + ')');
    }
  });
  if (!scripts.length) erreur(fichier + ' : balisage JSON-LD absent sur une page indexable.');
  return noeuds;
}
function parcourir(noeud, visite) {
  if (Array.isArray(noeud)) return noeud.forEach((valeur) => parcourir(valeur, visite));
  if (!noeud || typeof noeud !== 'object') return;
  visite(noeud);
  Object.values(noeud).forEach((valeur) => parcourir(valeur, visite));
}

console.log('AUDIT TECHNIQUE SEO — ' + path.relative(RACINE, DOSSIER) + '/');
console.log('Domaine canonique attendu : ' + BASE);

const pagesHtml = fs.readdirSync(DOSSIER)
  .filter((fichier) => fichier.endsWith('.html') && !fichierGoogle(fichier))
  .sort();
const indexables = [];
const noindex = [];

pagesHtml.forEach((fichier) => {
  const html = fs.readFileSync(path.join(DOSSIER, fichier), 'utf8');
  if (sansIndexation(html) || HORS_SITEMAP.has(fichier)) {
    noindex.push(fichier);
  } else {
    indexables.push({ fichier, html });
  }
});

const titres = new Map();
const descriptions = new Map();
const urlsCanon = new Set();

indexables.forEach(({ fichier, html }) => {
  const titreTags = balises(html, 'title');
  const titre = texteBalise(html, 'title');
  const descriptionsMeta = balises(html, 'meta').filter((tag) => attr(tag, 'name').toLowerCase() === 'description');
  const description = decodeHtml(attr(descriptionsMeta[0] || '', 'content')).trim();
  const liensCanon = balises(html, 'link').filter((tag) =>
    attr(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical'));
  const canonique = attr(liensCanon[0] || '', 'href').trim();
  const ogUrls = balises(html, 'meta').filter((tag) => attr(tag, 'property').toLowerCase() === 'og:url');
  const ogUrl = attr(ogUrls[0] || '', 'content').trim();

  if (titreTags.length !== 1 || !titre) erreur(fichier + ' : il faut exactement un <title> non vide.');
  else if (titre.length > 60) erreur(fichier + ' : title de ' + titre.length + ' caractères (> 60).');
  if (descriptionsMeta.length !== 1 || !description) erreur(fichier + ' : il faut exactement une meta description non vide.');
  else if (description.length < 120 || description.length > 165) {
    erreur(fichier + ' : description de ' + description.length + ' caractères (attendu : 120–165).');
  }
  if (liensCanon.length !== 1 || !canonique) erreur(fichier + ' : il faut exactement un canonical.');
  else {
    const attendu = canoniqueAttendu(fichier);
    if (canonique !== attendu) erreur(fichier + ' : canonical ' + canonique + ' ≠ ' + attendu);
    if (urlsCanon.has(canonique)) erreur(fichier + ' : canonical dupliqué (' + canonique + ').');
    urlsCanon.add(canonique);
  }
  if (ogUrls.length !== 1 || ogUrl !== canonique) erreur(fichier + ' : og:url absent, dupliqué ou différent du canonical.');

  if (titre && titres.has(titre)) erreur(fichier + ' : title dupliqué avec ' + titres.get(titre) + '.');
  else if (titre) titres.set(titre, fichier);
  if (description && descriptions.has(description)) erreur(fichier + ' : description dupliquée avec ' + descriptions.get(description) + '.');
  else if (description) descriptions.set(description, fichier);

  const blocs = analyserSchema(html, fichier);
  const types = new Set();
  const ids = new Set();
  blocs.forEach((bloc) => parcourir(bloc, (noeud) => {
    if (noeud['@type']) {
      (Array.isArray(noeud['@type']) ? noeud['@type'] : [noeud['@type']]).forEach((type) => types.add(type));
    }
    // Une référence ne contenant que @id (publisher/provider/isPartOf) peut
    // légitimement répéter l'identifiant de l'entité déclarée dans le graphe.
    if (noeud['@id'] && noeud['@type']) {
      if (ids.has(noeud['@id'])) erreur(fichier + ' : @id Schema.org dupliqué (' + noeud['@id'] + ').');
      ids.add(noeud['@id']);
    }
  }));

  if (fichier === 'index.html') {
    ['WebSite', 'EmploymentAgency'].forEach((type) => {
      if (!types.has(type)) erreur(fichier + ' : type Schema.org requis absent : ' + type + '.');
    });
  } else if (/-(?:casablanca|rabat|marrakech|tanger|agadir|fes|kenitra|mohammedia|temara|sale|bouskoura|dar-bouazza|bouznika)\.html$/i.test(fichier)) {
    ['Service', 'BreadcrumbList', 'FAQPage'].forEach((type) => {
      if (!types.has(type)) erreur(fichier + ' : type Schema.org requis absent : ' + type + '.');
    });
  } else if (fichier !== 'personnel-entreprises.html') {
    if (!types.has('BreadcrumbList')) erreur(fichier + ' : fil d’Ariane Schema.org absent.');
  }

  if (types.size) ok(fichier + ' : metas, canonical et JSON-LD (' + Array.from(types).join(', ') + ').');
});

const urlsSitemap = lireSitemap();
const attenduesSitemap = new Set(indexables.map(({ fichier }) => canoniqueAttendu(fichier)));
const presentesSitemap = new Set(urlsSitemap);
attenduesSitemap.forEach((url) => {
  if (!presentesSitemap.has(url)) erreur('Sitemap : URL indexable absente — ' + url);
});
presentesSitemap.forEach((url) => {
  if (!attenduesSitemap.has(url)) erreur('Sitemap : URL inattendue, noindex ou non publiée — ' + url);
});
noindex.forEach((fichier) => {
  const url = canoniqueAttendu(fichier);
  if (presentesSitemap.has(url)) erreur('Sitemap : page noindex encore incluse — ' + fichier);
});
if (!erreurs) ok('Sitemap cohérent : ' + urlsSitemap.length + ' URL indexable(s), aucune URL noindex.');

console.log('\n' + (erreurs ? '❌ ' + erreurs + ' erreur(s) SEO technique.' : '✅ Contrôle SEO technique réussi.') + '\n');
process.exit(erreurs ? 1 : 0);
