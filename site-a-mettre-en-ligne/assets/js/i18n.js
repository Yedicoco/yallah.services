/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Moteur multilingue (aucune dépendance)

   Quatre affichages, trois langues :
       fr        Français                  (langue source du site)
       dar       الدارجة المغربية           (darija en lettres arabes, RTL)
       dar-latn  Darija (lettres latines)  (même texte, alphabet latin)
       en        English

   Fonctionnement
   · Le HTML reste écrit en français (et en arabe d'origine sur les pages
     candidat). Les dictionnaires de assets/i18n/<langue>/<page>.js ne
     contiennent que les traductions, indexées par le texte source
     (voir outils/extraire-i18n.js, qui applique les mêmes règles).
   · Un dictionnaire absent n'est jamais une erreur : la page garde sa
     langue de base et le sélecteur n'est pas affiché.
   · Le choix du visiteur est mémorisé (localStorage « ys_langue ») et
     s'applique à toutes les pages du site.

   API publique
       YSI18N.langue()             → 'fr' | 'dar' | 'dar-latn' | 'en'
       YSI18N.definir('en')        → change la langue
       YSI18N.surChangement(fn)    → appelé après chaque changement
       YSI18N.traduire(element)    → retraduit un fragment de DOM
       YSI18N.estTraduite('index') → la page a-t-elle un dictionnaire ?
       YSI18N.LANGUES / ORDRE      → métadonnées des langues

   Compatibilité : la fiche candidat (assets/js/fiche.js) garde son API
   bilingue ; le moteur s'y branche automatiquement quand elle est là.
══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ─────────── Langues ─────────── */
  var LANGUES = {
    fr: { code: 'fr', court: 'FR', nom: 'Français', dir: 'ltr', htmlLang: 'fr-MA', base: 'fr', locale: 'fr_MA' },
    dar: { code: 'dar', court: 'الدارجة', nom: 'الدارجة المغربية', dir: 'rtl', htmlLang: 'ar-MA', base: 'ar', locale: 'ar_MA' },
    'dar-latn': { code: 'dar-latn', court: 'Darija', nom: 'Darija en lettres latines', dir: 'ltr', htmlLang: 'ar-Latn-MA', base: 'ar', locale: 'ar_MA' },
    en: { code: 'en', court: 'EN', nom: 'English', dir: 'ltr', htmlLang: 'en', base: 'fr', locale: 'en_US' }
  };
  var ORDRE = ['fr', 'dar', 'dar-latn', 'en'];
  var CLE_STOCKAGE = 'ys_langue';

  /* Pages disposant d'un dictionnaire. Une page absente de cette liste
     garde le français et n'affiche pas le sélecteur de langue.
     (outils/verifier-i18n.js contrôle la cohérence de cette liste.) */
  var PAGES_TRADUITES = [
    'index',
    'candidature',
    'candidature-confirmation',
    'personnel-entreprises',
    'services-par-ville'
  ];

  /* ─────────── Règles de parcours (identiques à outils/extraire-i18n.js) ─────────── */
  var SAUTER = {
    SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, SVG: 1, PATH: 1, CANVAS: 1, IFRAME: 1,
    TEMPLATE: 1, HEAD: 1, META: 1, LINK: 1, TITLE: 1, OBJECT: 1, EMBED: 1,
    G: 1, DEFS: 1, USE: 1, SYMBOL: 1, CLIPPATH: 1, RECT: 1, CIRCLE: 1, ELLIPSE: 1,
    LINE: 1, POLYGON: 1, POLYLINE: 1, STOP: 1, LINEARGGRADIENT: 1, RADIALGRADIENT: 1,
    MASK: 1, PATTERN: 1, FILTER: 1, TEXT: 1
  };
  var EN_LIGNE = {
    A: 1, ABBR: 1, B: 1, BDI: 1, BDO: 1, BR: 1, CITE: 1, CODE: 1, DATA: 1, DFN: 1,
    EM: 1, I: 1, IMG: 1, KBD: 1, MARK: 1, PICTURE: 1, Q: 1, S: 1, SAMP: 1, SMALL: 1,
    SPAN: 1, STRONG: 1, SUB: 1, SUP: 1, TIME: 1, U: 1, VAR: 1, WBR: 1, SOURCE: 1,
    RB: 1, RT: 1, RUBY: 1
  };
  var ATTRIBUTS = ['placeholder', 'title', 'aria-label', 'alt', 'data-pack'];

  var page = (global.location.pathname.split('/').pop() || 'index.html')
    .replace(/\.html?$/i, '') || 'index';

  /* ─────────── État ─────────── */
  var TRAD = {};       /* TRAD[langue][page][clé] = traduction */
  var langue = 'fr';
  var modifs = [];     /* ce que le moteur a réécrit, pour revenir au français */
  var ecouteurs = [];
  var pret = false;
  var enCours = false;

  /* ─────────── Utilitaires ─────────── */
  function normaliser(texte) {
    var t = String(texte).replace(/\u00a0/g, ' ').replace(/[\u200b\ufeff]/g, '');
    t = t.replace(/[ \t\r\f\v]+/g, ' ');
    t = t.replace(/ ?\n ?/g, '\n');
    t = t.split('\n').map(function (l) { return l.replace(/^ +| +$/g, ''); })
      .filter(function (l) { return l !== ''; }).join('\n');
    return t.replace(/^ +| +$/g, '');
  }

  function contientLettres(texte) {
    return /[A-Za-zÀ-ÖØ-öø-ÿĀ-ž\u0600-\u06ff\u0750-\u077f]/.test(texte);
  }

  function balise(el) { return String(el.tagName || '').toUpperCase(); }

  function texteDuNoeud(noeud) {
    var sortie = '';
    var enfants = noeud.childNodes;
    for (var i = 0; i < enfants.length; i += 1) {
      var n = enfants[i];
      if (n.nodeType === 3) sortie += n.nodeValue;
      else if (n.nodeType === 1) {
        if (balise(n) === 'BR') sortie += '\n';
        else if (!SAUTER[balise(n)]) sortie += texteDuNoeud(n);
      }
    }
    return sortie;
  }

  function estFeuille(el) {
    var enfants = el.childNodes;
    var texteDirect = false;
    for (var i = 0; i < enfants.length; i += 1) {
      var n = enfants[i];
      if (n.nodeType === 3) { if (contientLettres(n.nodeValue)) texteDirect = true; }
      else if (n.nodeType === 1) {
        if (SAUTER[balise(n)]) continue;
        if (!EN_LIGNE[balise(n)] || n.hasAttribute('data-lang')) return false;
      }
    }
    return texteDirect;
  }

  function dico() { return (TRAD[langue] && TRAD[langue][page]) || {}; }

  /* ─────────── Application / restauration ─────────── */
  function noter(el, genre, nom, avant, apres) {
    modifs.push({ el: el, genre: genre, nom: nom, avant: avant, apres: apres });
  }

  function restaurer() {
    for (var i = modifs.length - 1; i >= 0; i -= 1) {
      var m = modifs[i];
      if (m.genre === 'texte') {
        if (m.el.textContent === m.apres) m.el.textContent = m.avant;
      } else if (m.genre === 'html') {
        if (m.el.innerHTML === m.apres) m.el.innerHTML = m.avant;
      } else if (m.genre === 'attr') {
        if (m.el.getAttribute(m.nom) === m.apres) m.el.setAttribute(m.nom, m.avant);
      } else if (m.genre === 'href') {
        if (m.el.getAttribute('href') === m.apres) m.el.setAttribute('href', m.avant);
      } else if (m.genre === 'titre') {
        if (document.title === m.apres) document.title = m.avant;
      }
    }
    modifs = [];
  }

  /* Écrit la traduction : textContent si l'élément n'a pas de balise
     interne, innerHTML sinon (le balisage est conservé dans la valeur). */
  function ecrire(el, valeur) {
    if (el.children.length === 0) {
      if (el.textContent === valeur) return;
      noter(el, 'texte', '', el.textContent, valeur);
      el.textContent = valeur;
    } else {
      if (el.innerHTML === valeur) return;
      noter(el, 'html', '', el.innerHTML, valeur);
      el.innerHTML = valeur;
    }
  }

  function traduireAttribut(el, nom) {
    var valeur = el.getAttribute && el.getAttribute(nom);
    if (!valeur || !contientLettres(valeur)) return;
    var traduction = dico()['@' + nom + ':' + normaliser(valeur)];
    if (!traduction || traduction === valeur) return;
    noter(el, 'attr', nom, valeur, traduction);
    el.setAttribute(nom, traduction);
  }

  function traduireLienWhatsApp(el) {
    var href = el.getAttribute && el.getAttribute('href');
    if (!href || !/(wa\.me|api\.whatsapp\.com|whatsapp:\/\/)/.test(href)) return;
    var m = /([?&]text=)([^&]*)/.exec(href);
    if (!m) return;
    var message;
    try { message = decodeURIComponent(m[2].replace(/\+/g, ' ')); } catch (e) { return; }
    var traduction = dico()['@wa:' + normaliser(message)];
    if (!traduction) return;
    var nouveau = href.slice(0, m.index) + m[1] + encodeURIComponent(traduction) + href.slice(m.index + m[0].length);
    if (nouveau === href) return;
    noter(el, 'href', 'href', href, nouveau);
    el.setAttribute('href', nouveau);
  }

  function attributsDe(el, recurse) {
    for (var a = 0; a < ATTRIBUTS.length; a += 1) traduireAttribut(el, ATTRIBUTS[a]);
    traduireLienWhatsApp(el);
    if (recurse) {
      var enfants = el.children;
      for (var i = 0; i < enfants.length; i += 1) attributsDe(enfants[i], true);
    }
  }

  function parcourir(el) {
    if (!el || el.nodeType !== 1) return;
    if (SAUTER[balise(el)] || el.hasAttribute('data-ys-notrad')) return;

    if (estFeuille(el)) {
      var cle = normaliser(texteDuNoeud(el));
      if (cle && contientLettres(cle)) {
        var traduction = dico()[cle];
        if (traduction && traduction !== cle) ecrire(el, traduction);
      }
      attributsDe(el, true);
      return;
    }
    attributsDe(el, false);
    var enfants = el.children;
    for (var i = 0; i < enfants.length; i += 1) parcourir(enfants[i]);
  }

  function traduireEntete() {
    var d = dico();
    var titre = d['@title'];
    if (titre && document.title !== titre) {
      noter(null, 'titre', '', document.title, titre);
      document.title = titre;
    }
    var metas = document.querySelectorAll('meta[name], meta[property]');
    for (var i = 0; i < metas.length; i += 1) {
      var meta = metas[i];
      var clef = (meta.getAttribute('name') || meta.getAttribute('property') || '').toLowerCase();
      if (!clef) continue;
      if (clef === 'og:locale') {
        if (!d['@meta:og:locale']) {
          var locale = LANGUES[langue].locale;
          if (meta.getAttribute('content') !== locale) {
            noter(meta, 'attr', 'content', meta.getAttribute('content'), locale);
            meta.setAttribute('content', locale);
          }
        }
        continue;
      }
      var attendue = d['@meta:' + clef];
      if (attendue && meta.getAttribute('content') !== attendue) {
        noter(meta, 'attr', 'content', meta.getAttribute('content'), attendue);
        meta.setAttribute('content', attendue);
      }
    }
  }

  /* ─────────── Passage complet sur la page ─────────── */
  function traduire(racine) {
    if (langue === 'fr') return;
    if (Object.keys(dico()).length === 0) return;
    enCours = true;
    try {
      parcourir(racine || document.body);
      traduireEntete();
    } finally {
      enCours = false;
    }
  }

  function appliquer(nouvelle, silencieux) {
    if (!LANGUES[nouvelle]) return;
    var precedente = langue;
    if (precedente !== nouvelle) restaurer();
    langue = nouvelle;

    var infos = LANGUES[langue];
    var racine = document.documentElement;
    racine.setAttribute('lang', infos.htmlLang);
    racine.setAttribute('dir', infos.dir);
    racine.setAttribute('data-ys-lang', langue);
    racine.setAttribute('data-ys-dir', infos.dir);
    racine.setAttribute('data-ys-base', infos.base);
    if (document.body) {
      document.body.classList.toggle('ys-fr', infos.base === 'fr');
      document.body.classList.toggle('ys-ar', infos.base === 'ar');
      document.body.setAttribute('data-ys-lang', langue);
    }

    traduire(document.body);
    majSelecteur();
    try { global.localStorage.setItem(CLE_STOCKAGE, langue); } catch (e) { /* stockage refusé */ }
    if (!silencieux) {
      for (var i = 0; i < ecouteurs.length; i += 1) {
        try { ecouteurs[i](langue, precedente); } catch (e) { /* un écouteur ne bloque pas la page */ }
      }
    }
  }

  /* ─────────── Sélecteur de langue ─────────── */
  function boutons() { return document.querySelectorAll('.ys-i18n button'); }

  function majSelecteur() {
    var liste = boutons();
    for (var i = 0; i < liste.length; i += 1) {
      var actif = liste[i].getAttribute('data-langue') === langue;
      liste[i].classList.toggle('on', actif);
      liste[i].setAttribute('aria-pressed', actif ? 'true' : 'false');
    }
  }

  function creerSelecteur(compact) {
    var boite = document.createElement('div');
    boite.className = 'ys-i18n' + (compact ? ' ys-i18n-compact' : '');
    boite.setAttribute('role', 'group');
    boite.setAttribute('aria-label', 'Langue / اللغة / Language');
    boite.setAttribute('data-ys-notrad', '');
    ORDRE.forEach(function (code) {
      var infos = LANGUES[code];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ys-i18n-btn';
      b.setAttribute('data-langue', code);
      b.setAttribute('lang', infos.htmlLang);
      b.setAttribute('dir', infos.dir);
      b.setAttribute('title', infos.nom);
      b.setAttribute('aria-label', infos.nom);
      b.textContent = infos.court;
      b.addEventListener('click', function () { definir(code); });
      boite.appendChild(b);
    });
    return boite;
  }

  function injecterSelecteurs() {
    if (PAGES_TRADUITES.indexOf(page) === -1) return;

    /* Pages candidat : la barre de langues existe déjà, on la remplit. */
    var existants = document.querySelectorAll('.ys-langues');
    for (var i = 0; i < existants.length; i += 1) {
      existants[i].innerHTML = '';
      existants[i].setAttribute('data-ys-notrad', '');
      existants[i].appendChild(creerSelecteur(true));
    }
    if (existants.length) { majSelecteur(); return; }

    /* Autres pages : on se glisse dans la barre de navigation. */
    var nav = document.querySelector('#nav .nav-inner') || document.querySelector('.local-nav .nav-inner');
    if (nav) {
      var boite = creerSelecteur(true);
      boite.classList.add('ys-i18n-nav');
      var wa = nav.querySelector('.nav-wa');
      if (wa) { wa.parentNode.insertBefore(boite, wa); } else { nav.appendChild(boite); }
    }
    var menu = document.querySelector('#mobMenu');
    if (menu) {
      var ligne = document.createElement('div');
      ligne.className = 'ys-i18n-ligne';
      ligne.appendChild(creerSelecteur(false));
      menu.appendChild(ligne);
    }
    majSelecteur();
  }

  /* ─────────── Bascule ─────────── */
  function definir(nouvelle) {
    /* La fiche candidat gère elle-même ses deux bases linguistiques :
       on lui délègue la bascule pour ne pas désynchroniser ses messages. */
    if (global.YSFiche && global.YSFiche.bilingue && global.YSFiche.bilingue.pageBilingue &&
        global.YSFiche.bilingue.pageBilingue()) {
      global.YSFiche.bilingue.definir(nouvelle);
      return;
    }
    appliquer(nouvelle);
  }

  function langueInitiale() {
    var demandee = null;
    var m = /[?&]langue=([^&]+)/.exec(global.location.search);
    if (m) { try { demandee = decodeURIComponent(m[1]); } catch (e) { demandee = m[1]; } }
    if (demandee === 'ar') demandee = 'dar';
    if (demandee && LANGUES[demandee]) return demandee;

    var memoire = null;
    try { memoire = global.localStorage.getItem(CLE_STOCKAGE); } catch (e) { memoire = null; }
    if (memoire === 'ar') memoire = 'dar';
    if (memoire && LANGUES[memoire]) return memoire;

    var nav = (global.navigator.languages && global.navigator.languages[0]) ||
      global.navigator.language || 'fr';
    nav = String(nav).toLowerCase();
    if (nav.indexOf('ar') === 0) return 'dar';
    if (nav.indexOf('en') === 0) return 'en';
    return 'fr';
  }

  /* Dictionnaire de la page dans la langue d'affichage : un seul fichier,
     chargé sans requête supplémentaire pendant la construction de la page
     (document.write est bloquant, le dictionnaire est donc prêt avant
     l'affichage). Chargement de secours si ce n'est pas le cas : cache
     vide, script bloqué, page ouverte en file://… */
  function chargerDictionnaire(code) {
    if (code === 'fr' || PAGES_TRADUITES.indexOf(page) === -1) return;
    if (document.readyState === 'loading') {
      document.write('<script src="assets/i18n/' + code + '/' + page + '.js"><\/script>');
      return;
    }
    chargerDictionnaireTardif(code);
  }

  var chargementTardif = false;
  function chargerDictionnaireTardif(code) {
    if (chargementTardif || code === 'fr' || PAGES_TRADUITES.indexOf(page) === -1) return;
    if (Object.keys(dico()).length !== 0) return;
    chargementTardif = true;
    var tag = document.createElement('script');
    tag.src = 'assets/i18n/' + code + '/' + page + '.js';
    tag.onload = function () {
      majSelecteur();
      if (langue === code) appliquer(code, true);
    };
    tag.onerror = function () { chargementTardif = false; };  /* dictionnaire absent : la page reste dans sa langue de base */
    document.head.appendChild(tag);
  }

  global.YS_TRAD = function (code, nomPage, cles) {
    if (!LANGUES[code]) return;
    TRAD[code] = TRAD[code] || {};
    var cible = TRAD[code][nomPage] = TRAD[code][nomPage] || {};
    for (var cle in cles) {
      if (Object.prototype.hasOwnProperty.call(cles, cle)) cible[cle] = cles[cle];
    }
  };

  /* Retraduction des contenus écrits après le chargement (messages
     d'erreur, récapitulatif de la fiche, notifications…). */
  function surveiller() {
    if (!global.MutationObserver || langue === 'fr') return;
    var attente = null;
    var observateur = new global.MutationObserver(function () {
      if (enCours || langue === 'fr') return;
      if (attente) clearTimeout(attente);
      attente = setTimeout(function () {
        attente = null;
        if (!enCours && langue !== 'fr') { restaurer(); traduire(document.body); }
      }, 80);
    });
    observateur.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function demarrer() {
    if (pret) return;
    pret = true;
    injecterSelecteurs();
    appliquer(langue, true);
    if (langue !== 'fr' && Object.keys(dico()).length === 0) chargerDictionnaireTardif(langue);
    /* La fiche candidat prévient quand elle a fini de réécrire ses textes
       (bascule française / arabe, messages d'erreur, récapitulatif).
       On resynchronise alors la langue du moteur et on applique les
       traductions par-dessus, sans jamais traduire deux fois. */
    if (global.YSFiche && global.YSFiche.bilingue && global.YSFiche.bilingue.surApplication) {
      global.YSFiche.bilingue.surApplication(function (code) {
        appliquer(LANGUES[code] ? code : 'fr', true);
      });
    }
    if (global.YSFiche && global.YSFiche.bilingue && global.YSFiche.bilingue.initialiser &&
        global.YSFiche.bilingue.pageBilingue && global.YSFiche.bilingue.pageBilingue()) {
      global.YSFiche.bilingue.initialiser();
    }
    surveiller();
  }

  langue = langueInitiale();
  chargerDictionnaire(langue);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }

  global.YSI18N = {
    LANGUES: LANGUES,
    ORDRE: ORDRE,
    PAGES_TRADUITES: PAGES_TRADUITES,
    langue: function () { return langue; },
    definir: definir,
    traduire: function (element) { traduire(element || document.body); },
    surChangement: function (fn) { if (typeof fn === 'function') ecouteurs.push(fn); },
    estTraduite: function (nomPage) { return PAGES_TRADUITES.indexOf(nomPage) !== -1; },
    dictionnaire: function (code, nomPage) { return (TRAD[code] && TRAD[code][nomPage]) || {}; },
    normaliser: normaliser
  };
})(window);
