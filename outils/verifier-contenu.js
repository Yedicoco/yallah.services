#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Contrôle du contenu SEO des pages locales

   À lancer AVANT de publier une nouvelle page « service × ville »,
   et après chaque réécriture :

       node outils/verifier-contenu.js
       node outils/verifier-contenu.js --mots 700 --dup 45

   Ce que l'outil empêche (règle non négociable du plan SEO local) :
     ❌  deux pages dont le texte est identique à X % près
         (gabarit copié-collé avec seulement le nom de ville changé)
     ❌  une page trop courte pour être utile (contenu de remplissage)
     ❌  deux <title> ou deux <meta description> identiques
     ❌  une FAQ déclarée en Schema.org qui ne figure pas dans la page
     ❌  une page locale sans maillage interne vers ses voisines
     ❌  une ville retirée du périmètre (site.config.json) encore publiée,
         une promesse de délai, une garantie ou un critère d'origine
     ❌  une URL absolue publiée sur un autre hébergement que le domaine
         de site.config.json

   Ce qu'il signale (⚠️) sans bloquer :
       title > 60 caractères, description hors 120–165, H1 manquant
       ou multiple, canonical absent ou sur un autre domaine,
       données structurées absentes, maillage trop faible, LCP/texte.

   Options :
       --mots <n>     nombre de mots minimum par page locale (défaut 600)
       --dup <pct>    taux de recopie toléré entre deux pages (défaut 40)
       --details      affiche la matrice complète des similarités

   Codes de sortie : 0 = tout est bon, 1 = au moins une erreur bloquante.
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');

/* ── Réglages ── */
function argument(nom, defaut) {
  const index = process.argv.indexOf(nom);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : defaut;
}
const MOTS_MIN = Number(argument('--mots', 600));
const DUP_MAX = Number(argument('--dup', 40));
const DETAILS = process.argv.includes('--details');

/* Pages qui ne participent pas au contrôle éditorial :
   - admin.html ................ espace recruteur (hors index)
   - candidature-confirmation.html  page de confirmation (noindex)
   - plan-placement-du-formulaire.html  page de revue interne
   - google*.html ............. fichier de vérification Search Console */
const PAGES_IGNOREES = new Set([
  'admin.html',
  'candidature-confirmation.html',
  'plan-placement-du-formulaire.html'
]);

/* ── Référentiel services / villes ── */
const CONFIG = JSON.parse(fs.readFileSync(path.join(RACINE, 'site.config.json'), 'utf8'));

const SERVICES = [
  { slug: 'femme-menage', libelle: 'Femme de ménage', alias: ['femme-menage', 'femme-de-menage', 'menage', 'aide-menagere'] },
  { slug: 'nounou', libelle: 'Nounou', alias: ['nounou', 'nourrice', 'garde-enfants'] },
  { slug: 'cuisiniere', libelle: 'Cuisinière', alias: ['cuisiniere', 'cuisine', 'aide-cuisine', 'cuisiniere-a-domicile'] },
  { slug: 'chauffeur', libelle: 'Chauffeur', alias: ['chauffeur', 'chauffeur-prive'] },
  { slug: 'vigile', libelle: 'Vigile / gardien', alias: ['vigile', 'gardien', 'gardiennage', 'agent-de-securite'] },
  { slug: 'garde-malade', libelle: 'Garde-malade', alias: ['garde-malade', 'garde-malade-a-domicile'] }
];

/* Zones servies : lues dans site.config.json (source unique de vérité) */
const VILLES = CONFIG.villes
  .filter((v) => v.statut !== 'candidate')
  .map((v) => v.slug);

/* ── Compteurs ── */
let erreurs = 0;
let avertissements = 0;
function erreur(m) { erreurs += 1; console.log('  ❌ ' + m); }
function avertir(m) { avertissements += 1; console.log('  ⚠️  ' + m); }
function ok(m) { console.log('  ✅ ' + m); }
function section(t) { console.log('\n' + t); }

function lire(chemin) { return fs.readFileSync(path.join(RACINE, chemin), 'utf8'); }
function normaliser(texte) {
  return String(texte).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function normaliserComparaison(texte) {
  return normaliser(String(texte)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&apos;|&#0*39;|&#x0*27;|&#8217;|&rsquo;/gi, "'")
    .replace(/<[^>]+>/g, ' '))
    .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ── Inventaire des pages HTML publiques ── */
function listerPages() {
  return fs.readdirSync(RACINE)
    .filter((f) => f.endsWith('.html'))
    .filter((f) => !PAGES_IGNOREES.has(f))
    .filter((f) => !/^google.*\.html$/i.test(f))
    .filter((f) => !f.startsWith('apercus'))
    .sort();
}

/* ── Extraction du texte visible ── */
function htmlVersTexte(html, sansNavigation) {
  let contenu = html;
  contenu = contenu.replace(/<!--[\s\S]*?-->/g, ' ');
  contenu = contenu.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  contenu = contenu.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  contenu = contenu.replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
  contenu = contenu.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  if (sansNavigation) {
    contenu = contenu.replace(/<nav[\s\S]*?<\/nav>/gi, ' ');
    contenu = contenu.replace(/<footer[\s\S]*?<\/footer>/gi, ' ');
    contenu = contenu.replace(/<header[\s\S]*?<\/header>/gi, ' ');
  }
  contenu = contenu.replace(/<[^>]+>/g, ' ');
  contenu = contenu
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
    .replace(/&#8217;|&rsquo;|&apos;/g, "'").replace(/&quot;/g, '"');
  return contenu.replace(/\s+/g, ' ').trim();
}

function compterMots(texte) {
  const mots = texte.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return mots ? mots.length : 0;
}

/* ── Empreintes de 8 mots (les 8-grammes détectent le copié-collé) ── */
const TAILLE_EMPREINTE = 8;
function empreintes(texte) {
  const mots = (texte.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).map((m) => m.toLowerCase());
  const ensemble = new Set();
  for (let i = 0; i + TAILLE_EMPREINTE <= mots.length; i += 1) {
    ensemble.add(mots.slice(i, i + TAILLE_EMPREINTE).join(' '));
  }
  return ensemble;
}
function inter(a, b) {
  let n = 0;
  a.forEach((v) => { if (b.has(v)) n += 1; });
  return n;
}

/* Recopie : part du texte de la plus petite page présente dans l'autre.
   C'est la mesure la plus parlante : « 87 % de cette page est déjà
   publiée mot pour mot ailleurs sur le site ». */
function recopie(a, b) {
  if (a.empreintes.size === 0 || b.empreintes.size === 0) return 0;
  const commun = inter(a.empreintes, b.empreintes);
  return Math.round((commun / Math.min(a.empreintes.size, b.empreintes.size)) * 100);
}

/* ── Analyse d'une page ── */
function analyser(fichier) {
  const html = lire(fichier);
  const texteComplet = htmlVersTexte(html, false);
  const textePrincipal = htmlVersTexte(html, true);
  const base = fichier.replace(/\.html$/, '');

  /* Rattachement service / ville à partir du nom de fichier */
  let service = null;
  let ville = null;
  const morceaux = base.split('-');
  if (VILLES.includes(morceaux[morceaux.length - 1])) {
    ville = morceaux[morceaux.length - 1];
    const prefixe = morceaux.slice(0, -1).join('-');
    service = SERVICES.find((s) => s.alias.includes(prefixe)) || null;
  }

  const titre = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [null, ''])[1].trim();
  const description = (html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || [null, ''])[1].trim();
  const canonical = (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || [null, ''])[1].trim();
  const h1s = (html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || []).map((b) => htmlVersTexte(b, false));
  const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html);

  /* Données structurées */
  const blocs = [];
  const motifLd = /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let trouve;
  while ((trouve = motifLd.exec(html)) !== null) {
    try {
      blocs.push({ json: JSON.parse(trouve[1]), brut: trouve[1] });
    } catch (e) {
      blocs.push({ json: null, erreur: e.message, brut: trouve[1] });
    }
  }
  const types = [];
  const questions = [];
  const reponses = [];
  (function parcourir(noeud) {
    if (Array.isArray(noeud)) return noeud.forEach(parcourir);
    if (!noeud || typeof noeud !== 'object') return;
    if (noeud['@type']) types.push(String(noeud['@type']));
    if (noeud['@type'] === 'Question' && noeud.name) questions.push(String(noeud.name));
    if (noeud['@type'] === 'Answer' && noeud.text) reponses.push(String(noeud.text));
    Object.keys(noeud).forEach((cle) => parcourir(noeud[cle]));
  })(blocs.map((b) => b.json).filter(Boolean));

  /* Maillage interne vers d'autres pages locales */
  const liens = (html.match(/href="([^"]+\.html[^"]*)"/gi) || [])
    .map((l) => l.replace(/href="/i, '').replace(/"$/, '').split('#')[0].split('?')[0])
    .filter((l) => l && l !== fichier);

  return {
    fichier, service, ville, html,
    texteComplet, textePrincipal,
    mots: compterMots(textePrincipal),
    motsPage: compterMots(texteComplet),
    titre, description, canonical, h1s, noindex,
    blocs, types, questions, reponses,
    liensLocaux: Array.from(new Set(liens)).filter((l) => {
      const m = l.replace(/\.html$/, '').split('-');
      return VILLES.includes(m[m.length - 1]);
    }),
    empreintes: empreintes(textePrincipal)
  };
}

/* ── Analyse de toutes les pages ── */
const pages = listerPages().map(analyser);
const locales = pages.filter((p) => p.service && p.ville);
const localesIndexables = locales.filter((p) => !p.noindex);
const localesNoindex = locales.filter((p) => p.noindex);
const domaine = (() => {
  const url = (pages.find((p) => p.canonical) || {}).canonical || '';
  try { return new URL(url).origin; } catch (e) { return ''; }
})();

console.log('CONTENU SEO — ' + pages.length + ' page(s) analysée(s), dont ' +
  localesIndexables.length + ' page(s) service × ville indexable(s)' +
  (localesNoindex.length ? ' · ' + localesNoindex.length + ' page(s) locale(s) en noindex (hors contrôles de publication)' : ''));
console.log('Seuils : ' + MOTS_MIN + ' mots minimum · ' + DUP_MAX + '% de recopie maximum');

/* ═══ 1. Volume de contenu ═══ */
section('1. Volume de contenu (texte principal, hors navigation et pied de page)');
if (localesIndexables.length === 0) avertir('Aucune page indexable « service × ville » détectée.');
localesNoindex.forEach((p) => {
  console.log('  ℹ️  ' + p.fichier + ' : noindex, donc hors sitemap et hors seuils éditoriaux jusqu\'à validation du contenu local.');
});
localesIndexables.forEach((p) => {
  const nom = p.fichier.padEnd(34);
  const service = p.service ? p.service.libelle : 'service non reconnu';
  const ville = p.ville ? p.ville[0].toUpperCase() + p.ville.slice(1) : 'ville non reconnue';
  if (p.mots < MOTS_MIN) {
    erreur(nom + p.mots + ' mots — insuffisant (' + service + ' · ' + ville + ')');
  } else if (p.mots < MOTS_MIN * 1.25) {
    avertir(nom + p.mots + ' mots — juste au-dessus du minimum');
  } else {
    ok(nom + p.mots + ' mots (' + service + ' · ' + ville + ')');
  }
});

/* ═══ 2. Recopie entre pages locales ═══ */
section('2. Recopie entre pages service × ville — seuil ' + DUP_MAX + ' %');
if (localesIndexables.length < 2) {
  avertir('Au moins deux pages locales indexables sont nécessaires pour mesurer la recopie.');
} else {
  const paires = [];
  for (let i = 0; i < localesIndexables.length; i += 1) {
    for (let j = i + 1; j < localesIndexables.length; j += 1) {
      const taux = recopie(localesIndexables[i], localesIndexables[j]);
      const memeservice = localesIndexables[i].service && localesIndexables[j].service &&
        localesIndexables[i].service.slug === localesIndexables[j].service.slug;
      paires.push({ a: localesIndexables[i], b: localesIndexables[j], taux, memeservice });
    }
  }
  paires.sort((x, y) => y.taux - x.taux);
  const bloquantes = paires.filter((p) => p.taux >= DUP_MAX);
  const lourdes = bloquantes.filter((p) => p.memeservice);
  bloquantes.forEach((p) => {
    erreur('« ' + p.a.fichier + ' » ↔ « ' + p.b.fichier + ' » : ' + p.taux +
      ' % du texte de la plus courte est déjà publié dans l\'autre' +
      (p.memeservice ? '  ⬅ même service, seul le nom de ville change' : ''));
  });
  paires.filter((p) => p.taux >= DUP_MAX / 2 && p.taux < DUP_MAX).forEach((p) => {
    avertir('« ' + p.a.fichier + ' » ↔ « ' + p.b.fichier + ' » : ' + p.taux + ' % de recopie');
  });
  if (bloquantes.length === 0) ok('Aucun couple de pages indexables au-dessus du seuil de recopie.');
  if (lourdes.length) {
    console.log('     → Même service, plusieurs villes : c\'est le motif « porte d\'entrée » (doorway)\n' +
      '       que Google sanctionne. Chaque page doit être écrite à partir d\'informations\n' +
      '       locales propres (quartiers réels, questions reçues sur WhatsApp, faits vérifiés).');
  }
  if (DETAILS) {
    console.log('\n  Matrice complète (% du texte de la plus courte présent dans l\'autre) :');
    localesIndexables.forEach((a) => {
      const ligne = localesIndexables.map((b) => (a === b ? '  —' : String(recopie(a, b)).padStart(3) + ' %')).join(' | ');
      console.log('    ' + a.fichier.padEnd(32) + ligne);
    });
  }
}

/* ═══ 3. Balises SEO ═══ */
section('3. Balises (title, description, H1, canonical)');
const titres = new Map();
const descriptions = new Map();
pages.forEach((p) => {
  if (p.noindex) return;
  if (!p.titre) erreur(p.fichier + ' : <title> manquant.');
  if (p.titre.length > 60) avertir(p.fichier + ' : title de ' + p.titre.length + ' caractères (> 60)');
  if (!p.description) {
    erreur(p.fichier + ' : meta description manquante.');
  } else if (p.description.length < 120 || p.description.length > 165) {
    avertir(p.fichier + ' : description de ' + p.description.length + ' caractères (viser 120–165)');
  }
  if (p.h1s.length === 0) erreur(p.fichier + ' : aucun H1.');
  if (p.h1s.length > 1) avertir(p.fichier + ' : ' + p.h1s.length + ' H1 (un seul attendu).');
  if (!p.canonical) {
    erreur(p.fichier + ' : <link rel="canonical"> manquant.');
  } else if (domaine && p.canonical.indexOf(domaine) !== 0) {
    erreur(p.fichier + ' : canonical hors du domaine principal (' + p.canonical + ')');
  }
  if (p.titre) {
    if (titres.has(p.titre)) erreur(p.fichier + ' : <title> identique à ' + titres.get(p.titre));
    else titres.set(p.titre, p.fichier);
  }
  if (p.description) {
    if (descriptions.has(p.description)) erreur(p.fichier + ' : description identique à ' + descriptions.get(p.description));
    else descriptions.set(p.description, p.fichier);
  }
});
if (erreurs === 0) ok('Titles, descriptions, H1 et canonical cohérents.');
if (domaine) console.log('  Domaine de référence : ' + domaine);

/* ═══ 4. Données structurées ═══ */
section('4. Données structurées (Schema.org)');
pages.forEach((p) => {
  if (p.noindex) return;
  if (p.blocs.length === 0) { avertir(p.fichier + ' : aucun bloc application/ld+json.'); return; }
  p.blocs.forEach((bloc, i) => {
    if (!bloc.json) erreur(p.fichier + ' : bloc ld+json n°' + (i + 1) + ' invalide (' + bloc.erreur + ')');
  });
  const types = Array.from(new Set(p.types));
  console.log('  ' + p.fichier.padEnd(34) + (types.length ? types.join(', ') : 'aucun @type'));
  if (p.service && p.ville) {
    if (types.indexOf('Service') === -1) avertir(p.fichier + ' : pas de « Service » déclaré pour une page service × ville.');
    if (types.indexOf('BreadcrumbList') === -1) avertir(p.fichier + ' : pas de fil d\'Ariane structuré.');
    if (types.indexOf('FAQPage') === -1) avertir(p.fichier + ' : pas de FAQPage.');
  }
  const texteVisibleSchema = normaliserComparaison(p.texteComplet);
  p.questions.forEach((q) => {
    const recherche = normaliserComparaison(q);
    if (recherche && texteVisibleSchema.indexOf(recherche) === -1) {
      erreur(p.fichier + ' : question déclarée en Schema.org mais absente du texte visible → « ' + q + ' »');
    }
  });
  p.reponses.forEach((reponse) => {
    const recherche = normaliserComparaison(reponse);
    if (recherche && texteVisibleSchema.indexOf(recherche) === -1) {
      erreur(p.fichier + ' : réponse déclarée en Schema.org mais absente ou différente du texte visible → « ' + reponse.slice(0, 120) + (reponse.length > 120 ? '…' : '') + ' »');
    }
  });
});

/* ═══ 5. Maillage interne ═══ */
section('5. Maillage interne des pages locales');
localesIndexables.forEach((p) => {
  const liens = localesIndexables.filter((autre) => autre !== p && p.liensLocaux.indexOf(autre.fichier) !== -1);
  if (liens.length === 0) {
    erreur(p.fichier + ' : aucun lien vers une autre page locale (hub ou page voisine).');
  } else if (liens.length < 3) {
    avertir(p.fichier + ' : ' + liens.length + ' lien(s) seulement vers des pages locales (viser 4–6).');
  } else {
    ok(p.fichier + ' : ' + liens.length + ' liens locaux.');
  }
});

/* ═══ 6. Contenus inachevés ═══ */
section('6. Contenus inachevés (rien de brouillon ne doit être publié)');
const MARQUEURS = [
  [/\[\[AVIS EN ATTENTE DE VALIDATION[^\]]*\]\]/g, 'avis en attente de validation cliente'],
  [/\[\[(?!AVIS EN ATTENTE)[^\]]{3,}\]\]/g, 'emplacement à compléter'],
  [/\bTODO\b|\bFIXME\b/g, 'marqueur de travail'],
  [/à compl[ée]ter/gi, 'contenu annoncé comme à compléter'],
  [/lorem ipsum/i, 'texte de remplissage']
];
let brouillons = 0;
pages.forEach((p) => {
  MARQUEURS.forEach(([motif, libelle]) => {
    const trouves = p.html.match(motif);
    if (trouves) {
      brouillons += 1;
      erreur(p.fichier + ' : ' + libelle + ' → ' + trouves.slice(0, 3).join(' · '));
    }
  });
});
if (!brouillons) ok('Aucun contenu inachevé détecté.');

/* ═══ 7. Affirmations commerciales et géographiques ═══
   Référentiel : site.config.json (zones confirmées, villes retirées) et
   contenu/fiche-entreprise.md § « Informations à ne jamais inventer ».
   Ce contrôle rend automatique l'audit manuel de contenu/audit-promesses-site.md :
   une ville retirée, une promesse de délai, une garantie ou un critère d'origine
   qui revient dans une page bloque la publication.                        ═══ */
section('7. Affirmations commerciales et géographiques (référentiel : site.config.json)');
{
  /* Surfaces publiées : pages HTML, fichiers lus par les moteurs et les
     assistants, page de confirmation (noindex mais publique) et dictionnaires
     de traduction (ils contiennent le texte français source). */
  const surfaces = pages.map((p) => ({ fichier: p.fichier, texte: p.html }));
  ['candidature-confirmation.html', 'llms.txt', 'robots.txt', 'sitemap.xml',
   'video-sitemap.xml', 'seo-pack/llms.txt'].forEach((fichier) => {
    if (fs.existsSync(path.join(RACINE, fichier))) surfaces.push({ fichier, texte: lire(fichier) });
  });
  const DOSSIER_I18N = path.join('assets', 'i18n');
  if (fs.existsSync(path.join(RACINE, DOSSIER_I18N))) {
    fs.readdirSync(path.join(RACINE, DOSSIER_I18N)).forEach((langue) => {
      const dossierLangue = path.join(RACINE, DOSSIER_I18N, langue);
      if (!fs.statSync(dossierLangue).isDirectory()) return;
      fs.readdirSync(dossierLangue).filter((f) => f.endsWith('.js')).forEach((f) => {
        const relatif = path.join(DOSSIER_I18N, langue, f);
        surfaces.push({ fichier: relatif, texte: lire(relatif) });
      });
    });
  }

  /* 7.1 — Villes retirées du périmètre : aucune ne doit réapparaître. */
  const retirees = CONFIG.villesRetirees || [];
  let retourRetirees = 0;
  surfaces.forEach((s) => {
    const texte = normaliser(s.texte);
    retirees.forEach((ville) => {
      if (texte.indexOf(normaliser(ville)) !== -1) {
        retourRetirees += 1;
        erreur(s.fichier + ' : ville retirée du périmètre encore publiée → « ' + ville + ' »');
      }
    });
  });
  if (!retourRetirees) ok('Aucune ville retirée (' + retirees.join(', ') + ') sur les ' +
    surfaces.length + ' surfaces publiées.');

  /* 7.2 — Listes de villes des formulaires : uniquement des zones confirmées
           (« candidate » n'est pas affichée comme desservie). */
  const villesPubliables = CONFIG.villes
    .filter((v) => v.statut !== 'candidate')
    .map((v) => normaliser(v.nom));
  villesPubliables.push(normaliser('Autre ville'));
  let horsPerimetre = 0;
  let listesVilles = 0;
  pages.forEach((p) => {
    const motif = /<select[^>]*>[\s\S]*?<\/select>/g;
    let select;
    while ((select = motif.exec(p.html)) !== null) {
      const entete = select[0].slice(0, select[0].indexOf('>') + 1);
      const options = select[0].match(/<option\b[^>]*>[\s\S]*?<\/option>/g) || [];
      if (options.length < 2) continue;
      const premiere = normaliser(options[0].replace(/<[^>]+>/g, ' '));
      if (!/city|ville/i.test(entete) && premiere.indexOf('ville') === -1) continue;
      listesVilles += 1;
      options.slice(1).forEach((option) => {
        if (/value\s*=\s*""/i.test(option)) return;   /* saisie libre (« Autre ville ») */
        const texte = normaliser(option.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        if (texte && villesPubliables.indexOf(texte) === -1) {
          horsPerimetre += 1;
          erreur(p.fichier + ' : ville proposée dans un formulaire hors du périmètre confirmé → « ' + texte + ' »');
        }
      });
    }
  });
  if (!horsPerimetre) ok(listesVilles + ' liste(s) de villes contrôlée(s) : uniquement des zones confirmées.');

  /* 7.3 — Promesses interdites par la fiche entreprise. Les formulations
           négatives (« aucune garantie de résultat », « sans garantie de desserte
           quartier par quartier ») sont conformes : la négation qui précède
           dans la même phrase annule l'alerte. */
  /* Les motifs sont en mode « u » : sans lui, « \b » ignore les lettres
     accentuées et « profil vérifié » passerait au travers. */
  const PROMESSES = [
    [/(?<![\p{L}])subsaharien/iu, "critère d'origine (« subsaharien »)"],
    [/500\s*\+\s*familles/iu, 'nombre de familles non mesuré (« 500+ familles »)'],
    [/(?<![\p{L}])agence\s*n[o°0]\s*1(?![\p{L}\p{N}])/iu, 'affirmation de supériorité (« agence n°1 »)'],
    [/(?<![\p{L}])(?:remplacement|profil|personnel|sélection|résultat|satisfaction)\s+garanti[es]?(?![\p{L}])/iu, 'garantie annoncée (remplacement, résultat, sélection)'],
    [/(?<![\p{L}])(?:profils?|personnel|candidats?)\s+vérifiés?(?![\p{L}])/iu, "vérification d'antécédents annoncée"],
    [/(?<![\p{L}])(?:sous|en|dans)\s+(?:les\s+)?(?:moins\s+de\s+)?24\s*(?:h|heures)(?![\p{L}])/iu, 'délai de 24 h annoncé'],
    [/(?<![\p{L}])(?:réponse|profil|mise en relation)\s+(?:sous|dans|en)\s+\d+\s*(?:h|heures|jours?)(?![\p{L}])/iu, 'délai de mise en relation annoncé']
  ];
  const NEGATION = /\b(aucun|aucune|sans|ni|jamais|pas|non|ne|rien|personne)\b/i;
  let promesses = 0;
  surfaces.forEach((s) => {
    PROMESSES.forEach(([motif, libelle]) => {
      const global = new RegExp(motif.source, motif.flags.indexOf('g') === -1 ? motif.flags + 'g' : motif.flags);
      let trouve;
      while ((trouve = global.exec(s.texte)) !== null) {
        const avant = s.texte.slice(Math.max(0, trouve.index - 90), trouve.index);
        const coupe = Math.max(avant.lastIndexOf('.'), avant.lastIndexOf('>'), avant.lastIndexOf('\n'));
        if (NEGATION.test(avant.slice(coupe + 1))) continue;
        promesses += 1;
        erreur(s.fichier + ' : ' + libelle + ' → « ' + trouve[0] + ' »');
      }
    });
  });
  if (!promesses) ok('Aucune promesse interdite (délai, garantie, vérification, supériorité, origine).');

  /* 7.4 — Domaine unique : après la migration (lot 1 du plan SEO), aucun
           fichier publié ne doit rester sur l'ancien hébergement. */
  let hoteAttendu = '';
  try { hoteAttendu = new URL(CONFIG.url).hostname; } catch (e) { hoteAttendu = ''; }
  if (hoteAttendu) {
    const HERBERGEMENTS = /(vercel\.app|netlify\.app|netlify\.com|github\.io|pages\.dev|herokuapp\.com)$/i;
    const vus = new Set();
    let domainesEtrangers = 0;
    surfaces.forEach((s) => {
      (s.texte.match(/https?:\/\/[a-z0-9.-]+/gi) || []).forEach((url) => {
        let hote = '';
        try { hote = new URL(url).hostname; } catch (e) { return; }
        if (hote === hoteAttendu || !HERBERGEMENTS.test(hote)) return;
        const clef = s.fichier + '|' + url;
        if (vus.has(clef)) return;
        vus.add(clef);
        domainesEtrangers += 1;
        erreur(s.fichier + ' : URL publiée sur un autre hébergement que ' + hoteAttendu + ' → ' + url);
      });
    });
    if (!domainesEtrangers) ok('Domaine unique : les URL absolues pointent toutes sur ' + hoteAttendu + '.');
  }
}

/* ═══ Rappels de conformité (informatifs, hors décompte) ═══ */
section('Rappels de conformité (ne bloquent pas la publication)');
const suivi = path.join(RACINE, 'contenu', 'valider-avis.md');
if (fs.existsSync(suivi)) {
  const restant = (lire('contenu/valider-avis.md').match(/⬜/g) || []).length;
  if (restant) console.log('  ℹ️  Avis clients : ' + restant + ' case(s) à cocher dans contenu/valider-avis.md' +
    ' (consentement écrit à archiver).');
  else ok('Avis clients : consentements archivés.');
}
if (CONFIG.url && /vercel\.app$/.test(new URL(CONFIG.url).hostname)) {
  console.log('  ℹ️  Domaine : le site tourne encore sur ' + new URL(CONFIG.url).hostname +
    ' — migrer vers le domaine propre (plan SEO local, lot 1).');
}
console.log('  ℹ️  Tarifs et remplacements publiés : issus de la grille officielle (flyer). À revalider avant toute campagne.');

/* ═══ Synthèse ═══ */
console.log('\n' + '─'.repeat(66));
console.log(erreurs === 0
  ? '✅ Contenu conforme : ' + avertissements + ' avertissement(s).'
  : '❌ ' + erreurs + ' erreur(s) bloquante(s) — ne pas publier en l\'état, et ' + avertissements + ' avertissement(s).');
console.log('─'.repeat(66) + '\n');
process.exit(erreurs === 0 ? 0 : 1);
