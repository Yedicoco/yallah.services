/* ══════════════════════════════════════════════════════
   YALLAH SERVICES — Espace recruteur
   · Clé d'accès ADMIN_KEY (jamais stockée côté serveur en clair)
   · Statistiques : dossiers reçus, poste le plus demandé,
     contacts disponibles, références complètes
   · Recherche instantanée, contact WhatsApp / e-mail, export CSV,
     suppression d'un dossier (droit à l'effacement — loi 09-08)
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var F = window.YSFiche;
  if (!F) return;

  var CLE_STOCKAGE = 'ys_admin_cle';
  var donnees = { candidatures: [], statistiques: {}, contacts: {} };
  var filtre = '';

  var ecranCle = document.getElementById('ecranCle');
  var ecranAdmin = document.getElementById('ecranAdmin');
  var champCle = document.getElementById('champCle');
  var erreurCle = document.getElementById('erreurCle');
  var messageAdmin = document.getElementById('messageAdmin');
  var champRecherche = document.getElementById('champRecherche');
  var liste = document.getElementById('liste');
  var vide = document.getElementById('vide');
  var stats = document.getElementById('stats');

  document.getElementById('annee').textContent = new Date().getFullYear();

  /* ─────────── CLÉ D'ACCÈS ─────────── */
  function cleEnregistree() {
    try { return window.sessionStorage.getItem(CLE_STOCKAGE) || ''; } catch (e) { return ''; }
  }
  function enregistrerCle(cle) {
    try { window.sessionStorage.setItem(CLE_STOCKAGE, cle); } catch (e) { /* ignore */ }
  }
  function effacerCle() {
    try { window.sessionStorage.removeItem(CLE_STOCKAGE); } catch (e) { /* ignore */ }
  }

  /* La clé peut aussi arriver par le lien direct ?cle=… (retirée de l'URL ensuite) */
  var cleUrl = F.parametre('cle') || F.parametre('key');
  if (cleUrl) {
    enregistrerCle(cleUrl);
    try { window.history.replaceState({}, document.title, window.location.pathname); } catch (e) { /* ignore */ }
  }

  function entetes() {
    return { 'Accept': 'application/json', 'X-Admin-Key': cleEnregistree() };
  }

  /* ─────────── CHARGEMENT ─────────── */
  function afficherMessage(texteMessage) {
    if (!texteMessage) { messageAdmin.hidden = true; messageAdmin.textContent = ''; return; }
    messageAdmin.textContent = texteMessage;
    messageAdmin.hidden = false;
  }

  function charger() {
    return fetch('api/admin/candidatures', { headers: entetes() })
      .then(function (reponse) {
        if (reponse.status === 403) {
          effacerCle();
          montrerCle("Clé invalide ou expirée. Saisissez la clé ADMIN_KEY du serveur.");
          throw new Error('cle');
        }
        if (!reponse.ok) throw new Error('serveur');
        return reponse.json();
      })
      .then(function (charge) {
        donnees = charge;
        montrerAdmin();
        afficherMessage('');
        dessiner();
      })
      .catch(function (erreur) {
        if (erreur.message === 'cle') return;
        if (erreur.message === 'serveur') {
          montrerAdmin();
          afficherMessage("Lecture impossible. Vérifiez que le serveur est bien lancé (node server.js) puis cliquez sur « Rafraîchir ».");
        }
      });
  }

  function montrerCle(message) {
    ecranCle.hidden = false;
    ecranAdmin.hidden = true;
    erreurCle.textContent = message || '';
    erreurCle.hidden = !message;
    champCle.value = '';
    champCle.focus();
  }

  function montrerAdmin() {
    ecranCle.hidden = true;
    ecranAdmin.hidden = false;
  }

  document.getElementById('btnValiderCle').addEventListener('click', function () {
    var valeur = champCle.value.trim();
    if (!valeur) { erreurCle.textContent = 'Saisissez la clé.'; erreurCle.hidden = false; return; }
    enregistrerCle(valeur);
    erreurCle.hidden = true;
    charger();
  });
  champCle.addEventListener('keydown', function (evenement) {
    if (evenement.key === 'Enter') document.getElementById('btnValiderCle').click();
  });
  document.getElementById('btnQuitter').addEventListener('click', function () {
    effacerCle();
    donnees = { candidatures: [], statistiques: {}, contacts: {} };
    montrerCle('Vous êtes déconnecté(e) de l\'espace recruteur.');
  });
  document.getElementById('btnRafraichir').addEventListener('click', function () { charger(); });

  /* ─────────── EXPORT CSV ─────────── */
  document.getElementById('btnExport').addEventListener('click', function () {
    if (!cleEnregistree()) { montrerCle('Saisissez d\'abord la clé.'); return; }
    var lien = 'api/admin/export.csv?cle=' + encodeURIComponent(cleEnregistree());
    window.location.href = lien;
  });

  /* ─────────── STATISTIQUES ─────────── */
  function dessiner() {
    var s = donnees.statistiques || {};
    var cartes = [
      ['📥', s.total || 0, 'Candidatures reçues'],
      ['💼', s.postePlusDemande || '—', 'Poste le plus demandé'],
      ['📞', s.contactsDisponibles || 0, 'Contacts WhatsApp disponibles'],
      ['👥', s.referencesCompletes || 0, 'Références complètes (2)'],
      ['📍', s.villePrincipale || '—', 'Ville la plus représentée']
    ];
    stats.innerHTML = '';
    cartes.forEach(function (carte) {
      var bloc = document.createElement('div');
      bloc.className = 'ys-stat';
      var nombre = document.createElement('div');
      nombre.className = 'ys-stat-n';
      nombre.style.fontSize = String(carte[1]).length > 14 ? '20px' : '';
      nombre.textContent = carte[1];
      var libelle = document.createElement('div');
      libelle.className = 'ys-stat-l';
      libelle.textContent = carte[0] + ' ' + carte[2];
      bloc.appendChild(nombre);
      bloc.appendChild(libelle);
      stats.appendChild(bloc);
    });

    var contacts = donnees.contacts || {};
    document.getElementById('piedContacts').textContent =
      'WhatsApp candidats ' + (contacts.whatsapp || '') + ' · ' + (contacts.email || '');

    dessinerListe();
  }

  /* ─────────── LISTE DES DOSSIERS ─────────── */
  function texteRecherche(candidature) {
    var fiche = candidature.fiche || {};
    var morceaux = [candidature.numero, fiche.nomComplet, fiche.telephone, fiche.ville, fiche.quartier,
      fiche.poste, fiche.experience, fiche.logement, fiche.message, fiche.ref1Nom, fiche.ref2Nom,
      (fiche.travail || []).join(' '), (fiche.competences || []).join(' '), (fiche.langues || []).join(' '),
      fiche.villesAcceptees, fiche.jours, fiche.origine];
    return morceaux.join(' ').toLowerCase();
  }

  function bouton(libelle, classe, action) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ys-btn ' + (classe || 'ys-btn-ghost');
    b.textContent = libelle;
    b.addEventListener('click', action);
    return b;
  }

  function ligne(etiquette, valeur) {
    var v = Array.isArray(valeur) ? valeur.join(' · ') : (valeur || '—');
    return etiquette + ' : ' + v;
  }

  function dessinerListe() {
    var recherche = filtre.trim().toLowerCase();
    var elements = (donnees.candidatures || []).filter(function (candidature) {
      return !recherche || texteRecherche(candidature).indexOf(recherche) !== -1;
    });

    liste.innerHTML = '';
    vide.hidden = elements.length !== 0;
    vide.textContent = (donnees.candidatures || []).length === 0
      ? 'Aucun dossier pour le moment.'
      : 'Aucun dossier ne correspond à « ' + filtre + ' ».';

    elements.forEach(function (candidature) {
      var fiche = candidature.fiche || {};
      var carte = document.createElement('article');
      carte.className = 'ys-fiche';

      var tete = document.createElement('div');
      tete.className = 'ys-fiche-head';
      var gauche = document.createElement('div');
      var numero = document.createElement('div');
      numero.className = 'ys-fiche-num';
      numero.textContent = candidature.numero || '—';
      var nom = document.createElement('div');
      nom.className = 'ys-fiche-nom';
      nom.textContent = fiche.nomComplet || '—';
      gauche.appendChild(numero);
      gauche.appendChild(nom);

      var droite = document.createElement('div');
      var date = document.createElement('span');
      date.className = 'ys-badge';
      date.textContent = '🗓️ ' + (candidature.recuLe || '').slice(0, 10);
      var complet = document.createElement('span');
      complet.className = 'ys-badge';
      var references = F.numTel(fiche.ref1Tel) && F.numTel(fiche.ref2Tel) && fiche.ref1Nom && fiche.ref2Nom;
      complet.textContent = references ? '✅ Références complètes' : '⚠️ Références à compléter';
      droite.appendChild(date);
      droite.appendChild(document.createTextNode(' '));
      droite.appendChild(complet);

      tete.appendChild(gauche);
      tete.appendChild(droite);

      var meta = document.createElement('div');
      meta.className = 'ys-fiche-meta';
      [
        ligne('💼 Poste', fiche.poste),
        ligne('📍 Ville', fiche.ville + (fiche.quartier ? ' (' + fiche.quartier + ')' : '')),
        ligne('🎂 Âge', fiche.age ? fiche.age + ' ans' : ''),
        ligne('⭐ Expérience', fiche.experience),
        ligne('💰 Salaire souhaité', fiche.salaire ? fiche.salaire + ' DH/mois' : ''),
        ligne('🏠 Logement', fiche.logement),
        ligne('🕒 Disponible', F.dateLisible(fiche.disponible)),
        ligne('⏱️ Travail', fiche.travail),
        ligne('📄 Documents', fiche.documents),
        ligne('👤 Référence 1', fiche.ref1Nom ? fiche.ref1Nom + ' (' + (fiche.ref1Lien || '—') + ') — ' + F.numTel(fiche.ref1Tel) : ''),
        ligne('👤 Référence 2', fiche.ref2Nom ? fiche.ref2Nom + ' (' + (fiche.ref2Lien || '—') + ') — ' + F.numTel(fiche.ref2Tel) : '')
      ].forEach(function (ligneTexte) {
        var bloc = document.createElement('div');
        bloc.textContent = ligneTexte;
        meta.appendChild(bloc);
      });
      carte.appendChild(meta);

      if (fiche.message) {
        var message = document.createElement('div');
        message.className = 'ys-fiche-meta';
        message.style.marginTop = '8px';
        message.textContent = '📝 ' + fiche.message;
        carte.appendChild(message);
      }

      var actions = document.createElement('div');
      actions.className = 'ys-fiche-actions';

      var numeroTel = F.numTel(fiche.telephone);
      if (numeroTel) {
        actions.appendChild(bouton('💬 WhatsApp candidat', 'ys-btn-wa', function () {
          var message = 'Bonjour ' + (fiche.nomComplet || '') + ', Yallah Services au sujet de votre dossier ' +
            (candidature.numero || '') + '.';
          window.open('https://wa.me/' + numeroTel.replace(/^\+/, '') + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
        }));
      }
      actions.appendChild(bouton('✉️ E-mail (références)', 'ys-btn-mail', function () {
        var sujet = 'Dossier ' + (candidature.numero || '') + ' — ' + (fiche.nomComplet || '');
        var corps = 'Bonjour,\n\nNous avons bien reçu votre dossier ' + (candidature.numero || '') +
          ". Merci de nous envoyer vos références si ce n'est pas déjà fait.\n\nYallah Services";
        window.location.href = 'mailto:?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(corps);
      }));

      var refTel = F.numTel(fiche.ref1Tel);
      if (refTel) {
        actions.appendChild(bouton('📞 Appeler réf. 1', 'ys-btn-ghost', function () {
          window.location.href = 'tel:' + refTel;
        }));
      }
      var refTel2 = F.numTel(fiche.ref2Tel);
      if (refTel2) {
        actions.appendChild(bouton('📞 Appeler réf. 2', 'ys-btn-ghost', function () {
          window.location.href = 'tel:' + refTel2;
        }));
      }

      actions.appendChild(bouton('🗑️ Supprimer le dossier', 'ys-btn-ghost', function () {
        if (!window.confirm('Supprimer définitivement le dossier ' + (candidature.numero || '') + ' ?\n\nÀ faire notamment en cas de demande d\'effacement (loi 09-08).')) return;
        fetch('api/admin/candidature/' + encodeURIComponent(candidature.numero), {
          method: 'DELETE',
          headers: entetes()
        }).then(function (reponse) {
          if (reponse.status === 403) { effacerCle(); montrerCle('Clé invalide. Saisissez-la à nouveau.'); return; }
          if (!reponse.ok) { afficherMessage('Suppression impossible pour ' + candidature.numero + '.'); return; }
          afficherMessage('Dossier ' + candidature.numero + ' supprimé définitivement.');
          charger();
        }).catch(function () {
          afficherMessage('Suppression impossible : serveur injoignable.');
        });
      }));

      carte.appendChild(tete);
      carte.appendChild(actions);
      liste.appendChild(carte);
    });
  }

  champRecherche.addEventListener('input', function () {
    filtre = champRecherche.value;
    dessinerListe();
  });

  /* ─────────── DÉMARRAGE ─────────── */
  if (cleEnregistree()) {
    charger();
  } else {
    montrerCle('');
  }
})();
