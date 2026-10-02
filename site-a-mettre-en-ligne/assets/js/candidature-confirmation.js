/* ══════════════════════════════════════════════════════
   YALLAH SERVICES — Page de confirmation de candidature
   · Affiche le numéro de dossier
   · Prépare le message WhatsApp (fiche complète) et
     l'e-mail (références) déjà rédigés
   · Récapitulatif bilingue de la fiche
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var F = window.YSFiche;
  if (!F) return;

  var enregistrement = F.lireFiche();
  var enTete = document.getElementById('numeroDossier');
  if (!enTete) return;

  var annee = document.getElementById('annee');
  if (annee) annee.textContent = new Date().getFullYear();

  document.getElementById('btnImprimer').addEventListener('click', function () { window.print(); });

  if (!enregistrement || !enregistrement.fiche) {
    document.getElementById('sansFiche').hidden = false;
    F.bilingue.initialiser();
    return;
  }

  var fiche = enregistrement.fiche;
  var numero = enregistrement.numero || 'YS-0000-0000';
  var mode = enregistrement.mode || 'statique';

  enTete.textContent = numero;
  document.getElementById('blocDossier').hidden = false;

  var maintenant = new Date();
  var jour = ('0' + maintenant.getDate()).slice(-2) + '/' + ('0' + (maintenant.getMonth() + 1)).slice(-2) + '/' + maintenant.getFullYear();
  var iso = maintenant.getFullYear() + '-' + ('0' + (maintenant.getMonth() + 1)).slice(-2) + '-' + ('0' + maintenant.getDate()).slice(-2);
  document.getElementById('dateDossier').textContent = jour;
  document.getElementById('dateDossierAr').textContent = F.dateLisibleAr(iso);

  /* ── Liens préparés ── */
  var lienWhatsApp = document.getElementById('lienWhatsApp');
  var lienEmail = document.getElementById('lienEmail');
  // La langue du message suit celle de la page au moment du clic.
  function rafraichirLiens(langue) {
    lienWhatsApp.href = F.lienWhatsApp(fiche, numero, langue);
    lienEmail.href = F.lienEmail(fiche, numero);
  }
  rafraichirLiens(F.bilingue.langue());
  document.getElementById('sujetEmail').textContent = F.sujetEmail(numero, fiche);
  document.getElementById('sujetEmailAr').textContent = F.sujetEmail(numero, fiche);

  /* ── Copie du numéro ── */
  var boutonCopier = document.getElementById('btnCopier');
  boutonCopier.addEventListener('click', function () {
    var ok = document.getElementById('copieOk');
    function afficherOk() { ok.hidden = false; setTimeout(function () { ok.hidden = true; }, 4000); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(numero).then(afficherOk, function () { afficherOk(); });
    } else {
      var zone = document.createElement('textarea');
      zone.value = numero;
      document.body.appendChild(zone);
      zone.select();
      try { document.execCommand('copy'); } catch (e) { /* ignore */ }
      document.body.removeChild(zone);
      afficherOk();
    }
  });

  /* ── Récapitulatif ── */
  var corps = document.querySelector('#tableRecap tbody');
  function estArabe(langue) { return F.bilingue.estArabe ? F.bilingue.estArabe(langue) : langue === 'ar'; }

  function remplirTableau(langue) {
    var lignes = F.resume(fiche, langue);
    corps.innerHTML = '';
    lignes.forEach(function (ligne) {
      if (!ligne.valeur || ligne.valeur === '—') return;
      var tr = document.createElement('tr');
      var th = document.createElement('th');
      th.setAttribute('scope', 'row');
      th.textContent = ligne.libelle;
      var td = document.createElement('td');
      td.textContent = ligne.valeur;
      tr.appendChild(th);
      tr.appendChild(td);
      corps.appendChild(tr);
    });
    /* Les références sont rappelées avec insistance */
    var trRef = document.createElement('tr');
    var thRef = document.createElement('th');
    thRef.setAttribute('scope', 'row');
    thRef.textContent = estArabe(langue) ? 'حالة المراجع' : 'Références';
    var tdRef = document.createElement('td');
    var completes = F.numTel(fiche.ref1Tel) && F.numTel(fiche.ref2Tel) && fiche.ref1Nom && fiche.ref2Nom;
    tdRef.textContent = completes
      ? (estArabe(langue) ? 'مُدرَجة في هذه الاستمارة — تُرسَل عبر البريد الإلكتروني' : 'Complètes — à envoyer par e-mail (action 2)')
      : (estArabe(langue) ? 'ناقصة' : 'Incomplètes');
    trRef.appendChild(thRef);
    trRef.appendChild(tdRef);
    corps.appendChild(trRef);
  }

  /* ── Bandeau « envoyée » selon le mode ── */
  if (mode === 'serveur') {
    var bandeau = document.querySelector('.ys-topbar span');
    if (bandeau) bandeau.setAttribute('data-lang', 'fr');
  }

  F.bilingue.initialiser(function (langue) {
    rafraichirLiens(langue);
    remplirTableau(langue);
  });
})();
