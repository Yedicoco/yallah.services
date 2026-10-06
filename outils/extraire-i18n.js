#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Extraction des chaînes à traduire (i18n)

   Ce script parcourt les pages publiques avec EXACTEMENT les mêmes
   règles que le moteur d'affichage (assets/js/i18n.js) et en sort la
   liste des clés de traduction : texte visible, attributs (placeholder,
   title, aria-label, alt, data-pack), liens WhatsApp pré-remplis,
   <title> et balises meta.

   Il ne traduit rien : il fabrique le travail à traduire et vérifie la
   couverture des dictionnaires.

       node outils/extraire-i18n.js              liste les clés (rapport)
       node outils/extraire-i18n.js --json       exporte contenu/i18n/cles.json
       node outils/extraire-i18n.js --verifier   contrôle la couverture des
                                                 dictionnaires publiés

   Les traductions s'écrivent dans contenu/i18n/traductions/ puis sont
   compilées par outils/generer-i18n.js (voir ce fichier).

   Conventions de clés (identiques au moteur) :
       texte                 →  « Une aide fiable pour votre maison »
       attribut              →  « @placeholder:Votre nom complet »
       lien WhatsApp         →  « @wa:Bonjour Yallah Services ! »
       titre du document     →  « @title »
       meta                  →  « @meta:description », « @meta:og:title »…

   Les éléments marqués data-ys-notrad (ou data-lang="ar", qui est la
   version arabe d'origine de la fiche candidat) ne sont jamais traduits
   par le moteur : leurs textes sont donc exclus de l'extraction du
   français et collectés à part, comme base des dictionnaires darija.
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');

/* Pages publiques prises en charge par le moteur multilingue.
   Une page absente de cette liste n'est simplement pas traduite. */
const PAGES = [
  'index.html',
  'candidature.html',
  'candidature-confirmation.html',
  'personnel-entreprises.html',
  'services-par-ville.html',
  /* Pages « service × ville » de Casablanca : générées par
     outils/generer-pages-villes.js. Toute régénération décale les chaînes :
     relancer extraire-i18n.js --json puis reindexer-i18n.js. */
  'nounou-casablanca.html',
  'femme-menage-casablanca.html',
  'cuisiniere-casablanca.html',
  'garde-malade-casablanca.html',
  'chauffeur-casablanca.html',
  'vigile-casablanca.html'
];

const DOSSIER_I18N = path.join(RACINE, 'contenu', 'i18n');
const LANGUES = ['dar', 'dar-latn', 'en'];

/* ── Règles partagées avec assets/js/i18n.js ─────────────────────── */

/* Balises jamais parcourues */
const SAUTER = new Set(['script', 'style', 'noscript', 'svg', 'path', 'canvas',
  'iframe', 'template', 'head', 'meta', 'link', 'object', 'embed', 'g', 'defs',
  'use', 'symbol', 'clippath', 'rect', 'circle', 'line', 'polygon', 'polyline',
  'stop', 'lineargradient', 'radialgradient', 'mask', 'pattern', 'filter', 'tspan']);

/* Balises en ligne : elles ne rendent pas un élément « composé » */
const EN_LIGNE = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code',
  'data', 'dfn', 'em', 'i', 'img', 'kbd', 'mark', 'picture', 'q', 's', 'samp',
  'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr', 'source',
  'bdi', 'rb', 'rt', 'ruby']);

const BALISES_VIDES = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
  'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/* Attributs traduisibles */
const ATTRIBUTS = ['placeholder', 'title', 'aria-label', 'alt', 'data-pack'];

const ENTITES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', middot: '·',
  hellip: '…', rsquo: '\u2019', lsquo: '\u2018', ldquo: '\u201c', rdquo: '\u201d',
  laquo: '«', raquo: '»', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç',
  ugrave: 'ù', ecirc: 'ê', ocirc: 'ô', icirc: 'î', acirc: 'â', cacute: 'ć',
  deg: '°', euro: '€', times: '×', copy: '©', reg: '®', shy: '\u00ad', zwnj: '\u200c',
  zwj: '\u200d', ensp: ' ', emsp: ' ', thinsp: ' ', ndash: '–', mdash: '—'
};

function decoderEntites(texte) {
  return String(texte).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (tout, code) => {
    if (code.charAt(0) === '#') {
      const nombre = code.charAt(1).toLowerCase() === 'x'
        ? parseInt(code.slice(2), 16)
        : parseInt(code.slice(1), 10);
      return Number.isFinite(nombre) ? String.fromCodePoint(nombre) : tout;
    }
    const valeur = ENTITES[code.toLowerCase()];
    return valeur === undefined ? tout : valeur;
  });
}

/* Normalisation : la même dans le navigateur et ici, sinon les clés
   ne correspondent pas. Les <br> deviennent des retours à la ligne. */
function normaliser(texte) {
  let t = String(texte).replace(/\u00a0/g, ' ').replace(/[\u200b\ufeff]/g, '');
  t = t.replace(/[ \t\r\f\v]+/g, ' ');
  t = t.replace(/ ?\n ?/g, '\n');
  t = t.split('\n').map((l) => l.replace(/^ +| +$/g, '')).filter((l) => l !== '').join('\n');
  return t.trim();
}

function contientLettres(texte) {
  return /[A-Za-zÀ-ÖØ-öø-ÿĀ-ž\u0600-\u06ff\u0750-\u077f]/.test(texte);
}

/* ── Analyseur HTML minimal (sans dépendance) ────────────────────── */

function analyser(html) {
  const racine = { type: 'elem', nom: '#racine', attributs: {}, enfants: [] };
  const pile = [racine];
  let i = 0;

  const sommet = () => pile[pile.length - 1];
  const ajouter = (noeud) => { sommet().enfants.push(noeud); return noeud; };
  const texteCourant = () => {
    const enfants = sommet().enfants;
    return enfants.length ? enfants[enfants.length - 1] : null;
  };
  const ajouterTexte = (valeur) => {
    if (!valeur) return;
    const dernier = texteCourant();
    if (dernier && dernier.type === 'texte') dernier.valeur += valeur;
    else ajouter({ type: 'texte', valeur });
  };

  /* Fermeture implicite : <li> dans <li>, <p> dans <p>, etc. */
  function fermerImplicite(nom) {
    const FERME = { li: ['li'], option: ['option'], td: ['td', 'th'], th: ['td', 'th'],
      tr: ['tr'], dt: ['dt', 'dd'], dd: ['dt', 'dd'], p: ['p'], summary: ['summary'],
      thead: ['tbody'], tbody: ['tbody'] };
    const declencheurs = FERME[nom] || [];
    if (BLOCS.has(nom)) {
      /* un bloc ferme un <p> resté ouvert */
      let j = pile.length - 1;
      while (j > 0 && pile[j].nom === 'p') { pile.pop(); j -= 1; }
    }
    while (pile.length > 1 && declencheurs.indexOf(sommet().nom) !== -1) pile.pop();
  }

  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) { ajouterTexte(decoderEntites(html.slice(i))); break; }
    if (lt > i) ajouterTexte(decoderEntites(html.slice(i, lt)));

    if (html.startsWith('<!--', lt)) {
      const fin = html.indexOf('-->', lt);
      i = fin === -1 ? html.length : fin + 3;
      continue;
    }
    if (html.startsWith('<!', lt) || html.startsWith('<?', lt)) {
      const fin = html.indexOf('>', lt);
      i = fin === -1 ? html.length : fin + 1;
      continue;
    }

    const reste = html.slice(lt);
    const m = /^<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>`]+))?)*)\s*(\/?)>/.exec(reste);
    if (!m) { ajouterTexte('<'); i = lt + 1; continue; }

    const fermante = m[1] === '/';
    const nom = m[2].toLowerCase();
    const brutAttributs = m[3] || '';
    const autoFermee = m[4] === '/' || BALISES_VIDES.has(nom);
    i = lt + m[0].length;

    if (fermante) {
      let j = pile.length - 1;
      while (j > 0 && pile[j].nom !== nom) j -= 1;
      if (j > 0) pile.length = j;
      continue;
    }

    const attributs = {};
    const motif = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>`]+)))?/g;
    let a;
    while ((a = motif.exec(brutAttributs))) {
      const valeur = a[2] !== undefined ? a[2] : (a[3] !== undefined ? a[3] : (a[4] !== undefined ? a[4] : ''));
      attributs[a[1].toLowerCase()] = decoderEntites(valeur);
    }

    if (nom === 'script' || nom === 'style' || nom === 'textarea' || nom === 'title') {
      const fin = html.toLowerCase().indexOf('</' + nom, i);
      const contenu = fin === -1 ? html.slice(i) : html.slice(i, fin);
      const noeud = ajouter({ type: nom === 'title' ? 'titre' : 'brut', nom, attributs, enfants: [], valeur: contenu });
      if (noeud.type === 'titre') { /* titre conservé tel quel */ }
      i = fin === -1 ? html.length : fin;
      continue;
    }
    if (nom === 'br') { ajouter({ type: 'elem', nom: 'br', attributs, enfants: [] }); continue; }

    if (!autoFermee) fermerImplicite(nom);
    const noeud = ajouter({ type: 'elem', nom, attributs, enfants: [] });
    if (!autoFermee) pile.push(noeud);
  }
  return racine;
}

const BLOCS = new Set(['address', 'article', 'aside', 'blockquote', 'div', 'dl',
  'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4',
  'h5', 'h6', 'header', 'hr', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table',
  'ul', 'details', 'summary', 'li', 'tr', 'td', 'th', 'tbody', 'thead']);

/* ── Parcours : mêmes règles que le moteur ───────────────────────── */

/* Reconstitution du HTML interne d'un élément (pour retrouver le
   balisage exact : <em>, <strong>, <span class="…">). */
function htmlInterne(noeud) {
  return (noeud.enfants || []).map((enfant) => {
    if (enfant.type === 'texte') return enfant.valeur;
    if (enfant.type !== 'elem') return '';
    const attributs = Object.keys(enfant.attributs || {})
      .map((nom) => ' ' + nom + '="' + enfant.attributs[nom].replace(/"/g, '&quot;') + '"').join('');
    return '<' + enfant.nom + attributs + '>' + htmlInterne(enfant) + '</' + enfant.nom + '>';
  }).join('').trim();
}

function texteDuNoeud(noeud) {
  let sortie = '';
  (noeud.enfants || []).forEach((enfant) => {
    if (enfant.type === 'texte') sortie += enfant.valeur;
    else if (enfant.type === 'elem') {
      if (enfant.nom === 'br') sortie += '\n';
      else if (SAUTER.has(enfant.nom)) { /* rien */ }
      else sortie += texteDuNoeud(enfant);
    }
  });
  return sortie;
}

/* Un élément est « feuille » — donc traduit d'un bloc — quand :
   · il ne contient aucun élément de structure (uniquement des balises
     en ligne : <strong>, <em>, <a>, <br>, <span>…) ;
   · ET qu'il porte lui-même du texte (sinon c'est un simple conteneur :
     on descend, et chaque lien ou bouton est traduit séparément). */
function estFeuille(noeud) {
  const enfants = noeud.enfants || [];
  const inlineSeulement = enfants.every((enfant) => {
    if (enfant.type !== 'elem') return true;
    if (SAUTER.has(enfant.nom)) return true;
    /* Un élément qui contient une version linguistique imbriquée
       (data-lang) est un conteneur : chaque version est traduite à part. */
    if (enfant.attributs && enfant.attributs['data-lang']) return false;
    return EN_LIGNE.has(enfant.nom);
  });
  if (!inlineSeulement) return false;
  return enfants.some((enfant) => enfant.type === 'texte' && contientLettres(enfant.valeur));
}

function cheminDe(noeud) {
  return noeud && noeud.attributs && noeud.attributs.id ? noeud.nom + '#' + noeud.attributs.id : noeud.nom;
}

/* Collecte : cles = Map(clé → { occurrences, exemple, langue }) */
function collecter(noeud, cles, langueCourante, langueCherchee) {
  if (noeud.type !== 'elem') return;
  const nom = noeud.nom;
  if (SAUTER.has(nom)) return;
  const attributs = noeud.attributs || {};
  if (attributs['data-ys-notrad'] !== undefined) return;

  /* data-lang="ar" : contenu arabe d'origine des pages candidat.
     La langue se transmet aux enfants jusqu'à nouvel attribut. */
  let langue = langueCourante;
  if (attributs['data-lang'] === 'ar') langue = 'ar';
  else if (attributs['data-lang'] === 'fr') langue = 'fr';

  const ajouter = (cle, exemple, langueCle) => {
    if (!cle) return;
    const entree = cles.get(cle) || { cle, occurrences: 0, exemple: exemple || '', langue: langueCle || langue };
    entree.occurrences += 1;
    if (!entree.exemple && exemple) entree.exemple = exemple;
    cles.set(cle, entree);
  };

  /* Placeholder bilingue (data-fr-ph / data-ar-ph) : assets/js/fiche.js le
     reporte sur l'attribut placeholder, que le moteur multilingue traduit
     ensuite comme n'importe quel placeholder. */
  const phBrut = langueCherchee === 'ar' ? attributs['data-ar-ph'] : attributs['data-fr-ph'];
  if (phBrut !== undefined && contientLettres(phBrut)) {
    ajouter('@placeholder:' + normaliser(phBrut), phBrut, langueCherchee);
  }

  /* Élément bilingue par attributs : data-fr / data-ar. C'est le cas des
     <option> de la fiche candidat — un <option> ne peut pas contenir de
     <span data-lang>. fiche.js écrit dans l'élément la version de la base
     active : c'est donc cette version-là qui sert de clé, comme pour
     data-lang. Le texte écrit en dur dans le HTML (repli sans JavaScript)
     n'est pas collecté : il duplicaterait la clé française. */
  if (attributs['data-fr'] !== undefined && attributs['data-ar'] !== undefined) {
    const brut = langueCherchee === 'ar' ? attributs['data-ar'] : attributs['data-fr'];
    const cle = normaliser(brut || '');
    if (cle && contientLettres(cle)) ajouter(cle, cle, langueCherchee);
    return;
  }

  if (langue !== langueCherchee) {
    (noeud.enfants || []).forEach((enfant) => collecter(enfant, cles, langue, langueCherchee));
    return;
  }

  /* Attributs traduisibles */
  ATTRIBUTS.forEach((nomAttribut) => {
    const valeur = attributs[nomAttribut];
    if (!valeur || !contientLettres(valeur)) return;
    ajouter('@' + nomAttribut + ':' + normaliser(valeur), valeur);
  });

  /* Lien WhatsApp pré-rempli : ?text=… */
  const href = attributs.href || '';
  if (/wa\.me|api\.whatsapp\.com|whatsapp:\/\//.test(href) || /wa\.me/.test(attributs['data-href'] || '')) {
    const m = /[?&]text=([^&]*)/.exec(href);
    if (m) {
      const message = normaliser(decodeURIComponent(m[1].replace(/\+/g, ' ')));
      if (message && contientLettres(message)) ajouter('@wa:' + message, message);
    }
  }

  if (nom === 'title') return;
  if (estFeuille(noeud)) {
    const cle = normaliser(texteDuNoeud(noeud));
    if (cle && contientLettres(cle)) {
      ajouter(cle, cle);
      /* balisage interne (<strong>, <em>, <br>…) : la traduction doit le
         reprendre, sinon le style est perdu à l'affichage */
      const noeuds = (noeud.enfants || []).filter((e) => e.type === 'elem' && !SAUTER[e.nom]);
      if (noeuds.length) {
        const entree = cles.get(cle);
        if (entree) {
          entree.balisage = noeuds.map((e) => e.nom).join(',');
          entree.html = htmlInterne(noeud);
        }
      }
    }
    return;
  }
  (noeud.enfants || []).forEach((enfant) => collecter(enfant, cles, langue, langueCherchee));
}

/* Métadonnées d'une page : <title>, meta, <html lang>.
   Les pages candidat portent data-titre-fr / data-titre-ar sur <html> :
   c'est ce titre-là que la page affiche réellement. */
function collecterEntete(html, cles, langue) {
  const baliseHtml = /<html[^>]*>/i.exec(html);
  const attributsHtml = {};
  if (baliseHtml) {
    const motif = /([a-zA-Z-]+)\s*=\s*["']([^"']*)["']/g;
    let a;
    while ((a = motif.exec(baliseHtml[0]))) attributsHtml[a[1].toLowerCase()] = decoderEntites(a[2]);
  }
  const titreAttribut = langue === 'ar' ? attributsHtml['data-titre-ar'] : attributsHtml['data-titre-fr'];
  const titreBalise = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const valeurTitre = normaliser(titreAttribut || (titreBalise ? decoderEntites(titreBalise[1]) : ''));
  if (valeurTitre) cles.set('@title', { cle: '@title', occurrences: 1, exemple: valeurTitre, langue });
  const motif = /<meta\s+[^>]*>/gi;
  let m;
  while ((m = motif.exec(html))) {
    const balise = m[0];
    const nom = /(?:name|property)\s*=\s*["']([^"']+)["']/i.exec(balise);
    const contenu = /content\s*=\s*["']([^"']*)["']/i.exec(balise);
    if (!nom || !contenu) continue;
    const clef = nom[1].toLowerCase();
    if (!/^(description|keywords|og:title|og:description|og:locale|twitter:title|twitter:description|twitter:image:alt)$/.test(clef)) continue;
    const valeur = normaliser(decoderEntites(contenu[1]));
    if (!valeur || !contientLettres(valeur)) continue;
    cles.set('@meta:' + clef, { cle: '@meta:' + clef, occurrences: 1, exemple: valeur, langue: 'fr' });
  }
}

/* ── Traitement ──────────────────────────────────────────────────── */

function extrairePage(fichier) {
  const html = fs.readFileSync(path.join(RACINE, fichier), 'utf8');
  const arbre = analyser(html);
  const clesFr = new Map();
  const clesAr = new Map();
  /* Page bilingue = page qui porte les deux bases linguistiques
     (data-lang="fr" / data-lang="ar"), c'est-à-dire la fiche candidat. */
  const bilingue = /\bdata-lang\s*=/.test(html);
  collecter(arbre, clesFr, 'fr', 'fr');
  collecterEntete(html, clesFr, 'fr');
  if (bilingue) {
    collecter(arbre, clesAr, 'fr', 'ar');
    collecterEntete(html, clesAr, 'ar');
  }
  return { fichier, clesFr, clesAr, aPageBilingue: bilingue };
}

function main() {
  const options = {
    json: process.argv.includes('--json') || process.argv.includes('--modeles'),
    verifier: process.argv.includes('--verifier')
  };

  const resultats = PAGES.map((page) => extrairePage(page));

  /* Clés attendues dans le dictionnaire d'une langue, pour une page :
     · anglais        → clés françaises (source du site)
     · darija / latine→ clés arabes si la page a une version arabe
                        d'origine (fiche candidat), sinon clés françaises. */
  function clesPourLangue(res, langue) {
    if (langue === 'en') return res.clesFr;
    return res.aPageBilingue ? res.clesAr : res.clesFr;
  }

  const cheminDico = (langue, page) =>
    path.join(RACINE, 'assets', 'i18n', langue, page.replace(/\.html$/, '.js'));

  function chargerDico(langue, page) {
    const fichier = cheminDico(langue, page);
    if (!fs.existsSync(fichier)) return null;
    const source = fs.readFileSync(fichier, 'utf8');
    const cles = {};
    const motif = /^\s*"((?:[^"\\]|\\.)*)"\s*:/gm;
    let m;
    while ((m = motif.exec(source))) cles[JSON.parse('"' + m[1] + '"')] = true;
    return cles;
  }

  /* ── Rapport de volume ── */
  let totalCles = 0;
  console.log('Clés à traduire par page :\n');
  const rapport = resultats.map((res) => {
    totalCles += res.clesFr.size;
    const ligne = {
      page: res.fichier,
      fr: res.clesFr.size,
      ar: res.clesAr.size,
      bilingue: res.aPageBilingue,
      manquantes: {}
    };
    console.log('  ' + res.fichier.padEnd(30) + 'source FR ' + String(res.clesFr.size).padStart(4) +
      (res.aPageBilingue ? ' · source AR (existante) ' + res.clesAr.size : '') +
      ' → attendu en ' + LANGUES.map((l) => l + ' ' + clesPourLangue(res, l).size).join(' · '));
    return ligne;
  });

  const totalTrads = resultats.reduce((somme, res) =>
    somme + LANGUES.reduce((s, l) => s + clesPourLangue(res, l).size, 0), 0);
  console.log('\n  TOTAL : ' + totalCles + ' chaînes françaises uniques, ' + totalTrads +
    ' traductions à écrire (3 langues).\n');

  /* ── Export JSON + modèles de dictionnaires ── */
  if (options.json || options.modeles) {
    fs.mkdirSync(DOSSIER_I18N, { recursive: true });
    const exportJson = {};
    resultats.forEach((res) => {
      exportJson[res.fichier] = {
        bilingue: res.aPageBilingue,
        clesFrancais: [...res.clesFr.values()],
        clesArabe: [...res.clesAr.values()]
      };
    });
    const fichierCles = path.join(DOSSIER_I18N, 'cles.json');
    const nouveau = JSON.stringify(exportJson, null, 2);
    /* Les traductions sont numérotées par position dans cette liste : si le
       HTML a changé, on conserve la liste précédente, qui permet à
       outils/reindexer-i18n.js de retrouver les traductions déjà écrites. */
    if (fs.existsSync(fichierCles)) {
      const ancien = fs.readFileSync(fichierCles, 'utf8');
      if (ancien !== nouveau) {
        fs.writeFileSync(path.join(DOSSIER_I18N, 'cles.prec.json'), ancien, 'utf8');
        console.log('🗂️  contenu/i18n/cles.prec.json conservé (liste précédente — ' +
          'outils/reindexer-i18n.js s\'en sert).');
      }
    }
    fs.writeFileSync(fichierCles, nouveau, 'utf8');
    console.log('📄 contenu/i18n/cles.json écrit.');
  }

  /* ── Contrôle de couverture ── */
  if (options.verifier) {
    let manquantes = 0;
    console.log('Couverture des dictionnaires :\n');
    resultats.forEach((res) => {
      const detail = LANGUES.map((langue) => {
        const attendues = [...clesPourLangue(res, langue).values()];
        const dico = chargerDico(langue, res.fichier);
        if (!dico) { manquantes += attendues.length; return langue + ' ❌ fichier absent'; }
        const absentes = attendues.filter((c) => !Object.prototype.hasOwnProperty.call(dico, c.cle));
        manquantes += absentes.length;
        return langue + (absentes.length === 0 ? ' ✅' : ' ❌ ' + absentes.length + '/' + attendues.length);
      }).join('  ·  ');
      console.log('  ' + res.fichier.padEnd(30) + detail);
    });
    console.log('\n' + (manquantes === 0
      ? '✅ Toutes les chaînes attendues ont une traduction.'
      : '❌ ' + manquantes + ' chaîne(s) sans traduction.'));
    process.exit(manquantes === 0 ? 0 : 1);
  }
  if (!options.json) {
    console.log('   (options : --json pour exporter les clés vers contenu/i18n/cles.json,');
    console.log('    --verifier pour contrôler la couverture des dictionnaires publiés)');
  }
}

main();
