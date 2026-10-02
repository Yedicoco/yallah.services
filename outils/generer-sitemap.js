#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Génération du sitemap.xml

   Le sitemap n'est plus écrit à la main : il est construit à partir
   des pages réellement présentes dans le dépôt, avec la date du
   dernier commit Git de chacune comme <lastmod>.

       node outils/generer-sitemap.js
       node outils/generer-sitemap.js --url https://yallah.services
       node outils/generer-sitemap.js --dossier site-a-mettre-en-ligne

   Options :
       --url <adresse>   domaine public (défaut : site.config.json)
       --dossier <chemin>  où écrire le sitemap (défaut : racine)

   Le script met aussi à jour la ligne « Sitemap: … » de robots.txt
   lorsque le sitemap est écrit à la racine.

   Utilisé comme module par build-site.js (fonction construire + écrire).
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RACINE = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(RACINE, 'site.config.json'), 'utf8'));

function argument(nom, defaut) {
  const index = process.argv.indexOf(nom);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : defaut;
}

/* ── Pages à publier ── */
function listerPages(aDossier) {
  const dossier = aDossier || RACINE;
  const horsSitemap = new Set(CONFIG.pagesHorsSitemap || []);
  return fs.readdirSync(dossier)
    .filter((f) => f.endsWith('.html'))
    .filter((f) => !horsSitemap.has(f))
    .filter((f) => !/^google.*\.html$/i.test(f))
    .filter((f) => fs.existsSync(dossier === RACINE ? f : path.join(dossier, f)))
    .sort();
}

const HUB = 'services-par-ville.html';

function priorite(fichier) {
  if (fichier === 'index.html') return { priorite: '1.0', frequence: 'weekly' };
  if (fichier === HUB) return { priorite: '0.9', frequence: 'weekly' };
  if (fichier === 'candidature.html') return { priorite: '0.7', frequence: 'monthly' };
  const base = fichier.replace(/\.html$/, '').split('-');
  const ville = base[base.length - 1];
  if (CONFIG.villes.some((v) => v.slug === ville)) return { priorite: '0.8', frequence: 'monthly' };
  return { priorite: '0.6', frequence: 'monthly' };
}

function dateGit(fichier, dossier) {
  try {
    const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', fichier],
      { cwd: RACINE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (date) return date;
  } catch (e) { /* dépôt absent ou fichier non suivi */ }
  try {
    const stat = fs.statSync(path.join(dossier || RACINE, fichier));
    return stat.mtime.toISOString().slice(0, 10);
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

/* ── Construction ── */
function construire(url, dossier) {
  const adresse = String(url).replace(/\/+$/, '');
  const poids = (f) => (f === 'index.html' ? 0 : f === HUB ? 1 : f === 'candidature.html' ? 2 : 3);
  return listerPages(dossier)
    .sort((a, b) => (poids(a) - poids(b)) || a.localeCompare(b))
    .map((fichier) => {
      const { priorite: p, frequence } = priorite(fichier);
      const loc = adresse + '/' + (fichier === 'index.html' ? '' : fichier);
      return {
        loc,
        lastmod: dateGit(fichier, dossier),
        changefreq: frequence,
        priority: p
      };
    });
}

function enXml(entrees) {
  const lignes = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  entrees.forEach((e) => {
    lignes.push('  <url>');
    lignes.push('    <loc>' + e.loc + '</loc>');
    lignes.push('    <lastmod>' + e.lastmod + '</lastmod>');
    lignes.push('    <changefreq>' + e.changefreq + '</changefreq>');
    lignes.push('    <priority>' + e.priority + '</priority>');
    lignes.push('  </url>');
  });
  lignes.push('</urlset>');
  return lignes.join('\n') + '\n';
}

/* robots.txt : la ligne « Sitemap: … » suit toujours le domaine configuré */
function synchroniserRobots(dossier, adresse) {
  const chemin = path.join(dossier, 'robots.txt');
  if (!fs.existsSync(chemin)) return false;
  let contenu = fs.readFileSync(chemin, 'utf8');
  const ligne = 'Sitemap: ' + adresse.replace(/\/+$/, '') + '/sitemap.xml';
  if (/^Sitemap:.*$/m.test(contenu)) {
    contenu = contenu.replace(/^Sitemap:.*$/m, ligne);
  } else {
    contenu = contenu.replace(/\s*$/, '\n\n' + ligne + '\n');
  }
  fs.writeFileSync(chemin, contenu, 'utf8');
  return true;
}

function ecrire(url, dossier) {
  const cible = dossier || RACINE;
  const adresse = String(url).replace(/\/+$/, '');
  const entrees = construire(adresse, cible);
  fs.writeFileSync(path.join(cible, 'sitemap.xml'), enXml(entrees), 'utf8');
  if (path.resolve(cible) === RACINE) synchroniserRobots(cible, adresse);
  return entrees;
}

module.exports = { construire, enXml, ecrire, priorite };

/* ── Exécution directe ── */
if (require.main === module) {
  const url = argument('--url', CONFIG.url);
  const dossier = path.resolve(argument('--dossier', RACINE));
  const entrees = ecrire(url, dossier);
  console.log('Sitemap généré : ' + entrees.length + ' page(s) → ' +
    path.relative(process.cwd(), path.join(dossier, 'sitemap.xml')));
  entrees.forEach((e) => console.log('  ' + e.lastmod + '  ' + e.loc));
}
