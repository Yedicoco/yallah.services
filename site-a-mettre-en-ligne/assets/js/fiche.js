/* ══════════════════════════════════════════════════════
   YALLAH SERVICES — Fiche de candidature : fonctions partagées
   Utilisé par candidature.js, candidature-confirmation.js et admin.js.
   Aucune dépendance. Compatible file:// (site statique).
══════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var CONFIG = global.YS_CONFIG || {};
  var WA = CONFIG.whatsappCandidats || CONFIG.whatsapp || '212710359446';
  var WA_AFFICHE = CONFIG.whatsappCandidatsAffiche || CONFIG.whatsappAffiche || '+212 710 359 446';
  var EMAIL = CONFIG.email || 'servicesyallah@gmail.com';
  var CLE_STOCKAGE = 'ys_derniere_candidature';

  var MOIS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];

  /* ── Utilitaires ── */
  /* Les deux affichages darija (lettres arabes et lettres latines)
     utilisent les contenus arabes comme base : dates, salaires et
     libellés suivent donc l'arabe. */
  function estArabe(code) {
    return code === 'ar' || code === 'dar' || code === 'dar-latn';
  }
  function texte(v) { return (v === undefined || v === null) ? '' : String(v).trim(); }
  function liste(v) { return Array.isArray(v) ? v.filter(function (x) { return texte(x) !== ''; }) : (texte(v) ? [texte(v)] : []); }
  function oui(v) { return texte(v) !== '' ? texte(v) : '—'; }

  function numTel(v) {
    var n = texte(v).replace(/[^\d+]/g, '');
    if (n.indexOf('00') === 0) n = '+' + n.slice(2);
    return n;
  }

  function dateLisible(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texte(iso));
    if (!m) return texte(iso) || '—';
    return m[3] + '/' + m[2] + '/' + m[1];
  }

  function dateLisibleAr(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texte(iso));
    if (!m) return texte(iso) || '—';
    return parseInt(m[3], 10) + ' ' + MOIS_AR[parseInt(m[2], 10) - 1] + ' ' + m[1];
  }

  /* Numéro de dossier local (version statique, sans serveur). */
  function numeroLocal() {
    var annee = new Date().getFullYear();
    var cle = 'ys_compteur_' + annee;
    var n = 0;
    try { n = parseInt(global.localStorage.getItem(cle) || '0', 10) || 0; } catch (e) { n = 0; }
    n += 1;
    try { global.localStorage.setItem(cle, String(n)); } catch (e) { /* stockage indisponible */ }
    return 'YS-' + annee + '-' + ('000' + n).slice(-4);
  }

  /* ── Messages générés ── */
  function ligne(emoji, libelle, valeur) {
    var v = texte(valeur);
    return v ? emoji + ' ' + libelle + ' : ' + v : '';
  }

  function messageWhatsApp(fiche, numero, langue) {
    var ar = estArabe(langue);
    var L = [];
    L.push(ar ? '🍀 ترشّح جديد — Yallah Services' : '🍀 NOUVELLE CANDIDATURE — Yallah Services');
    L.push((ar ? 'رقم الملفّ' : 'Dossier') + ' : ' + numero);
    L.push('');
    L.push(ar ? '👤 الهوية' : '👤 IDENTITÉ');
    L.push(ligne('•', ar ? 'الاسم' : 'Nom', fiche.nomComplet));
    L.push(ligne('•', ar ? 'العمر' : 'Âge', texte(fiche.age) ? fiche.age + (ar ? ' سنة' : ' ans') : ''));
    L.push(ligne('•', ar ? 'المدينة' : 'Ville', fiche.ville + (texte(fiche.quartier) ? ' (' + fiche.quartier + ')' : '')));
    L.push(ligne('•', ar ? 'بلد الأصل' : "Pays d'origine", fiche.origine));
    L.push(ligne('📞', ar ? 'الهاتف' : 'Téléphone', numTel(fiche.telephone)));
    L.push('');
    L.push(ar ? '💼 الوظيفة المطلوبة' : '💼 POSTE SOUHAITÉ');
    L.push(ligne('•', ar ? 'المهنة' : 'Métier', fiche.poste));
    L.push(ligne('•', ar ? 'الخبرة' : 'Expérience', fiche.experience));
    L.push(ligne('•', ar ? 'الأجر المطلوب' : 'Salaire souhaité', texte(fiche.salaire) ? fiche.salaire + (ar ? ' درهم/شهر' : ' DH/mois') : ''));
    L.push(ligne('•', ar ? 'السكن' : 'Logement', fiche.logement));
    L.push('');
    L.push(ar ? '🕒 التوفّر' : '🕒 DISPONIBILITÉ');
    L.push(ligne('•', ar ? 'نوع العمل' : 'Type de travail', liste(fiche.travail).join(', ')));
    L.push(ligne('•', ar ? 'متوفّرة من' : 'Disponible à partir du', ar ? dateLisibleAr(fiche.disponible) : dateLisible(fiche.disponible)));
    L.push(ligne('•', ar ? 'الأيام/الأسبوع' : 'Jours par semaine', fiche.jours));
    L.push(ligne('•', ar ? 'المدن المقبولة' : 'Villes acceptées', fiche.villesAcceptees));
    L.push('');
    L.push(ligne('🗣️', ar ? 'اللغات' : 'Langues', liste(fiche.langues).join(', ')));
    L.push(ligne('🧰', ar ? 'المهارات' : 'Compétences', liste(fiche.competences).join(', ')));
    L.push(ligne('📄', ar ? 'الوثائق' : 'Documents', liste(fiche.documents).join(', ')));
    L.push('');
    L.push(ar ? '👥 المراجع: مُرسَلة عبر البريد الإلكتروني (إلزامية).' : '👥 RÉFÉRENCES : envoyées par e-mail (obligatoires).');
    L.push(ligne('1.', fiche.ref1Nom, [fiche.ref1Lien, numTel(fiche.ref1Tel)].filter(Boolean).join(' — ')));
    L.push(ligne('2.', fiche.ref2Nom, [fiche.ref2Lien, numTel(fiche.ref2Tel)].filter(Boolean).join(' — ')));
    if (texte(fiche.message)) {
      L.push('');
      L.push(ar ? '📝 رسالة' : '📝 MESSAGE');
      L.push(fiche.message);
    }
    L.push('');
    L.push(ar ? '✅ الموافقة على استعمال المعطيات (القانون 09-08): نعم' : '✅ Consentement loi 09-08 : oui');
    return L.filter(function (l) { return l !== null && l !== undefined; }).join('\n').replace(/\n{3,}/g, '\n\n');
  }

  function sujetEmail(numero, fiche) {
    return 'Références dossier ' + numero + ' — ' + (texte(fiche.nomComplet) || 'candidat(e)') + ' — Yallah Services';
  }

  function messageEmail(fiche, numero) {
    var L = [];
    L.push('Bonjour Yallah Services,');
    L.push('');
    L.push('Je vous transmets les références de mon dossier ' + numero + '.');
    L.push('');
    L.push('CANDIDAT(E)');
    L.push('Nom : ' + oui(fiche.nomComplet));
    L.push('Téléphone / WhatsApp : ' + oui(numTel(fiche.telephone)));
    L.push('Ville : ' + oui(fiche.ville) + (texte(fiche.quartier) ? ' (' + fiche.quartier + ')' : ''));
    L.push('Métier souhaité : ' + oui(fiche.poste));
    L.push('');
    L.push('RÉFÉRENCE 1');
    L.push('Nom : ' + oui(fiche.ref1Nom));
    L.push('Lien : ' + oui(fiche.ref1Lien));
    L.push('Téléphone : ' + oui(numTel(fiche.ref1Tel)));
    L.push('');
    L.push('RÉFÉRENCE 2');
    L.push('Nom : ' + oui(fiche.ref2Nom));
    L.push('Lien : ' + oui(fiche.ref2Lien));
    L.push('Téléphone : ' + oui(numTel(fiche.ref2Tel)));
    L.push('');
    L.push("J'ai bien compris que sans ces références, ma candidature n'est ni validée ni présentée à un foyer.");
    L.push('');
    L.push('Merci de votre confiance,');
    L.push(oui(fiche.nomComplet));
    return L.join('\n');
  }

  function lienWhatsApp(fiche, numero, langue) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(messageWhatsApp(fiche, numero, langue));
  }

  function lienEmail(fiche, numero) {
    return 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(sujetEmail(numero, fiche)) +
      '&body=' + encodeURIComponent(messageEmail(fiche, numero));
  }

  /* ── Résumé (page de confirmation / espace recruteur) ── */
  var LIGNES = [
    ['nomComplet', 'Nom complet', 'الاسم الكامل'],
    ['telephone', 'Téléphone WhatsApp', 'هاتف واتساب'],
    ['ville', 'Ville', 'المدينة'],
    ['quartier', 'Quartier', 'الحي'],
    ['age', 'Âge', 'العمر'],
    ['origine', "Pays d'origine", 'بلد الأصل'],
    ['poste', 'Métier souhaité', 'المهنة المطلوبة'],
    ['experience', 'Expérience', 'الخبرة'],
    ['salaire', 'Prétention salariale', 'الأجر المطلوب'],
    ['logement', 'Logement', 'السكن'],
    ['travail', 'Type de travail', 'نوع العمل'],
    ['disponible', 'Disponible à partir du', 'متوفّرة من'],
    ['jours', 'Jours par semaine', 'الأيام في الأسبوع'],
    ['villesAcceptees', 'Villes acceptées', 'المدن المقبولة'],
    ['langues', 'Langues', 'اللغات'],
    ['competences', 'Compétences', 'المهارات'],
    ['documents', 'Documents fournis', 'الوثائق'],
    ['ref1Nom', 'Référence 1 — nom', 'المرجع 1 — الاسم'],
    ['ref1Lien', 'Référence 1 — lien', 'المرجع 1 — الصفة'],
    ['ref1Tel', 'Référence 1 — téléphone', 'المرجع 1 — الهاتف'],
    ['ref2Nom', 'Référence 2 — nom', 'المرجع 2 — الاسم'],
    ['ref2Lien', 'Référence 2 — lien', 'المرجع 2 — الصفة'],
    ['ref2Tel', 'Référence 2 — téléphone', 'المرجع 2 — الهاتف'],
    ['message', 'Message', 'رسالة']
  ];

  /* Libellés courts pour le tableau de confirmation */
  var COURTS = {
    nomComplet: ['Nom', 'الاسم'],
    telephone: ['Téléphone', 'الهاتف'],
    ville: ['Ville', 'المدينة'],
    age: ['Âge', 'العمر'],
    origine: ["Pays d'origine", 'بلد الأصل'],
    poste: ['Métier', 'المهنة'],
    experience: ['Expérience', 'الخبرة'],
    salaire: ['Salaire souhaité', 'الأجر المطلوب'],
    logement: ['Logement', 'السكن'],
    travail: ['Travail', 'العمل'],
    disponible: ['Disponible le', 'متوفّرة من'],
    jours: ['Jours/sem.', 'أيام/أسبوع'],
    langues: ['Langues', 'اللغات'],
    competences: ['Compétences', 'المهارات'],
    documents: ['Documents', 'الوثائق'],
    ref1Nom: ['Référence 1', 'المرجع 1'],
    ref1Tel: ['Tél. référence 1', 'هاتف المرجع 1'],
    ref2Nom: ['Référence 2', 'المرجع 2'],
    ref2Tel: ['Tél. référence 2', 'هاتف المرجع 2'],
    message: ['Message', 'رسالة']
  };

  function valeurAffichee(champ, valeur, langue) {
    if (Array.isArray(valeur)) return valeur.join(' · ');
    var v = texte(valeur);
    if (!v) return '—';
    if (champ === 'disponible') return estArabe(langue) ? dateLisibleAr(v) : dateLisible(v);
    if (champ === 'salaire') return v + (estArabe(langue) ? ' درهم/شهر' : ' DH/mois');
    if (champ === 'age') return v + (estArabe(langue) ? ' سنة' : ' ans');
    if (champ === 'telephone' || champ === 'ref1Tel' || champ === 'ref2Tel') return numTel(v);
    return v;
  }

  function resume(fiche, langue) {
    var out = [];
    Object.keys(COURTS).forEach(function (champ) {
      var paire = COURTS[champ];
      var v = valeurAffichee(champ, fiche[champ], langue);
      out.push({ champ: champ, libelle: paire[estArabe(langue) ? 1 : 0], valeur: v });
    });
    return out;
  }

  /* ── Stockage local de la dernière fiche ── */
  function sauverFiche(fiche, numero, mode) {
    try {
      global.sessionStorage.setItem(CLE_STOCKAGE, JSON.stringify({ fiche: fiche, numero: numero, mode: mode, quand: Date.now() }));
    } catch (e) { /* stockage indisponible */ }
  }

  function sauverFicheLocale(fiche, numero, mode) {
    sauverFiche(fiche, numero, mode);
    try { global.localStorage.setItem(CLE_STOCKAGE, JSON.stringify({ fiche: fiche, numero: numero, mode: mode, quand: Date.now() })); } catch (e) { /* ignore */ }
  }

  function lireFiche() {
    try {
      var brut = global.sessionStorage.getItem(CLE_STOCKAGE) || global.localStorage.getItem(CLE_STOCKAGE);
      return brut ? JSON.parse(brut) : null;
    } catch (e) { return null; }
  }

  /* Paramètre d'URL */
  function parametre(nom) {
    var m = new RegExp('[?&]' + nom + '=([^&#]*)').exec(global.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  /* ─────────── AFFICHAGE MULTILINGUE ───────────
     Quatre affichages : fr · dar (darija en lettres arabes, RTL) ·
     dar-latn (darija en lettres latines) · en. Les deux affichages
     darija s'appuient sur la version arabe déjà présente dans la page,
     que le moteur multilingue (assets/js/i18n.js) traduit ensuite si un
     dictionnaire existe.

     Convention dans le HTML :
       data-lang="fr|ar"        → nœuds des deux bases linguistiques
       data-fr / data-ar        → contenu texte d'un même élément
       data-fr-ph / data-ar-ph  → placeholder (sur l'input ou son conteneur)
       data-err-fr / data-err-ar→ message d'erreur d'un champ
       data-titre-fr / -ar sur <html> → titre du document
     Les éléments marqués data-lang="fr|ar" sont masqués par le CSS selon
     la base active (body.ys-fr / body.ys-ar). */
  var bilingue = (function () {
    var ALIAS = { ar: 'dar' };
    var VALIDES = { fr: 1, dar: 1, 'dar-latn': 1, en: 1 };
    var INFOS = {
      fr: { dir: 'ltr', htmlLang: 'fr-MA', base: 'fr' },
      dar: { dir: 'rtl', htmlLang: 'ar-MA', base: 'ar' },
      'dar-latn': { dir: 'ltr', htmlLang: 'ar-Latn-MA', base: 'ar' },
      en: { dir: 'ltr', htmlLang: 'en', base: 'fr' }
    };
    var langue = 'fr';
    var initialise = false;
    var ecouteurs = [];

    /* Renvoie le code valide, ou null si la valeur n'est pas une langue. */
    function normaliserCode(code) {
      var c = ALIAS[code] || code;
      return VALIDES[c] ? c : null;
    }

    try {
      var garde = normaliserCode(global.localStorage.getItem('ys_langue'));
      if (garde) langue = garde;
    } catch (e) { /* stockage refusé */ }

    function elements(selecteur) {
      return Array.prototype.slice.call(document.querySelectorAll(selecteur));
    }
    function infos() { return INFOS[normaliserCode(langue) || 'fr']; }
    function base() { return infos().base; }

    function appliquer(nouvelle) {
      var demandee = normaliserCode(nouvelle);
      if (demandee) langue = demandee;
      var i = infos();
      try { global.localStorage.setItem('ys_langue', langue); } catch (e) { /* ignore */ }

      document.documentElement.lang = i.htmlLang;
      document.documentElement.dir = i.dir;
      document.documentElement.setAttribute('data-ys-lang', langue);
      document.documentElement.setAttribute('data-ys-dir', i.dir);
      document.documentElement.setAttribute('data-ys-base', i.base);
      if (document.body) {
        document.body.classList.toggle('ys-fr', i.base === 'fr');
        document.body.classList.toggle('ys-ar', i.base === 'ar');
        document.body.setAttribute('data-ys-lang', langue);
      }

      elements('[data-fr][data-ar]').forEach(function (el) {
        el.textContent = el.getAttribute(i.base === 'ar' ? 'data-ar' : 'data-fr');
      });
      elements('[data-fr-ph]').forEach(function (el) {
        var v = el.getAttribute(i.base === 'ar' ? 'data-ar-ph' : 'data-fr-ph') || '';
        var cible = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')
          ? el : el.querySelector('input, textarea, select');
        if (cible) cible.setAttribute('placeholder', v);
      });
      elements('[data-err-fr]').forEach(function (el) {
        if (el.textContent) el.textContent = el.getAttribute(i.base === 'ar' ? 'data-err-ar' : 'data-err-fr') || '';
      });

      var titre = document.documentElement.getAttribute(i.base === 'ar' ? 'data-titre-ar' : 'data-titre-fr');
      if (titre) document.title = titre;

      var bf = document.getElementById('btnFr');
      var ba = document.getElementById('btnAr');
      if (bf) bf.classList.toggle('on', langue === 'fr');
      if (ba) ba.classList.toggle('on', langue === 'dar' || langue === 'dar-latn');

      ecouteurs.forEach(function (f) { try { f(langue); } catch (e) { /* ignore */ } });
    }

    return {
      langue: function () { return langue; },
      base: base,
      estArabe: estArabe,
      definir: appliquer,
      /* vrai sur les pages qui portent deux bases linguistiques
         (fiche candidat, confirmation) */
      pageBilingue: function () { return !!document.querySelector('[data-lang]'); },
      /* surChangement / surApplication : appelé après chaque application */
      surApplication: function (fn) { if (typeof fn === 'function') ecouteurs.push(fn); },
      initialiser: function (surChangement) {
        if (typeof surChangement === 'function') ecouteurs.push(surChangement);
        if (initialise) { appliquer(langue); return; }
        initialise = true;
        var bf = document.getElementById('btnFr');
        var ba = document.getElementById('btnAr');
        if (bf) bf.addEventListener('click', function () { appliquer('fr'); });
        if (ba) ba.addEventListener('click', function () { appliquer('dar'); });
        var code = normaliserCode(parametre('langue'));
        appliquer(code || langue);
      },
      /* Utilitaire : message d'erreur bilingue d'un champ */
      erreur: function (champ, messageFr, messageAr) {
        return (base() === 'ar') ? messageAr : messageFr;
      }
    };
  })();

  global.YSFiche = {
    config: { whatsapp: WA, whatsappAffiche: WA_AFFICHE, email: EMAIL },
    texte: texte,
    liste: liste,
    numTel: numTel,
    dateLisible: dateLisible,
    dateLisibleAr: dateLisibleAr,
    numeroLocal: numeroLocal,
    messageWhatsApp: messageWhatsApp,
    messageEmail: messageEmail,
    sujetEmail: sujetEmail,
    lienWhatsApp: lienWhatsApp,
    lienEmail: lienEmail,
    lignes: LIGNES,
    resume: resume,
    valeurAffichee: valeurAffichee,
    sauverFiche: sauverFiche,
    sauverFicheLocale: sauverFicheLocale,
    lireFiche: lireFiche,
    parametre: parametre,
    bilingue: bilingue
  };
})(window);
