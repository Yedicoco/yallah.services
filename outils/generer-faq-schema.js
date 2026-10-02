#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Données structurées FAQPage

   Lit la FAQ visible dans index.html et (ré)génère le bloc JSON-LD
   « FAQPage » correspondant, injecté dans le <head>. Ainsi les extraits
   enrichis (FAQ dépliée dans Google) restent TOUJOURS synchronisés avec
   le texte réellement affiché : aucune divergence possible entre le
   balisage et la page.

   Utilisation :
       node outils/generer-faq-schema.js
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');

const FICHIER = path.join(__dirname, '..', 'index.html');
const BALISE_OUVRANTE = '<script type="application/ld+json" id="schema-faq">';
const BALISE_FERMANTE = '</script>';

function texteBrut(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(li|p|div|ul|ol)>/gi, ' ')
    .replace(/<li[^>]*>/gi, ' - ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/\s+/g, ' ')
    .trim();
}

function extraireFaq(html) {
  const questions = [];
  const motif = /<button class="faq-q">([\s\S]*?)<\/button>\s*<div class="faq-a">([\s\S]*?)<\/div>/g;
  let m;
  while ((m = motif.exec(html)) !== null) {
    const question = texteBrut(m[1]);
    const reponse = texteBrut(m[2]);
    if (question && reponse) questions.push({ question, reponse });
  }
  return questions;
}

const html = fs.readFileSync(FICHIER, 'utf8');
const faq = extraireFaq(html);

if (faq.length === 0) {
  console.error('Aucune question de FAQ trouvée dans index.html — abandon.');
  process.exit(1);
}

const schema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.reponse }
  }))
};

const bloc = BALISE_OUVRANTE + '\n' + JSON.stringify(schema, null, 2) + '\n' + BALISE_FERMANTE;

let sortie;
const debut = html.indexOf(BALISE_OUVRANTE);
if (debut !== -1) {
  const fin = html.indexOf(BALISE_FERMANTE, debut) + BALISE_FERMANTE.length;
  sortie = html.slice(0, debut) + bloc + html.slice(fin);
  console.log('Bloc FAQPage mis à jour.');
} else {
  const finHead = html.indexOf('</head>');
  if (finHead === -1) { console.error('</head> introuvable.'); process.exit(1); }
  sortie = html.slice(0, finHead) + bloc + '\n' + html.slice(finHead);
  console.log('Bloc FAQPage injecté dans le <head>.');
}

fs.writeFileSync(FICHIER, sortie, 'utf8');
console.log('  ' + faq.length + ' questions structurées.');
