#!/usr/bin/env node
/* Contrôle technique SEO statique, sans dépendance.
   Graphe Schema.org vérifié contre le guide de référence du dépôt :
   doc/guide-schema-corrige-yallah-services.pdf.
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
function typesDe(noeud) {
  const type = noeud['@type'];
  return Array.isArray(type) ? type : [type];
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

/* Avis clients : le guide (§5) n'autorise review/aggregateRating qu'avec des
   avis authentiques, attribuables et conservés. Tant que les consentements ne
   sont pas archivés (contenu/valider-avis.md), aucune note structurée n'est
   publiable — c'est aussi la règle interne loi 09-08 du dépôt. */
const SUIVI_AVIS = path.join(RACINE, 'contenu', 'valider-avis.md');
const CONSENTEMENTS_EN_ATTENTE = fs.existsSync(SUIVI_AVIS)
  ? (fs.readFileSync(SUIVI_AVIS, 'utf8').match(/⬜/g) || []).length
  : 0;

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

  /* ── Graphe d'entités (guide de référence :
        doc/guide-schema-corrige-yallah-services.pdf) ──────────────────────
     EmploymentAgency → Service → areaServed, avec une seule organisation
     centrale référencée par @id depuis chaque page. Une page service × ville
     décrit une zone de demande : ni adresse, ni établissement local.        */
  const ORG_ID = BASE + '/#business';
  const WEBSITE_ID = BASE + '/#website';
  const urlPage = canoniqueAttendu(fichier);
  const noeuds = [];
  blocs.forEach((bloc) => parcourir(bloc, (noeud) => {
    if (noeud && typeof noeud === 'object' && noeud['@type']) noeuds.push(noeud);
  }));
  const deType = (type) => noeuds.filter((noeud) => typesDe(noeud).indexOf(type) !== -1);
  const ref = (noeud, cle) => (noeud[cle] && noeud[cle]['@id']) || null;

  /* Une seule entité organisationnelle, déclarée sur l'accueil. */
  const TYPES_ORGANISATION = ['EmploymentAgency', 'Organization', 'LocalBusiness', 'Corporation'];
  const organisations = noeuds.filter((noeud) =>
    typesDe(noeud).some((type) => TYPES_ORGANISATION.indexOf(type) !== -1));
  if (fichier === 'index.html') {
    if (organisations.length !== 1) erreur(fichier + ' : il faut exactement une entité organisationnelle déclarée (' + organisations.length + ' trouvée(s)).');
    else {
      const organisation = organisations[0];
      if (organisation['@id'] !== ORG_ID) erreur(fichier + ' : @id de l’organisation attendu → ' + ORG_ID + ' (trouvé : ' + (organisation['@id'] || 'aucun') + ').');
      /* Informations centralisées exigées par le guide §1. */
      ['name', 'url', 'logo', 'telephone', 'email', 'sameAs', 'areaServed', 'knowsLanguage'].forEach((cle) => {
        if (!organisation[cle] || (Array.isArray(organisation[cle]) && !organisation[cle].length)) {
          erreur(fichier + ' : organisation sans « ' + cle + ' » (information à centraliser selon le guide §1).');
        }
      });
      if (organisation.url !== BASE + '/') erreur(fichier + ' : organisation.url ' + organisation.url + ' ≠ domaine canonique ' + BASE + '/.');
    }
  } else if (organisations.length) {
    erreur(fichier + ' : entité organisationnelle déclarée hors accueil (' + organisations.map((o) => typesDe(o).join('/')).join(', ') + ') → référencer ' + ORG_ID + ' par @id, sans la redéclarer.');
  }

  /* WebPage : la page elle-même, rattachée au site, à l'organisation,
     au service décrit et à son fil d'Ariane. */
  const pagesWeb = deType('WebPage');
  if (!pagesWeb.length) erreur(fichier + ' : nœud WebPage absent du graphe (guide §2).');
  else {
    const pageWeb = pagesWeb[0];
    if (pageWeb['@id'] !== urlPage + '#page') erreur(fichier + ' : WebPage.@id attendu → ' + urlPage + '#page (trouvé : ' + (pageWeb['@id'] || 'aucun') + ').');
    if (pageWeb.url !== urlPage) erreur(fichier + ' : WebPage.url ' + (pageWeb.url || 'absent') + ' ≠ canonical ' + urlPage + '.');
    if (!pageWeb.name) erreur(fichier + ' : WebPage sans name.');
    if (!pageWeb.description) erreur(fichier + ' : WebPage sans description.');
    if (!pageWeb.inLanguage) erreur(fichier + ' : WebPage sans inLanguage.');
    if (ref(pageWeb, 'isPartOf') !== WEBSITE_ID) erreur(fichier + ' : WebPage.isPartOf doit pointer sur ' + WEBSITE_ID + '.');
    if (ref(pageWeb, 'publisher') !== ORG_ID) erreur(fichier + ' : WebPage.publisher doit pointer sur ' + ORG_ID + '.');
    if (deType('BreadcrumbList').length && ref(pageWeb, 'breadcrumb') !== urlPage + '#breadcrumb') {
      erreur(fichier + ' : WebPage.breadcrumb doit pointer sur ' + urlPage + '#breadcrumb.');
    }
    if (deType('Service').length && ref(pageWeb, 'about') !== urlPage + '#service') {
      erreur(fichier + ' : WebPage.about doit pointer sur ' + urlPage + '#service.');
    }
  }

  /* Fil d'Ariane et service : identifiants stables, zone de la demande,
     rattachement à l'organisation centrale. */
  deType('BreadcrumbList').forEach((fil) => {
    if (fil['@id'] !== urlPage + '#breadcrumb') erreur(fichier + ' : BreadcrumbList sans @id ' + urlPage + '#breadcrumb.');
  });
  deType('Service').forEach((service) => {
    if (service['@id'] !== urlPage + '#service') erreur(fichier + ' : Service.@id attendu → ' + urlPage + '#service.');
    if (ref(service, 'provider') !== ORG_ID) erreur(fichier + ' : Service.provider doit référencer ' + ORG_ID + ' (organisation centrale).');
    if (!service.areaServed) erreur(fichier + ' : Service sans areaServed (zone de la demande).');
    else {
      (Array.isArray(service.areaServed) ? service.areaServed : [service.areaServed]).forEach((zone) => {
        if (typesDe(zone).indexOf('City') !== -1 && (!zone.containedInPlace || zone.containedInPlace.name !== 'Maroc')) {
          erreur(fichier + ' : areaServed « ' + (zone.name || '?') + ' » sans containedInPlace (Country : Maroc).');
        }
      });
    }
  });

  /* Ni établissement local inventé, ni note structurée sans consentement. */
  if (fichier !== 'index.html') {
    noeuds.forEach((noeud) => {
      if (noeud.address && typesDe(noeud).indexOf('PostalAddress') === -1) {
        erreur(fichier + ' : adresse publiée sur une page qui n’est pas l’accueil → pas d’établissement local inventé (guide §1-2).');
      }
    });
  }
  if (CONSENTEMENTS_EN_ATTENTE && noeuds.some((noeud) => noeud.aggregateRating || noeud.review)) {
    erreur(fichier + ' : review/aggregateRating publié alors que ' + CONSENTEMENTS_EN_ATTENTE +
      ' consentement(s) d’avis ne sont pas archivés (guide §5 : avis authentiques et conservés uniquement).');
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
