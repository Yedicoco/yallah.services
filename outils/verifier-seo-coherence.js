#!/usr/bin/env node
/*
 * Contrôles SEO transversaux : le domaine publié doit rester cohérent entre
 * configuration, canoniques, JSON-LD, robots.txt et sitemaps.
 * Usage : node outils/verifier-seo-coherence.js [--dossier dossier]
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const OUTPUT = path.resolve(ROOT, argument('--dossier', '.'));
const PUBLIC_ORIGIN = String(CONFIG.url || '').replace(/\/+$/, '');
const DESIRED_ORIGIN = String(CONFIG.urlSouhaitee || '').replace(/\/+$/, '');
const failures = [];
const warnings = [];

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function fail(message) { failures.push(message); }
function warn(message) { warnings.push(message); }
function read(relative) { return fs.readFileSync(path.join(OUTPUT, relative), 'utf8'); }
function htmlFiles() {
  const excluded = new Set(CONFIG.pagesHorsSitemap || []);
  return fs.readdirSync(OUTPUT)
    .filter((name) => name.endsWith('.html'))
    .filter((name) => !/^google.*\.html$/i.test(name))
    .filter((name) => !excluded.has(name));
}
function meta(html, name) {
  const pattern = new RegExp(`<meta\\b[^>]*\\bname=["']${name}["'][^>]*\\bcontent=["']([^"']*)["'][^>]*>`, 'i');
  return (html.match(pattern) || [])[1] || '';
}
function property(html, name) {
  const pattern = new RegExp(`<meta\\b[^>]*\\bproperty=["']${name}["'][^>]*\\bcontent=["']([^"']*)["'][^>]*>`, 'i');
  return (html.match(pattern) || [])[1] || '';
}
function links(html, rel) {
  const pattern = new RegExp(`<link\\b[^>]*\\brel=["']${rel}["'][^>]*\\bhref=["']([^"']+)["'][^>]*>`, 'ig');
  return [...html.matchAll(pattern)].map((match) => match[1]);
}
function urls(text) {
  return [...text.matchAll(/<loc>([^<]+)<\\/loc>/g)].map((match) => match[1]);
}
function sameOrigin(value, label) {
  if (!value) return;
  if (!value.startsWith(PUBLIC_ORIGIN)) fail(`${label} n'utilise pas le domaine publié ${PUBLIC_ORIGIN}: ${value}`);
  if (DESIRED_ORIGIN && value.startsWith(DESIRED_ORIGIN)) fail(`${label} utilise le domaine souhaité non encore publié: ${value}`);
}

if (!PUBLIC_ORIGIN) fail('site.config.json:url est vide.');
if (!fs.existsSync(path.join(OUTPUT, 'index.html'))) fail(`${OUTPUT}/index.html est absent.`);

for (const file of htmlFiles()) {
  const html = read(file);
  const robots = meta(html, 'robots');
  if (/noindex/i.test(robots)) continue;

  const canonical = links(html, 'canonical');
  if (canonical.length !== 1) fail(`${file}: attendu exactement un canonical, trouvé ${canonical.length}.`);
  canonical.forEach((value) => sameOrigin(value, `${file} canonical`));

  if (!/<title>[^<\\S][^<]*<\\/title>/i.test(html) && !/<title>[^<]+<\\/title>/i.test(html)) fail(`${file}: title absent ou vide.`);
  if (!meta(html, 'description').trim()) fail(`${file}: meta description absente ou vide.`);
  if (!property(html, 'og:title') || !property(html, 'og:description') || !property(html, 'og:image')) {
    fail(`${file}: balises Open Graph title/description/image incomplètes.`);
  }
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) fail(`${file}: attendu exactement un H1, trouvé ${h1Count}.`);

  for (const value of [...canonical, ...links(html, 'alternate')]) sameOrigin(value, `${file} lien SEO`);

  for (const script of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(script[1]);
      const graph = Array.isArray(json) ? json : [json, ...(Array.isArray(json['@graph']) ? json['@graph'] : [])];
      for (const item of graph) {
        for (const key of ['url', '@id', 'image', 'logo']) {
          const value = item && item[key];
          if (typeof value === 'string') sameOrigin(value, `${file} JSON-LD ${key}`);
        }
      }
    } catch (error) {
      fail(`${file}: JSON-LD invalide (${error.message}).`);
    }
  }
}

if (fs.existsSync(path.join(OUTPUT, 'robots.txt'))) {
  const robots = read('robots.txt');
  const sitemapLines = [...robots.matchAll(/^Sitemap:\s*(\S+)/gim)].map((match) => match[1]);
  if (sitemapLines.length !== 2) fail(`robots.txt: attendu deux déclarations Sitemap, trouvé ${sitemapLines.length}.`);
  for (const value of sitemapLines) {
    if (value !== `${PUBLIC_ORIGIN}/sitemap.xml` && value !== `${PUBLIC_ORIGIN}/video-sitemap.xml`) {
      fail(`robots.txt référence un sitemap incohérent: ${value}`);
    }
  }
}

for (const sitemap of ['sitemap.xml', 'video-sitemap.xml']) {
  const file = path.join(OUTPUT, sitemap);
  if (!fs.existsSync(file)) { fail(`${sitemap} absent.`); continue; }
  const values = urls(fs.readFileSync(file, 'utf8'));
  if (!values.length) fail(`${sitemap} ne contient aucune URL.`);
  for (const value of values) sameOrigin(value, `${sitemap} URL`);
  if (new Set(values).size !== values.length) warn(`${sitemap} contient des URLs dupliquées.`);
}

console.log(`SEO coherence: ${htmlFiles().length} page(s), domaine ${PUBLIC_ORIGIN}`);
for (const message of warnings) console.warn(`WARN: ${message}`);
if (failures.length) {
  for (const message of failures) console.error(`ERROR: ${message}`);
  process.exit(1);
}
console.log('SEO coherence: OK');
