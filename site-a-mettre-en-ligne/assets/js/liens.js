/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Liens de rubriques partageables

   Chaque rubrique du site porte un lien stable (une ancre, ou une page
   entière). Ce module permet de le récupérer d'un clic, pour le coller
   ensuite sur WhatsApp ou dans un e-mail, sans avoir à retrouver
   l'adresse à la main.

   Deux usages :

   1. Sur une page du site — un bouton « 🔗 Copier le lien » pose sur
      chaque rubrique. Il est déclaré dans le HTML :
          <button class="ys-partage" data-partage="packs">…</button>
      Le module en déduit l'adresse absolue de la rubrique et la copie.

   2. Sur la page « Liens à partager » (liens-partage.html) — chaque
      ligne porte data-lien (le lien à copier) et data-libelle (le nom
      de la rubrique, repris dans le message WhatsApp).

   L'adresse est toujours reconstruite sur le domaine canonique du site
   (<link rel="canonical">), jamais sur celui du visiteur : un lien
   collé sur WhatsApp doit continuer à marcher une fois chez le client,
      même si le lien a été ouvert depuis un autre hébergeur ou depuis
   un fichier local.

   Aucune dépendance. Le texte des messages est écrit en français dans
   ce fichier : les clés libres (« _extra ») des dictionnaires le
   traduisent ensuite (voir outils/generer-i18n.js).
══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─────────── Domaine canonique ─────────── */

  /* Le domaine de publication, lu dans le canonical de la page. C'est la
     seule source fiable : le site est multipage, éventuellement déplacé,
     et le lien partagé doit pointer là où le site est réellement en ligne. */
  function domaine() {
    var canonique = document.querySelector('link[rel="canonical"]');
    if (canonique && canonique.href) {
      try { return new URL(canonique.href).origin; } catch (e) { /* URL invalide */ }
    }
    /* Repli : l'origine de la page servie (aperçu local, ouverture par
       fichier). Le lien reste utilisable, il part simplement du serveur
       qui a été ouvert. */
    if (window.location && window.location.origin && window.location.origin !== 'null') {
      return window.location.origin;
    }
    return '';
  }

  /* Page courante, sans ancre ni requête : « https://domaine/index.html ». */
  function pageActuelle() {
    var chemin = (window.location.pathname || '/').split('#')[0].split('?')[0];
    if (domaine()) {
      try { return new URL(chemin, domaine() + '/').href.replace(/\/$/, '/index.html'); } catch (e) { /* repli ci-dessous */ }
    }
    return chemin;
  }

  /* Adresse absolue d'une rubrique.
       lien('packs')            → https://domaine/index.html#packs
       lien('index.html#packs') → https://domaine/index.html#packs
       lien('candidature.html') → https://domaine/candidature.html */
  function lien(cible) {
    var base = pageActuelle();
    if (!cible) return base;
    if (/^(https?:)?\/\//i.test(cible)) return cible;
    if (cible.charAt(0) === '#') return base.split('#')[0] + cible;

    var bout = cible.indexOf('#');
    var ancre = bout === -1 ? '' : cible.slice(bout);
    var fichier = bout === -1 ? cible : cible.slice(0, bout);

    /* Ni slash ni extension : c'est le nom d'une ancre, pas d'un fichier.
       Les boutons de l'accueil écrivent data-partage="packs" (et non
       "#packs") : sans ce test, l'adresse deviendrait
       https://domaine/packs, une page qui n'existe pas. */
    if (!fichier || (fichier.indexOf('/') === -1 && !/\.[a-z0-9]+$/i.test(fichier))) {
      return base.split('#')[0] + '#' + fichier + ancre;
    }
    /* index.html se garde dans l'adresse : c'est la forme exacte des
       liens publiés dans le sitemap, et elle reste valable si la racine
       du domaine est un jour redirigée. */
    return domaine() + '/' + fichier.replace(/^\/+/, '') + ancre;
  }

  /* ─────────── Copie dans le presse-papiers ─────────── */

  /* navigator.clipboard n'existe que dans un contexte sûr (https) et
     échoue sans autorisation : on garde le repli par textarea, qui
     fonctionne partout, y compris sur un fichier ouvert localement. */
  function copier(texte, reussite) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () {
        if (reussite) reussite(true);
      }, function () {
        if (reussite) reussite(repliCopie(texte));
      });
      return;
    }
    if (reussite) reussite(repliCopie(texte));
  }

  function repliCopie(texte) {
    var champ = document.createElement('textarea');
    champ.value = texte;
    champ.setAttribute('readonly', '');
    champ.style.position = 'fixed';
    champ.style.top = '0';
    champ.style.left = '-9999px';
    document.body.appendChild(champ);
    champ.select();
    var copie = false;
    try { copie = document.execCommand('copy'); } catch (e) { copie = false; }
    document.body.removeChild(champ);
    return copie;
  }

  /* ─────────── Confirmation visuelle ─────────── */

  var MINUTES = 0.6;

  function annoncer(message) {
    var boite = document.querySelector('[data-ys-partage-message]');
    if (!boite) {
      boite = document.createElement('div');
      boite.className = 'ys-partage-message';
      boite.setAttribute('data-ys-partage-message', '');
      boite.setAttribute('role', 'status');
      boite.setAttribute('aria-live', 'polite');
      document.body.appendChild(boite);
    }
    boite.textContent = message;
    boite.classList.add('visible');
    clearTimeout(boite._ysMinuteur);
    boite._ysMinuteur = setTimeout(function () {
      boite.classList.remove('visible');
    }, 2600);
  }

  /* ─────────── Traduction ───────────

     Les messages affichés par ce module sont écrits en français dans le
     code, comme ceux de app.js. Les dictionnaires publiés les reprennent
     sous forme de clés libres (« _extra ») : le même texte est donc
     affiché dans la langue choisie par le visiteur. */

  function nomPage() {
    return (window.location.pathname.split('/').pop() || 'index.html')
      .replace(/\.html?$/i, '') || 'index';
  }

  function traduire(texte) {
    var i18n = window.YSI18N;
    if (!i18n || i18n.langue() === 'fr') return texte;
    var dico = i18n.dictionnaire(i18n.langue(), nomPage());
    return dico[texte] || texte;
  }

  /* ─────────── Boutons « copier le lien » d'une rubrique ─────────── */

  function preparerBoutons() {
    var boutons = document.querySelectorAll('[data-partage]');
    Array.prototype.forEach.call(boutons, function (bouton) {
      if (bouton._ysPret) return;
      bouton._ysPret = true;
      bouton.addEventListener('click', function () {
        var adresse = lien(bouton.getAttribute('data-partage'));
        copier(adresse, function (ok) {
          annoncer(ok ? traduire('Lien copié') + ' — ' + adresse
                      : traduire('Copie impossible. Lien :') + ' ' + adresse);
        });
      });
    });
  }

  /* ─────────── Page « Liens à partager » ─────────── */

  function preparerLignes() {
    var lignes = document.querySelectorAll('[data-lien]');
    Array.prototype.forEach.call(lignes, function (ligne) {
      var adresse = lien(ligne.getAttribute('data-lien'));

      /* Le lien est affiché en toutes lettres : l'agence peut le lire,
         le dicter au téléphone, ou le copier à la main si le bouton
         ci-dessous n'a pas fonctionné. */
      var affiche = ligne.querySelector('[data-lien-affiche]');
      if (affiche) affiche.textContent = adresse;

      var lienVide = ligne.querySelector('a[href]');
      if (lienVide) lienVide.href = adresse;

      var copier_ = ligne.querySelector('[data-lien-copier]');
      if (copier_) {
        copier_.addEventListener('click', function () {
          copier(adresse, function (ok) {
            annoncer(ok ? traduire('Lien copié') + ' — ' + adresse
                        : traduire('Copie impossible. Lien :') + ' ' + adresse);
          });
        });
      }

      /* Partage WhatsApp : wa.me sans numéro ouvre le sélecteur de
         contacts, l'agence choisit ensuite le client. Le message nomme
         la rubrique, pour que le client sache ce qu'il ouvre. */
      var whatsapp = ligne.querySelector('[data-lien-whatsapp]');
      if (whatsapp) {
        var libelle = ligne.getAttribute('data-libelle') || 'Yallah Services';
        var message = libelle + ' — ' + adresse;
        whatsapp.href = 'https://wa.me/?text=' + encodeURIComponent(message);
        whatsapp.setAttribute('target', '_blank');
        whatsapp.setAttribute('rel', 'noopener');
      }
    });
  }

  /* ─────────── Démarrage ─────────── */

  function demarrer() {
    preparerBoutons();
    preparerLignes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }

  /* API publique, réutilisée par app.js pour l'onglet de tarifs actif. */
  window.YSLiens = { lien: lien, copier: copier, domaine: domaine, annoncer: annoncer, traduire: traduire };
})();