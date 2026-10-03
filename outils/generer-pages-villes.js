#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Générateur des pages « service × zone » et B2B

   Le générateur n'invente rien : il assemble le contenu déjà rédigé,
   page par page, dans contenu/pages/*.json, et refuse de produire une
   page dont les blocs obligatoires sont vides.

       node outils/generer-pages-villes.js
       node outils/generer-pages-villes.js --verifier   (n'écrit rien)

   Contrôles bloquants avant écriture :
     • title ≤ 60 caractères · description 120–165 caractères
     • H1 unique, canonical sur le domaine de site.config.json
     • FAQ et sections non vides, ≥ 2 sections, ≥ 5 questions
     • maillage : au moins 3 liens vers d'autres pages locales
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');
const DOSSIER_CONTENU = path.join(RACINE, 'contenu', 'pages');
const CONFIG = JSON.parse(fs.readFileSync(path.join(RACINE, 'site.config.json'), 'utf8'));
const SITE = String(CONFIG.url).replace(/\/+$/, '');
const WA = 'https://wa.me/212691733585';
const EMAIL = 'servicesyallah@gmail.com';
const VERIFIER_SEULEMENT = process.argv.includes('--verifier');

/* ── Utilitaires ── */
const esc = (t) => {
  /* un champ absent ne doit jamais s'afficher « undefined » dans la page */
  if (t === undefined || t === null) return '';
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
const escAttr = (t) => esc(t).replace(/"/g, '&quot;');
const waLien = (texte) => WA + '?text=' + encodeURIComponent(texte);
const mots = (t) => (String(t).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;

function liste(it, separateur, dernier) {
  if (it.length <= 1) return it.join('');
  return it.slice(0, -1).join(separateur) + dernier + it[it.length - 1];
}

/* ── Rendu ── */
function rendreSections(page) {
  return page.sections.map((s) => {
    const cartes = (s.cartes || []).map((c) => {
      const corps = c.liste
        ? '<ul>' + c.liste.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul>'
        : '<p>' + esc(c.p) + '</p>';
      return '        <article class="local-card">\n' +
        '          <h3>' + esc(c.t) + '</h3>\n          ' + corps + '\n        </article>';
    }).join('\n');
    return '    <section class="local-section"><div class="local-wrap">\n' +
      '      <h2>' + esc(s.titre) + '</h2>\n' +
      (s.intro ? '      <p class="local-section-intro">' + esc(s.intro) + '</p>\n' : '') +
      (cartes ? '      <div class="local-grid">\n' + cartes + '\n      </div>\n' : '') +
      '    </div></section>';
  }).join('\n\n');
}

function rendreZones(page) {
  const z = page.zones;
  if (!z || !z.liste || !z.liste.length) return '';
  return '    <section class="local-section"><div class="local-wrap">\n' +
    '      <h2>' + esc(z.titre) + '</h2>\n' +
    (z.intro ? '      <p class="local-section-intro">' + esc(z.intro) + '</p>\n' : '') +
    '      <ul class="local-zones">\n' +
    z.liste.map((n) => '        <li>' + esc(n) + '</li>').join('\n') + '\n      </ul>\n' +
    (z.note ? '      <p class="local-disclaimer">' + esc(z.note) + '</p>\n' : '') +
    '    </div></section>';
}

function rendreTarifs(page) {
  const t = page.tarifs;
  if (!t || !t.lignes || !t.lignes.length) return '';
  const tb = '    <section class="local-section"><div class="local-wrap">\n' +
    '      <h2>' + esc(t.titre) + '</h2>\n' +
    (t.intro ? '      <p class="local-section-intro">' + esc(t.intro) + '</p>\n' : '') +
    '      <div class="local-tarifs">\n        <table>\n' +
    '          <caption>' + esc(t.legende || t.titre) + '</caption>\n' +
    '          <thead><tr><th>Prestation</th><th>Repère mensuel</th></tr></thead>\n' +
    '          <tbody>\n' +
    t.lignes.map((l) => '            <tr><td>' + esc(l[0]) + '</td><td>' + esc(l[1]) + '</td></tr>').join('\n') + '\n' +
    '          </tbody>\n          <tfoot><tr><td colspan="2">' + esc(t.note) + '</td></tr></tfoot>\n' +
    '        </table>\n      </div>\n    </div></section>';
  return tb;
}

function rendreEtapes(page) {
  if (!page.etapes || !page.etapes.length) return '';
  return '    <section class="local-section"><div class="local-wrap">\n' +
    '      <h2>' + esc(page.titreEtapes || 'Comment ça se passe') + '</h2>\n' +
    (page.introEtapes ? '      <p class="local-section-intro">' + esc(page.introEtapes) + '</p>\n' : '') +
    '      <div class="local-steps">\n' +
    page.etapes.map((e) => '        <article class="local-step"><h3>' + esc(e.t) + '</h3><p>' + esc(e.p) + '</p></article>').join('\n') +
    '\n      </div>\n    </div></section>';
}

function rendreMissions(page) {
  if (!page.missions || !page.missions.length) return '';
  return '    <section class="local-section"><div class="local-wrap">\n' +
    '      <h2>Missions réalisées</h2>\n' +
    '      <p class="local-section-intro">Quelques familles accompagnées, avec leur accord. ' +
    'Nous ne publions ni citation inventée, ni note que la cliente n\'a pas donnée.</p>\n' +
    '      <div class="local-mission">\n' +
    page.missions.map((m) => '        <article class="local-mission-card">\n' +
      '          <div class="local-mission-head"><div><div class="local-mission-name">' + esc(m.nom) + '</div>' +
      '<div class="local-mission-place">' + esc(m.lieu) + '</div></div>' +
      '<span class="local-badge">✔ Mission réalisée</span></div>\n' +
      '          <p>' + esc(m.texte) + '</p>\n        </article>').join('\n') +
    '\n      </div>\n    </div></section>';
}

function rendreFaq(page) {
  if (!page.faq || !page.faq.length) return '';
  return '    <section class="local-section"><div class="local-wrap">\n' +
    '      <h2>Questions fréquentes</h2>\n      <div class="local-faq">\n' +
    page.faq.map((f) => '        <details><summary>' + esc(f.q) + '</summary><p>' + esc(f.r) + '</p></details>').join('\n') +
    '\n      </div>\n    </div></section>';
}

function rendreMaillage(page) {
  const liens = (page.liens || []).map((l) =>
    '        <a class="local-link-card" href="' + escAttr(l.fichier) + '"><strong>' + esc(l.titre) + '</strong><span>' + esc(l.texte) + '</span></a>'
  ).join('\n');
  return '    <section class="local-section"><div class="local-wrap">\n' +
    '      <h2>' + esc(page.titreLiens || 'À voir aussi') + '</h2>\n' +
    (page.introLiens ? '      <p class="local-section-intro">' + esc(page.introLiens) + '</p>\n' : '') +
    '      <div class="local-links">\n' + liens + '\n      </div>\n    </div></section>';
}

function rendreSchema(page) {
  const url = SITE + '/' + page.fichier;
  const fil = [
    { name: 'Accueil', item: SITE + '/' },
    { name: 'Services par ville', item: SITE + '/services-par-ville.html' },
    { name: page.h1Texte, item: url }
  ];
  const graphe = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': url + '#service',
        name: page.h1Texte,
        serviceType: page.serviceType,
        description: page.description,
        provider: { '@id': SITE + '/#business' },
        areaServed: { '@type': 'City', name: page.ville },
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: url,
          servicePhone: { '@type': 'ContactPoint', telephone: '+212691733585', contactType: 'customer service', availableLanguage: ['French', 'Arabic'] }
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: fil.map((f, i) => ({ '@type': 'ListItem', position: i + 1, name: f.name, item: f.item }))
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((f) => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.r }
        }))
      }
    ]
  };
  return '  <script type="application/ld+json">\n' + JSON.stringify(graphe, null, 2) + '\n  </script>';
}

function rendrePage(page) {
  const titre = esc(page.title);
  const waHero = waLien(page.messageWhatsApp || ('Bonjour Yallah Services, je cherche : ' + page.h1Texte + '.'));
  const waCta = waLien(page.messageWhatsAppCta || page.messageWhatsApp || ('Bonjour Yallah Services, je souhaite un renseignement : ' + page.h1Texte + '.'));
  const villes = CONFIG.villes.map((v) => v.nom).join(' · ');

  return `<!doctype html>
<html lang="fr-MA">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titre}</title>
  <meta name="description" content="${escAttr(page.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <meta name="theme-color" content="#0d2136">
  <link rel="canonical" href="${SITE}/${page.fichier}">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32.png">
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon-180.png">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Yallah Services">
  <meta property="og:url" content="${SITE}/${page.fichier}">
  <meta property="og:title" content="${titre}">
  <meta property="og:description" content="${escAttr(page.ogDescription || page.description)}">
  <meta property="og:image" content="${SITE}/${page.image}">
  <meta property="og:image:alt" content="${escAttr(page.imageAlt)}">
  <meta property="og:locale" content="fr_MA">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${titre}">
  <meta name="twitter:description" content="${escAttr(page.ogDescription || page.description)}">
  <meta name="twitter:image" content="${SITE}/${page.image}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/brand.css">
  <link rel="stylesheet" href="assets/css/local.css">
  <link rel="stylesheet" href="assets/css/i18n.css">
  <!-- Multilingue : français · darija (arabe et latin) · anglais -->
  <script src="assets/js/i18n.js"></script>

${rendreSchema(page)}
</head>
<body class="local-page">
  <nav class="local-nav" aria-label="Navigation principale">
    <div class="nav-inner local-wrap">
      <a href="index.html" class="logo" aria-label="Yallah Services, accueil"><img src="assets/img/logo-256.png" alt="Yallah Services"></a>
      <div class="nav-links"><a href="services-par-ville.html">Services par ville</a><a href="personnel-entreprises.html">Entreprises</a><a href="index.html#packs">Packs &amp; tarifs</a><a href="candidature.html">Espace candidats</a></div>
      <a class="nav-wa" href="${waHero}" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </nav>

  <main>
    <div class="local-wrap">
      <nav class="local-crumbs" aria-label="Fil d’Ariane"><a href="index.html">Accueil</a> <span aria-hidden="true">›</span> <a href="services-par-ville.html">Services par ville</a> <span aria-hidden="true">›</span> ${esc(page.crumb || page.h1Texte)}</nav>
      <section class="local-hero" aria-labelledby="page-title">
        <div>
          <span class="local-kicker">${esc(page.kicker)}</span>
          <h1 id="page-title" class="local-title">${page.h1}</h1>
          <p class="local-lead">${esc(page.lead)}</p>
          <div class="local-actions"><a class="local-btn local-btn-main" href="${waHero}" target="_blank" rel="noopener" data-src="${page.fichier}">${esc(page.ctaPrincipal || 'Demander un profil sur WhatsApp')}</a><a class="local-btn local-btn-secondary" href="index.html#packs">Voir les packs</a></div>
          <p class="local-note">${esc(page.noteHero)}</p>
        </div>
        <figure class="local-visual"><img src="${page.image}" width="1200" height="800" alt="${escAttr(page.imageAlt)}"><figcaption>${esc(page.legendeImage)}</figcaption></figure>
      </section>
    </div>

${rendreSections(page)}

${rendreZones(page)}

${rendreTarifs(page)}

${rendreEtapes(page)}

${rendreMissions(page)}

${rendreFaq(page)}

${rendreMaillage(page)}

    <section class="local-section local-cta"><div class="local-wrap">
      <h2>${esc(page.titreCta)}</h2>
      <p>${esc(page.texteCta)}</p>
      <a class="local-btn local-btn-main" href="${waCta}" target="_blank" rel="noopener" data-src="${page.fichier}">${esc(page.ctaSecondaire || 'Échanger avec Yallah Services')}</a>
    </div></section>
  </main>

  <footer class="local-footer"><div class="local-wrap">
    <p><strong>Yallah Services</strong> — Recherche et mise en relation de personnel pour les particuliers et les entreprises au Maroc. Base : Casablanca, Hay Hassani 20220.</p>
    <p><a href="index.html">Accueil</a> · <a href="services-par-ville.html">Services par ville</a> · <a href="personnel-entreprises.html">Entreprises</a> · <a href="candidature.html">Espace candidats</a> · <a href="mailto:${EMAIL}">${EMAIL}</a> · <a href="${WA}">+212 691 733 585</a></p>
    <p>Suivez-nous : <a href="https://web.facebook.com/yallahservicesmaroc" target="_blank" rel="noopener noreferrer">Facebook</a> · <a href="https://www.instagram.com/yallahservice/" target="_blank" rel="noopener noreferrer">Instagram</a> · <a href="https://www.tiktok.com/@yallah.services.m" target="_blank" rel="noopener noreferrer">TikTok</a> · <a href="https://www.linkedin.com/in/yallah-services/" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
    <p>${villes}</p>
  </div></footer>
</body>
</html>
`;
}

/* ── Contrôles bloquants ── */
function controler(page) {
  const problemes = [];
  const p = (m) => problemes.push(m);
  if (!page.fichier || !/^[a-z0-9-]+\.html$/.test(page.fichier)) p('nom de fichier invalide');
  if (!page.title || page.title.length > 60) p('title absent ou > 60 caractères (' + (page.title || '').length + ')');
  if (!page.description || page.description.length < 120 || page.description.length > 165) {
    p('description hors 120–165 caractères (' + (page.description || '').length + ')');
  }
  if (!page.h1 || !/<em>/.test(page.h1)) p('h1 manquant ou sans accent <em> sur la zone');
  if ((page.h1.match(/<h1/g) || []).length > 1) p('plusieurs h1');
  if (!page.lead || page.lead.length < 80) p('accroche trop courte');
  if (!page.sections || page.sections.length < 3) p('moins de 3 sections rédigées');
  if (!page.faq || page.faq.length < 5) p('moins de 5 questions/réponses');
  if (!page.etapes || page.etapes.length < 3) p('moins de 3 étapes');
  if (!page.zones || !page.zones.liste || page.zones.liste.length < 5) p('moins de 5 zones listées');
  if (!page.liens || page.liens.length < 3) p('moins de 3 liens de maillage');
  if (!page.image || !fs.existsSync(path.join(RACINE, page.image))) p('image absente : ' + page.image);
  const total = mots(JSON.stringify(page.sections)) + mots(JSON.stringify(page.faq)) +
    mots(page.lead) + mots(JSON.stringify(page.etapes)) + mots(page.noteHero || '');
  if (total < 750) p('volume rédigé insuffisant (~' + total + ' mots, viser 900+)');
  return { problemes, total };
}

/* ── Exécution ── */
if (!fs.existsSync(DOSSIER_CONTENU)) {
  console.error('Dossier de contenu introuvable : contenu/pages/');
  process.exit(1);
}
const fichiers = fs.readdirSync(DOSSIER_CONTENU).filter((f) => f.endsWith('.json')).sort();
let bloquant = 0;
let ecrites = 0;

console.log('Génération de ' + fichiers.length + ' page(s) depuis contenu/pages/ …\n');
fichiers.forEach((f) => {
  const page = JSON.parse(fs.readFileSync(path.join(DOSSIER_CONTENU, f), 'utf8'));
  const { problemes, total } = controler(page);
  if (problemes.length) {
    bloquant += 1;
    console.log('  ❌ ' + f);
    problemes.forEach((m) => console.log('       · ' + m));
    return;
  }
  if (VERIFIER_SEULEMENT) {
    console.log('  ✅ ' + page.fichier.padEnd(34) + '~' + total + ' mots (non écrit)');
    return;
  }
  fs.writeFileSync(path.join(RACINE, page.fichier), rendrePage(page), 'utf8');
  ecrites += 1;
  console.log('  ✅ ' + page.fichier.padEnd(34) + '~' + total + ' mots rédigés');
});

console.log('\n' + (bloquant ? '❌ ' + bloquant + ' page(s) refusée(s) — rien n\'a été publié pour celles-ci.' :
  (VERIFIER_SEULEMENT ? '✅ Toutes les fiches sont valides.' : '✅ ' + ecrites + ' page(s) générée(s).')));
process.exit(bloquant ? 1 : 0);
