#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Matrice de pages service × ville

   Génère une page dédiée par couple {service, ville} à partir de
   outils/donnees-villes.js (source unique de vérité), puis :
     · met à jour le bloc « Nos services, ville par ville » de index.html
       (maillage interne : aucune page orpheline) ;
     · régénère sitemap.xml ;
     · écrit outils/pages-villes-generees.json (manifeste).

   Chaque page reçoit un contenu qui lui est propre : quartiers desservis,
   distance depuis Casablanca, règle commerciale du ménage à la journée,
   grille tarifaire du service, FAQ mixte service + ville. Aucun chiffre
   d'activité ni avis n'est inventé.

   Utilisation :
       node outils/generer-pages-villes.js              # génère / met à jour
       node outils/generer-pages-villes.js --nettoye    # supprime les pages générées

   Les pages rédigées à la main (femme-menage-casablanca.html,
   nounou-casablanca.html) ne sont JAMAIS écrasées.
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const { VILLES, SERVICES, PAGES_MANUELLES } = require('./donnees-villes.js');

const RACINE = path.join(__dirname, '..');
const SITE = 'https://yallahservices-one.vercel.app';
const WA = '212691733585';
const AUJOURD_HUI = '2026-10-02';
const MANIFESTE = path.join(__dirname, 'pages-villes-generees.json');
const MODELE_STYLE = path.join(RACINE, 'femme-menage-casablanca.html');

const DEBUT_BLOC = '<!-- DEBUT-LIENS-VILLES (généré : outils/generer-pages-villes.js) -->';
const FIN_BLOC = '<!-- FIN-LIENS-VILLES -->';

function waTexte(texte) {
  return encodeURIComponent(texte).replace(/%20/g, '%20');
}

function styleExtrait() {
  const html = fs.readFileSync(MODELE_STYLE, 'utf8');
  const debut = html.indexOf('<style>');
  const fin = html.indexOf('</style>');
  if (debut === -1 || fin === -1) throw new Error('Bloc <style> introuvable dans le modèle.');
  return html.slice(debut + '<style>'.length, fin);
}

function noteVille(ville) {
  if (ville.note) return ville.note;
  return 'Environ ' + ville.km + ' km séparent ' + ville.nom +
    ' de Casablanca, où notre équipe est basée : la sélection et la présentation du profil se font sous 24 h ouvrées (72 h maximum), puis la rencontre s’organise sur place, dans votre quartier.';
}

function faqVille(ville) {
  const quartiers = ville.quartiers.join(', ');
  const q1 = ['Intervenez-vous dans tous les quartiers de ' + ville.nom + ' ?',
    'Nous couvrons ' + ville.nom + ' et ses principaux quartiers : ' + quartiers +
    '. Indiquez le vôtre dans votre demande : nous confirmons la disponibilité avant toute présentation de profil.'];
  const journee = (ville.slug === 'casablanca' || ville.slug === 'rabat');
  const q2 = journee
    ? ['Le ménage à la journée est-il disponible à ' + ville.nom + ' ?',
      'Oui. ' + ville.nom + ' fait partie des deux villes où le ménage ponctuel à la journée est proposé, en plus des formules logée et non logée.']
    : ['Le ménage à la journée est-il disponible à ' + ville.nom + ' ?',
      'Le ménage ponctuel à la journée est pour l’instant limité à Casablanca et Rabat. À ' + ville.nom + ', nous proposons les formules logée et non logée, avec le même suivi après mise en relation.'];
  return [q1, q2];
}

const TITRES_SECTION = {
  'femme-menage': 'Une aide adaptée à votre maison',
  nounou: 'Une garde adaptée à vos enfants',
  cuisiniere: 'Une cuisine adaptée à vos habitudes',
  'garde-malade': 'Un accompagnement adapté à votre proche'
};

function pageHtml(service, ville, fichier, css) {
  const titre = service.nom + ' à ' + ville.nom + ' | Personnel fiable | Yallah Services';
  const description = service.nom + ' à ' + ville.nom + ' : profil sélectionné, références vérifiables et frais réglés après validation. Réponse sur WhatsApp sous 24 à 72 h — quartiers ' +
    ville.quartiers.slice(0, 3).join(', ') + '.';
  const wa = WA + '?text=' + waTexte('Bonjour Yallah Services, je cherche ' + service.article + ' à ' + ville.nom + '.');
  const faq = service.faq.concat(faqVille(ville));

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': SITE + '/' + fichier + '#service',
        name: service.nom + ' à ' + ville.nom,
        serviceType: service.nom + ' à domicile',
        description: service.lead,
        provider: { '@id': SITE + '/#business' },
        areaServed: { '@type': 'City', name: ville.nom },
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: SITE + '/' + fichier,
          servicePhone: { '@type': 'ContactPoint', telephone: '+212691733585', contactType: 'customer service', availableLanguage: ['French', 'Arabic'] }
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Services à domicile', item: SITE + '/#packs' },
          { '@type': 'ListItem', position: 3, name: service.nom + ' à ' + ville.nom, item: SITE + '/' + fichier }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } }))
      }
    ]
  };

  const cartes = service.cartes.map((c) =>
    '<article class="local-card"><h3>' + c[0] + '</h3><p>' + c[1] + '</p></article>').join('');

  const tarifs = service.tarifs.map((t) =>
    '<li><strong>' + t[0] + '</strong> : ' + t[1] + (t[1].indexOf('semaine') !== -1 ? '' : ' DH / mois') + '</li>').join('');

  const faqHtml = faq.map((f) =>
    '<details><summary>' + f[0] + '</summary><p>' + f[1] + '</p></details>').join('');

  const autresServices = SERVICES.filter((s) => s.slug !== service.slug).map((s) =>
    '<a href="' + s.slug + '-' + ville.slug + '.html">' + s.nom + ' à ' + ville.nom + '</a>').join(' · ');

  return '<!doctype html>\n<html lang="fr-MA">\n<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>' + titre + '</title>\n' +
    '  <meta name="description" content="' + description + '">\n' +
    '  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">\n' +
    '  <meta name="theme-color" content="#0d2136">\n' +
    '  <link rel="canonical" href="' + SITE + '/' + fichier + '">\n' +
    '  <link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32.png">\n' +
    '  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon-180.png">\n' +
    '  <meta property="og:type" content="website">\n' +
    '  <meta property="og:site_name" content="Yallah Services">\n' +
    '  <meta property="og:url" content="' + SITE + '/' + fichier + '">\n' +
    '  <meta property="og:title" content="' + service.nom + ' à ' + ville.nom + ' | Yallah Services">\n' +
    '  <meta property="og:description" content="' + description + '">\n' +
    '  <meta property="og:image" content="' + SITE + '/' + service.image + '">\n' +
    '  <meta property="og:locale" content="fr_MA">\n' +
    '  <meta name="twitter:card" content="summary_large_image">\n' +
    '  <meta name="twitter:title" content="' + service.nom + ' à ' + ville.nom + ' | Yallah Services">\n' +
    '  <meta name="twitter:description" content="' + service.nom + ' sélectionnée et accompagnée à ' + ville.nom + ' par Yallah Services.">\n' +
    '  <meta name="twitter:image" content="' + SITE + '/' + service.image + '">\n' +
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">\n' +
    '  <link rel="stylesheet" href="assets/css/style.css">\n' +
    '  <link rel="stylesheet" href="assets/css/brand.css">\n' +
    '  <script type="application/ld+json">\n  ' + JSON.stringify(schema, null, 2) + '\n  </script>\n' +
    '  <style>' + css + '</style>\n' +
    '</head>\n<body class="local-page">\n' +
    '  <nav class="local-nav" aria-label="Navigation principale">\n    <div class="nav-inner local-wrap">\n' +
    '      <a href="index.html" class="logo" aria-label="Yallah Services, accueil"><img src="assets/img/logo-256.png" alt="Yallah Services"></a>\n' +
    '      <div class="nav-links"><a href="index.html#packs">Services</a><a href="index.html#how">Comment ça marche</a><a href="index.html#faq">FAQ</a><a href="index.html#contact">Contact</a></div>\n' +
    '      <a class="nav-wa" href="https://wa.me/' + wa + '" target="_blank" rel="noopener">WhatsApp</a>\n    </div>\n  </nav>\n\n' +
    '  <main>\n    <div class="local-wrap">\n' +
    '      <nav class="local-crumbs" aria-label="Fil d’Ariane"><a href="index.html">Accueil</a> <span aria-hidden="true">›</span> <a href="index.html#packs">Services à domicile</a> <span aria-hidden="true">›</span> ' + service.nom + ' à ' + ville.nom + '</nav>\n' +
    '      <section class="local-hero" aria-labelledby="page-title">\n        <div>\n' +
    '          <span class="local-kicker">Yallah Services · ' + ville.nom + '</span>\n' +
    '          <h1 id="page-title" class="local-title">' + service.nom + ' à <em>' + ville.nom + '</em></h1>\n' +
    '          <p class="local-lead">' + service.lead + '</p>\n' +
    '          <div class="local-actions"><a class="local-btn local-btn-main" href="https://wa.me/' + wa + '" target="_blank" rel="noopener">Demander un profil sur WhatsApp</a><a class="local-btn local-btn-secondary" href="index.html#packs">Voir les packs</a></div>\n' +
    '          <p class="local-note">Réponse sous 24 à 72 h selon les disponibilités · ' + ville.nom + ' et environs · Conditions expliquées avant validation.</p>\n        </div>\n' +
    '        <figure class="local-visual"><img src="' + service.image + '" width="1200" height="800" alt="' + service.nom + ' professionnelle au service d’un foyer à ' + ville.nom + '"><figcaption>' + service.nom + ' à ' + ville.nom + ' : profils sélectionnés, présentés avec leurs références.</figcaption></figure>\n' +
    '      </section>\n    </div>\n\n' +
    '    <section class="local-section"><div class="local-wrap"><h2>' + TITRES_SECTION[service.slug] + '</h2><p class="local-section-intro">Chaque foyer a ses habitudes et ses priorités. Nous clarifions votre besoin avant de présenter un profil : type de logement, tâches, rythme d’intervention et formule souhaitée.</p><div class="local-grid">' + cartes + '</div></div></section>\n\n' +
    '    <section class="local-section"><div class="local-wrap"><h2>Quartiers desservis à ' + ville.nom + '</h2><p class="local-section-intro">' + noteVille(ville) + '</p><div class="local-grid"><article class="local-card"><h3>Ville et environs</h3><ul><li>' + ville.quartiers.join('</li><li>') + '</li></ul></article><article class="local-card"><h3>Formules</h3><p>Logée à votre domicile, ou non logée en journée du lundi au vendredi, 9h–17h.</p></article><article class="local-card"><h3>Mise en relation</h3><p>Profil présenté sur WhatsApp sous 24 à 72 h, rencontre organisée à ' + ville.nom + ' avant toute validation.</p></article></div></div></section>\n\n' +
    '    <section class="local-section"><div class="local-wrap"><h2>Salaires indicatifs à ' + ville.nom + '</h2><p class="local-section-intro">Salaire mensuel versé directement à l’employée par le foyer ; les frais de mise en relation (500 ou 1 000 DH selon la formule) ne sont dus qu’après validation du profil.</p><div class="local-grid"><article class="local-card"><h3>Grille ' + service.nom.toLowerCase() + '</h3><ul>' + tarifs + '</ul></article><article class="local-card"><h3>Ces montants sont des repères</h3><p>Ils s’ajustent selon les conditions réelles du poste : taille du logement, nombre d’enfants, charges confiées.</p></article><article class="local-card"><h3>Rien avant validation</h3><p>Aucun frais n’est demandé avant que vous ayez rencontré et validé le profil présenté.</p></article></div></div></section>\n\n' +
    '    <section class="local-section"><div class="local-wrap"><h2>Comment recevoir un profil à ' + ville.nom + ' ?</h2><p class="local-section-intro">Le parcours est simple, humain et transparent.</p><div class="local-steps"><article class="local-step"><h3>Décrivez votre besoin</h3><p>Écrivez-nous votre quartier, votre logement, les tâches souhaitées et la date de démarrage.</p></article><article class="local-step"><h3>Nous sélectionnons</h3><p>Notre équipe recherche un profil correspondant à votre demande et aux disponibilités du moment.</p></article><article class="local-step"><h3>Vous validez</h3><p>Vous recevez les informations utiles, échangez avec le profil et décidez librement de la suite.</p></article></div></div></section>\n\n' +
    '    <section class="local-section"><div class="local-wrap"><h2>Questions fréquentes</h2><div class="local-faq">' + faqHtml + '</div></div></section>\n\n' +
    '    <section class="local-section local-cta"><div class="local-wrap"><h2>Besoin d’' + service.article + ' à ' + ville.nom + ' ?</h2><p>Parlez-nous de votre maison et recevez une orientation personnalisée par WhatsApp.</p><a class="local-btn local-btn-main" href="https://wa.me/' + wa + '" target="_blank" rel="noopener">Échanger avec Yallah Services</a></div></section>\n  </main>\n\n' +
    '  <footer class="local-footer"><div class="local-wrap"><p>Yallah Services — personnel de maison qualifié, vérifié et accompagné au Maroc. <a href="index.html">Accueil</a> · <a href="candidature.html">Espace candidats</a></p><p>À ' + ville.nom + ' : ' + autresServices + '</p></div></footer>\n' +
    '</body>\n</html>\n';
}

function blocVilles() {
  const groupes = SERVICES.map((s) => {
    const liens = VILLES.map((v) => '<a href="' + s.slug + '-' + v.slug + '.html">' + v.nom + '</a>').join('');
    return '<div class="villes-groupe"><h3>' + s.nom + '</h3><div class="villes-liens">' + liens + '</div></div>';
  }).join('\n      ');
  return DEBUT_BLOC + '\n<section class="sec" id="villes"><div class="ctr">\n' +
    '  <div class="sh c reveal"><span class="se">Couverture</span><h2 class="st">Nos services, ville par ville</h2>' +
    '<p class="sd">Onze villes couvertes au Maroc. Choisissez votre ville pour voir le service, les formules et les tarifs qui s’y appliquent.</p></div>\n' +
    '  <div class="villes-grid">\n      ' + groupes + '\n  </div>\n' +
    '</div></section>\n' + FIN_BLOC;
}

function majIndex() {
  const fichier = path.join(RACINE, 'index.html');
  let html = fs.readFileSync(fichier, 'utf8');
  const bloc = blocVilles();
  const debut = html.indexOf(DEBUT_BLOC);
  if (debut !== -1) {
    const fin = html.indexOf(FIN_BLOC) + FIN_BLOC.length;
    html = html.slice(0, debut) + bloc + html.slice(fin);
  } else {
    const pied = html.indexOf('<footer>');
    if (pied === -1) throw new Error('<footer> introuvable dans index.html');
    html = html.slice(0, pied) + bloc + '\n\n' + html.slice(pied);
  }
  fs.writeFileSync(fichier, html, 'utf8');
}

function majSitemap(pages) {
  const urls = [];
  urls.push(['' , '1.0', 'weekly']);
  urls.push(['candidature.html', '0.7', 'monthly']);
  pages.forEach((p) => urls.push([p, '0.8', 'monthly']));
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) =>
      '  <url>\n    <loc>' + SITE + '/' + u[0] + '</loc>\n    <lastmod>' + AUJOURD_HUI + '</lastmod>\n' +
      '    <changefreq>' + u[2] + '</changefreq>\n    <priority>' + u[1] + '</priority>\n  </url>').join('\n') +
    '\n</urlset>\n';
  fs.writeFileSync(path.join(RACINE, 'sitemap.xml'), xml, 'utf8');
}

function nettoye() {
  if (!fs.existsSync(MANIFESTE)) { console.log('Rien à nettoyer.'); return; }
  const liste = JSON.parse(fs.readFileSync(MANIFESTE, 'utf8'));
  liste.forEach((f) => {
    const cible = path.join(RACINE, f);
    if (fs.existsSync(cible)) fs.unlinkSync(cible);
  });
  fs.unlinkSync(MANIFESTE);
  majSitemap(PAGES_MANUELLES_ARRAY());
  majIndex();
  console.log(liste.length + ' pages générées supprimées.');
}

function PAGES_MANUELLES_ARRAY() { return Array.from(PAGES_MANUELLES); }

if (process.argv.indexOf('--nettoye') !== -1) { nettoye(); process.exit(0); }

const css = styleExtrait();
const generees = [];
let ecrites = 0, conservees = 0;

SERVICES.forEach((service) => {
  VILLES.forEach((ville) => {
    const fichier = service.slug + '-' + ville.slug + '.html';
    if (PAGES_MANUELLES.has(fichier)) { conservees += 1; return; }
    fs.writeFileSync(path.join(RACINE, fichier), pageHtml(service, ville, fichier, css), 'utf8');
    generees.push(fichier);
    ecrites += 1;
  });
});

majIndex();
majSitemap(PAGES_MANUELLES_ARRAY().concat(generees).sort());
fs.writeFileSync(MANIFESTE, JSON.stringify(generees, null, 2), 'utf8');

console.log('Matrice service × ville :');
console.log('  pages générées        : ' + ecrites);
console.log('  pages manuelles gardées : ' + conservees);
console.log('  total pages ville     : ' + (ecrites + conservees));
console.log('  bloc accueil + sitemap mis à jour.');
