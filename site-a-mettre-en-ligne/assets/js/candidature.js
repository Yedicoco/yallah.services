/* ══════════════════════════════════════════════════════
   YALLAH SERVICES — Fiche de candidature
   · Affichage bilingue français / arabe (RTL)
   · Validation côté client (le serveur revalide)
   · Envoi vers POST /api/candidature quand le serveur est là,
     sinon génération locale du numéro de dossier (site statique)
   · Redirection vers la page de confirmation
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var F = window.YSFiche;
  var CONFIG = window.YS_CONFIG || {};
  var CLE_MODE = 'ys_mode_site';
  var page = document.body;
  var formulaire = document.getElementById('formCandidature');
  if (!F || !formulaire) return;

  var langue = 'fr';
  try {
    var enregistree = window.localStorage.getItem('ys_langue');
    if (enregistree === 'ar' || enregistree === 'fr') langue = enregistree;
  } catch (e) { /* ignore */ }

  /* ─────────── MESSAGES D'ERREUR BILINGUES ─────────── */
  var ERREURS = {
    nomComplet: ['Indiquez votre nom complet (3 lettres minimum).', 'اكتبي اسمك الكامل (3 أحرف على الأقل).'],
    telephone: ['Numéro invalide : saisissez au moins 8 chiffres.', 'رقم غير صحيح: أدخلي 8 أرقام على الأقل.'],
    ville: ['Choisissez votre ville.', 'اختاري مدينتك.'],
    age: ['Indiquez un âge entre 18 et 70 ans.', 'أدخلي عمرًا بين 18 و70 سنة.'],
    poste: ['Choisissez le métier souhaité.', 'اختاري المهنة المطلوبة.'],
    experience: ['Indiquez votre expérience.', 'حدّدي خبرتك.'],
    salaire: ['Montant entre 1 000 et 20 000 DH.', 'المبلغ بين 1000 و20000 درهم.'],
    logement: ['Précisez logée ou non logée.', 'حدّدي إن كنت مقيمة أو غير مقيمة.'],
    travail: ['Cochez au moins un type de travail.', 'اختاري نوع عمل واحدًا على الأقل.'],
    disponible: ['Indiquez une date de disponibilité.', 'حدّدي تاريخ التوفّر.'],
    ref1Nom: ['Indiquez le nom de la référence 1.', 'اكتبي اسم المرجع الأول.'],
    ref1Lien: ['Précisez le lien avec la référence 1.', 'حدّدي صفة العلاقة بالمرجع الأول.'],
    ref1Tel: ['Numéro de la référence 1 invalide.', 'رقم المرجع الأول غير صحيح.'],
    ref2Nom: ['Indiquez le nom de la référence 2.', 'اكتبي اسم المرجع الثاني.'],
    ref2Lien: ['Précisez le lien avec la référence 2.', 'حدّدي صفة العلاقة بالمرجع الثاني.'],
    ref2Tel: ['Numéro de la référence 2 invalide.', 'رقم المرجع الثاني غير صحيح.'],
    consentement: ['Le consentement est obligatoire pour envoyer la fiche.', 'الموافقة إلزامية لإرسال الاستمارة.']
  };

  var TEXTES = {
    envoiEnCours: ['Envoi de la fiche…', 'جاري إرسال الاستمارة…'],
    envoiBouton: ['📩 Envoyer ma fiche et obtenir mon numéro de dossier', '📩 إرسال الاستمارة والحصول على رقم الملفّ'],
    erreurGenerale: ["L'envoi a échoué. Vérifiez votre connexion puis réessayez, ou envoyez votre fiche directement sur WhatsApp.",
                     'فشل الإرسال. تحقّقي من الاتصال ثم أعيدي المحاولة، أو أرسلي استمارتك مباشرة عبر واتساب.'],
    tropDeDemandes: ['Trop d\'envois depuis cette connexion (12 par heure maximum). Réessayez plus tard ou écrivez-nous sur WhatsApp.',
                     'عدد كبير من الإرسالات من هذا الاتصال (12 في الساعة كحدّ أقصى). أعيدي المحاولة لاحقًا أو راسلينا على واتساب.'],
    consentementManquant: ['Merci de cocher la case de consentement (loi 09-08).', 'المرجو الموافقة (القانون 09-08).'],
    referencesManquantes: ['Les deux références complètes sont obligatoires.', 'المرجعان كاملان إلزاميان.']
  };

  function t(paire) { return paire[langue === 'ar' ? 1 : 0]; }

  /* ─────────── BASCULE DE LANGUE (moteur partagé) ─────────── */
  function apresChangementLangue(nouvelle) {
    langue = nouvelle;

    var bouton = document.getElementById('btnEnvoyer');
    if (bouton && !bouton.dataset.enCours) bouton.innerHTML = t(TEXTES.envoiBouton);

    /* Les messages d'erreur sont régénérés dans la langue active */
    Array.prototype.forEach.call(formulaire.querySelectorAll('.ys-champ.erreur'), function (bloc) {
      var zone = bloc.querySelector('.ys-msg-erreur');
      var paire = ERREURS[bloc.getAttribute('data-champ')];
      if (zone && paire) zone.textContent = t(paire);
    });
    var externe = formulaire.querySelector('.ys-msg-erreur[data-champ="consentement"]');
    var caseConsentement = document.getElementById('consentement');
    if (externe && caseConsentement && caseConsentement.classList.contains('ys-erreur')) {
      externe.textContent = t(ERREURS.consentement);
    }
    var general = document.getElementById('messageGeneral');
    if (general && !general.hidden) {
      if (general.dataset.type === 'trop') general.textContent = t(TEXTES.tropDeDemandes);
      else if (general.dataset.type === 'erreur') general.textContent = t(TEXTES.erreurGenerale);
    }
  }

  /* ─────────── LECTURE DU FORMULAIRE ─────────── */
  function uneValeur(nom) {
    var el = formulaire.elements[nom];
    return el ? F.texte(el.value) : '';
  }
  function plusieursValeurs(nom) {
    var els = formulaire.querySelectorAll('[name="' + nom + '"]:checked');
    return Array.prototype.map.call(els, function (el) { return el.value; });
  }
  function lireFiche() {
    return {
      nomComplet: uneValeur('nomComplet'),
      telephone: uneValeur('telephone'),
      ville: uneValeur('ville'),
      quartier: uneValeur('quartier'),
      age: uneValeur('age'),
      origine: uneValeur('origine'),
      poste: uneValeur('poste'),
      experience: uneValeur('experience'),
      salaire: uneValeur('salaire'),
      logement: uneValeur('logement'),
      travail: plusieursValeurs('travail'),
      disponible: uneValeur('disponible'),
      jours: uneValeur('jours'),
      villesAcceptees: uneValeur('villesAcceptees'),
      langues: plusieursValeurs('langues'),
      competences: plusieursValeurs('competences'),
      documents: plusieursValeurs('documents'),
      ref1Nom: uneValeur('ref1Nom'),
      ref1Lien: uneValeur('ref1Lien'),
      ref1Tel: uneValeur('ref1Tel'),
      ref2Nom: uneValeur('ref2Nom'),
      ref2Lien: uneValeur('ref2Lien'),
      ref2Tel: uneValeur('ref2Tel'),
      message: uneValeur('message'),
      consentement: formulaire.elements.consentement && formulaire.elements.consentement.checked ? 'oui' : '',
      site_web: uneValeur('site_web'),
      langue: langue
    };
  }

  /* ─────────── VALIDATION ─────────── */
  function telValide(v) {
    var n = F.numTel(v);
    var chiffres = (n.match(/\d/g) || []).length;
    return chiffres >= 8 && chiffres <= 15;
  }
  function dateValide(v) {
    return /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v + 'T00:00:00').getTime());
  }

  function valider(fiche) {
    var e = {};
    if (fiche.nomComplet.length < 3) e.nomComplet = 1;
    if (!telValide(fiche.telephone)) e.telephone = 1;
    if (!fiche.ville) e.ville = 1;
    var age = parseInt(fiche.age, 10);
    if (!age || age < 18 || age > 70) e.age = 1;
    if (!fiche.poste) e.poste = 1;
    if (!fiche.experience) e.experience = 1;
    if (fiche.salaire !== '') {
      var sal = parseInt(fiche.salaire, 10);
      if (!sal || sal < 1000 || sal > 20000) e.salaire = 1;
    }
    if (!fiche.logement) e.logement = 1;
    if (fiche.travail.length === 0) e.travail = 1;
    if (!dateValide(fiche.disponible)) e.disponible = 1;
    if (fiche.ref1Nom.length < 3) e.ref1Nom = 1;
    if (!fiche.ref1Lien) e.ref1Lien = 1;
    if (!telValide(fiche.ref1Tel)) e.ref1Tel = 1;
    if (fiche.ref2Nom.length < 3) e.ref2Nom = 1;
    if (!fiche.ref2Lien) e.ref2Lien = 1;
    if (!telValide(fiche.ref2Tel)) e.ref2Tel = 1;
    if (fiche.consentement !== 'oui') e.consentement = 1;
    return e;
  }

  function nettoyerErreurs() {
    Array.prototype.forEach.call(formulaire.querySelectorAll('.ys-champ.erreur'), function (el) {
      el.classList.remove('erreur');
    });
    Array.prototype.forEach.call(formulaire.querySelectorAll('.ys-msg-erreur'), function (el) {
      if (el.closest('.ys-champ') || el.getAttribute('data-champ')) el.textContent = '';
    });
    var general = document.getElementById('messageGeneral');
    if (general) { general.hidden = true; general.dataset.type = ''; }
  }

  function afficherErreurs(erreurs, messagesServeur) {
    var premier = null;
    Object.keys(erreurs).forEach(function (champ) {
      var bloc = formulaire.querySelector('.ys-champ[data-champ="' + champ + '"]');
      var zone = bloc ? bloc.querySelector('.ys-msg-erreur') : formulaire.querySelector('.ys-msg-erreur[data-champ="' + champ + '"]');
      var paire = ERREURS[champ];
      var message = paire ? t(paire) : (messagesServeur && messagesServeur[champ]) || t(TEXTES.erreurGenerale);
      if (bloc) bloc.classList.add('erreur');
      if (zone) zone.textContent = message;
      if (champ === 'consentement') {
        var caseConsentement = document.getElementById('consentement');
        if (caseConsentement) caseConsentement.classList.add('ys-erreur');
      }
      if (!premier) premier = bloc || zone;
    });
    if (premier) {
      premier.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (premier.classList.contains('ys-champ')) {
        premier.classList.add('ys-secu');
        setTimeout(function () { premier.classList.remove('ys-secu'); }, 500);
      }
    }
    return Object.keys(erreurs).length;
  }

  function afficherMessageGeneral(type, texte) {
    var general = document.getElementById('messageGeneral');
    if (!general) return;
    general.dataset.type = type || '';
    general.textContent = texte || t(type === 'trop' ? TEXTES.tropDeDemandes : TEXTES.erreurGenerale);
    general.hidden = false;
    general.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ─────────── DÉTECTION DU MODE (serveur ou statique) ─────────── */
  function interrogerServeur() {
    return new Promise(function (resolve) {
      if (CONFIG.mode === 'statique') { resolve('statique'); return; }
      if (CONFIG.mode === 'serveur') { resolve('serveur'); return; }
      try {
        if (window.localStorage.getItem(CLE_MODE) === 'statique') { resolve('statique'); return; }
      } catch (e) { /* ignore */ }
      var minuteur = setTimeout(function () { resolve('statique'); }, 2500);
      fetch('api/sante', { headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          clearTimeout(minuteur);
          resolve(d && d.ok ? 'serveur' : 'statique');
        })
        .catch(function () {
          clearTimeout(minuteur);
          try { window.localStorage.setItem(CLE_MODE, 'statique'); } catch (e) { /* ignore */ }
          resolve('statique');
        });
    });
  }

  /* ─────────── ENVOI ─────────── */
  function enregistrerEtRediriger(fiche, numero, mode) {
    F.sauverFicheLocale(fiche, numero, mode);
    var cible = 'candidature-confirmation.html?numero=' + encodeURIComponent(numero) + '&langue=' + langue;
    window.location.href = cible;
  }

  var enCours = false;
  formulaire.addEventListener('submit', function (evenement) {
    evenement.preventDefault();
    if (enCours) return;
    nettoyerErreurs();

    var fiche = lireFiche();

    /* Piège anti-robots : si rempli, on fait comme si tout allait bien
       sans rien enregistrer (le robot ne reçoit aucune erreur). */
    if (fiche.site_web !== '') {
      enregistrerEtRediriger(fiche, 'YS-' + new Date().getFullYear() + '-0000', 'statique');
      return;
    }

    var erreurs = valider(fiche);
    if (Object.keys(erreurs).length > 0) {
      afficherErreurs(erreurs);
      return;
    }

    var bouton = document.getElementById('btnEnvoyer');
    enCours = true;
    if (bouton) {
      bouton.dataset.enCours = '1';
      bouton.setAttribute('aria-disabled', 'true');
      bouton.innerHTML = t(TEXTES.envoiEnCours);
    }

    interrogerServeur().then(function (mode) {
      if (mode === 'statique') {
        /* Site statique : numéro local, la fiche part ensuite par WhatsApp et e-mail. */
        var numero = F.numeroLocal();
        enregistrerEtRediriger(fiche, numero, 'statique');
        return;
      }
      return fetch('api/candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(fiche)
      }).then(function (reponse) {
        return reponse.json().catch(function () { return {}; }).then(function (donnees) {
          if (reponse.status === 201 && donnees.numero) {
            enregistrerEtRediriger(fiche, donnees.numero, 'serveur');
            return;
          }
          enCours = false;
          if (bouton) {
            bouton.removeAttribute('data-enCours');
            bouton.removeAttribute('aria-disabled');
            bouton.innerHTML = t(TEXTES.envoiBouton);
          }
          if (reponse.status === 429) { afficherMessageGeneral('trop'); return; }
          if (reponse.status === 422 && donnees.erreurs) {
            afficherErreurs(donnees.erreurs, donnees.messages);
            return;
          }
          afficherMessageGeneral('erreur');
        });
      });
    }).catch(function () {
      enCours = false;
      if (bouton) {
        bouton.removeAttribute('data-enCours');
        bouton.removeAttribute('aria-disabled');
        bouton.innerHTML = t(TEXTES.envoiBouton);
      }
      afficherMessageGeneral('erreur');
    });
  });

  /* Efface l'erreur d'un champ dès qu'on le corrige */
  Array.prototype.forEach.call(formulaire.querySelectorAll('.ys-input, .ys-select, .ys-textarea, input[type="checkbox"]'), function (el) {
    el.addEventListener('input', function () {
      var bloc = el.closest('.ys-champ');
      if (bloc) bloc.classList.remove('erreur');
      var zone = bloc ? bloc.querySelector('.ys-msg-erreur') : null;
      if (zone) zone.textContent = '';
    });
    el.addEventListener('change', function () {
      var bloc = el.closest('.ys-champ');
      if (bloc) bloc.classList.remove('erreur');
      var zone = bloc ? bloc.querySelector('.ys-msg-erreur') : null;
      if (zone) zone.textContent = '';
    });
  });

  /* Date minimale = aujourd'hui */
  var champDate = document.getElementById('disponible');
  if (champDate) {
    var aujourdhui = new Date();
    var iso = aujourdhui.getFullYear() + '-' + ('0' + (aujourdhui.getMonth() + 1)).slice(-2) + '-' + ('0' + aujourdhui.getDate()).slice(-2);
    champDate.min = iso;
  }

  var annee = document.getElementById('annee');
  if (annee) annee.textContent = new Date().getFullYear();

  /* Active l'affichage bilingue (français par défaut, arabe mémorisé) */
  F.bilingue.initialiser(apresChangementLangue);
})();
