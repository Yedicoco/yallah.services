/* ══════════════════════════════════════════════════════
   YALLAH SERVICES — Interactions du site (accueil foyers)
   WhatsApp foyers : 212691733585 · servicesyallah@gmail.com
   Les coordonnées viennent de assets/js/config.js quand il est chargé
   (une seule source pour tout le site), sinon de ces valeurs de repli.
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CONFIG = window.YS_CONFIG || {};
  var WA_NUMBER = CONFIG.whatsappFoyers || '212691733585';
  var WA_DISPLAY = CONFIG.whatsappFoyersAffiche || '+212 691 733 585';
  var EMAIL = CONFIG.email || 'servicesyallah@gmail.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ─────────── NAVIGATION ─────────── */
  var nav = $('#nav');
  var mobMenu = $('#mobMenu');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var ham = $('#hamburger');
  if (ham) {
    ham.addEventListener('click', function () { mobMenu.classList.toggle('open'); });
  }
  $$('#mobMenu a').forEach(function (a) {
    a.addEventListener('click', function () { mobMenu.classList.remove('open'); });
  });

  // Boutons "scroll to"
  $$('[data-scroll]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = $(b.getAttribute('data-scroll'));
      if (t) window.scrollTo({ top: t.offsetTop - 60, behavior: 'smooth' });
    });
  });

  /* ─────────── APPARITION AU SCROLL ─────────── */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('on'); });
  }

  /* ─────────── ONGLETS PACKS ───────────
     Chaque onglet a sa propre adresse (#tab-nounou) : l'agence peut
     envoyer au client le seul onglet qui le concerne, sans lui faire
     chercher dans la grille. Le bouton « Copier le lien » de la
     rubrique suit l'onglet affiché. */
  function ouvrirOnglet(nom, defiler) {
    var btn = $('.tb[data-tab="' + nom + '"]');
    if (!btn) return false;
    $$('.tb').forEach(function (b) { b.classList.remove('on'); });
    $$('.tcc').forEach(function (c) { c.classList.remove('on'); });
    btn.classList.add('on');
    var pane = $('#tab-' + nom);
    if (pane) pane.classList.add('on');

    /* Le lien de la rubrique #packs devient celui de l'onglet ouvert. */
    var lienPacks = $('[data-partage="packs"]');
    if (lienPacks) lienPacks.setAttribute('data-partage', 'tab-' + nom);

    if (defiler) {
      var section = $('#packs');
      if (section) window.scrollTo({ top: section.offsetTop - 60, behavior: 'smooth' });
    }
    return true;
  }

  $$('.tb').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var nom = btn.getAttribute('data-tab');
      ouvrirOnglet(nom, false);
      /* L'adresse suit l'onglet : copier la barre d'adresse donne
         alors le bon lien, sans passer par le bouton. */
      if (window.history && history.replaceState) {
        history.replaceState(null, '', '#tab-' + nom);
      }
    });
  });

  /* Ouverture directe d'un onglet partagé : /#tab-nounou ou ancre /#services-journee. Sans ancre,
     le bouton « Copier le lien » de la rubrique renvoie d'emblée vers
     l'onglet affiché (Ménage par défaut), jamais vers la section
     entière : c'est le lien le plus précis que l'on puisse partager. */
  var hash = window.location.hash || '';
  var onglet = /^#tab-([\w-]+)$/.exec(hash);
  if (hash === '#services-journee') {
    ouvrirOnglet('jour', true);
  } else if (hash === '#services-mensuels-particuliers') {
    ouvrirOnglet('menage', true);
  } else if (onglet) {
    ouvrirOnglet(onglet[1], true);
  } else {
    var actif = $('.tb.on');
    var boutonPacks = $('[data-partage="packs"]');
    if (actif && boutonPacks) boutonPacks.setAttribute('data-partage', 'tab-' + actif.getAttribute('data-tab'));
  }

  /* ─────────── FAQ ACCORDÉON ─────────── */
  $$('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var a = q.nextElementSibling;
      var isOpen = q.classList.contains('open');
      $$('.faq-q').forEach(function (o) {
        o.classList.remove('open');
        if (o.nextElementSibling) o.nextElementSibling.classList.remove('open');
      });
      if (!isOpen) { q.classList.add('open'); if (a) a.classList.add('open'); }
    });
  });

  /* ─────────── COMPTEUR LIVE ─────────── */
  var liveEl = $('#liveCount');
  if (liveEl) {
    var live = 19 + Math.floor(Math.random() * 15);
    liveEl.textContent = live;
    setInterval(function () {
      live += Math.random() > 0.5 ? 1 : -1;
      if (live < 14) live = 14 + Math.floor(Math.random() * 4);
      if (live > 47) live = 40 - Math.floor(Math.random() * 3);
      liveEl.textContent = live;
    }, 6000);
  }

  /* ─────────── COMPTEUR D'URGENCE ─────────── */
  var tDay = $('#tDay'), tHour = $('#tHour'), tMin = $('#tMin'), tSec = $('#tSec');
  if (tDay) {
    var KEY = 'ys_deadline';
    var deadline = parseInt(localStorage.getItem(KEY) || '0', 10);
    if (!deadline || deadline < Date.now() || deadline > Date.now() + 3 * 864e5) {
      deadline = Date.now() + (2 * 864e5) + (14 * 36e5) + (32 * 6e4) + 5e3;
      try { localStorage.setItem(KEY, String(deadline)); } catch (e) {}
    }
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    (function tick() {
      var d = Math.max(0, deadline - Date.now());
      tDay.textContent = pad(Math.floor(d / 864e5));
      tHour.textContent = pad(Math.floor(d % 864e5 / 36e5));
      tMin.textContent = pad(Math.floor(d % 36e5 / 6e4));
      tSec.textContent = pad(Math.floor(d % 6e4 / 1000));
      setTimeout(tick, 1000);
    })();
  }

  /* ─────────── NOTIFICATIONS "PREUVE SOCIALE" ─────────── */
  var PROOFS = [
    {
        "ico": "🏡",
        "name": "Fatima — Casablanca",
        "txt": "vient de réserver un <strong>ménage simple dans villa</strong> (4 500 DH)"
    },
    {
        "ico": "👶",
        "name": "Karim — Rabat",
        "txt": "a reçu un profil de <strong>nounou d'un enfant</strong> (3 500 DH)"
    },
    {
        "ico": "🥘",
        "name": "Nadia — Marrakech",
        "txt": "a validé un <strong>cuisine / ménage</strong> (5 000 DH)"
    },
    {
        "ico": "🏢",
        "name": "Salima — Tanger",
        "txt": "vient de réserver un <strong>ménage dans appartement</strong>"
    },
    {
        "ico": "👨‍👩‍👧‍👦",
        "name": "Hicham — Casablanca",
        "txt": "a réservé une <strong>nounou de 3 enfants</strong>"
    },
    {
        "ico": "🩺",
        "name": "Amina — Rabat",
        "txt": "vient de réserver une <strong>garde malade simple</strong>"
    },
    {
        "ico": "🍲",
        "name": "Yasmine — Fès",
        "txt": "a validé une <strong>cuisine simple</strong> (4 000 DH)"
    },
    {
        "ico": "🧺",
        "name": "Loubna — Agadir",
        "txt": "vient de réserver <strong>nounou + ménage</strong>"
    },
    {
        "ico": "🔪",
        "name": "Sanaa — Kénitra",
        "txt": "a demandé une <strong>aide cuisine</strong>"
    },
    {
        "ico": "💬",
        "name": "Meryem — Casablanca",
        "txt": "vient de demander un <strong>profil en urgence</strong>"
    }
];
  var spIdx = Math.floor(Math.random() * PROOFS.length);
  function showProof() {
    var p = PROOFS[spIdx++ % PROOFS.length];
    var el = document.createElement('div');
    el.className = 'sp-notif';
    el.innerHTML = '<span class="sp-ico">' + p.ico + '</span><span class="sp-txt"><strong>' + p.name +
      '</strong>' + p.txt + '<span class="sp-time">il y a ' + (1 + Math.floor(Math.random() * 9)) + ' min · via WhatsApp</span></span>';
    document.body.appendChild(el);
    setTimeout(function () {
      el.classList.add('hide');
      setTimeout(function () { el.remove(); }, 600);
    }, 6500);
  }
  setTimeout(function () {
    showProof();
    setInterval(showProof, 22000);
  }, 9000);

  /* ─────────── OUTILS ─────────── */
  function digits(v) { return (v || '').replace(/[^\d+]/g, ''); }
  function waLink(phone) {
    var p = digits(phone).replace(/^\+/, '');
    if (p.indexOf('00') === 0) p = p.slice(2);
    if (p.charAt(0) === '0') p = '212' + p.slice(1);
    return p || WA_NUMBER;
  }
  function markError(input, on) {
    if (!input) return;
    input.classList.toggle('error', !!on);
  }
  function shake(el) {
    if (!el) return;
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 600);
  }
  function val(id) { var e = $(id); return e ? (e.value || '').trim() : ''; }
  function or(v, d) { return v ? v : d; }

  /* ─────────── POPUP RÉSERVATION PACK ─────────── */
  var popup = $('#popup');
  var popPack = $('#popPack');
  var currentPack = { name: 'Pack sélectionné', price: '' };

  function openPopup(pack, price, btn) {
    currentPack.name = pack || 'Pack sélectionné';
    currentPack.price = price || '';
    if (popPack) popPack.textContent = pack + (price ? ' · ' + price : '');
    if (popup) popup.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (btn) { btn.style.transform = 'scale(0.97)'; setTimeout(function () { btn.style.transform = ''; }, 160); }
  }
  function closePopup() {
    if (popup) popup.classList.remove('open');
    document.body.style.overflow = '';
  }

  function bindPack(el) {
    el.addEventListener('click', function () {
      openPopup(el.getAttribute('data-pack'), el.getAttribute('data-price'), el);
    });
  }
  $$('.pwb').forEach(bindPack);
  // Lignes de la grille tarifaire officielle
  $$('.gr-row').forEach(function (r) {
    bindPack(r);
    r.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); r.click(); }
    });
  });
  var pc = $('#popupClose');
  if (pc) pc.addEventListener('click', closePopup);
  if (popup) {
    popup.addEventListener('click', function (e) { if (e.target === popup) closePopup(); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closePopup(); closeThanks(); }
  });

  /* ─────────── PAGE DE CONFIRMATION / FACTURE ─────────── */
  var thanks = $('#thanks');

  function openThanks(data) {
    var now = new Date();
    $('#factDate').textContent = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) +
      ' · ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    $('#factService').textContent = or(data.service, 'Demande générale — personnel à domicile');
    $('#factName').textContent = or(data.name, '—');
    $('#factPhone').textContent = or(data.phone, '—');
    $('#factCity').textContent = or(data.city, '—');
    $('#factNat').textContent = or(data.nat, '—');
    $('#factType').textContent = or(data.type, '—');
    $('#factDelay').textContent = or(data.delay, '—');

    function traduireMessage(texte) {
      var i18n = window.YSI18N;
      if (!i18n || i18n.langue() === 'fr') return texte;
      var dico = i18n.dictionnaire(i18n.langue(), 'index');
      return dico[texte] || texte;
    }
    var msg = [
      traduireMessage('Bonjour Yallah Services ! Je souhaite transmettre cette demande.'),
      traduireMessage('Service :') + ' ' + or(data.service, traduireMessage('À préciser')),
      traduireMessage('Nom :') + ' ' + or(data.name, '—'),
      traduireMessage('Ville :') + ' ' + or(data.city, traduireMessage('À préciser')),
      traduireMessage('Expérience souhaitée :') + ' ' + or(data.nat, traduireMessage('À préciser')),
      traduireMessage('Type de poste :') + ' ' + or(data.type, traduireMessage('À préciser')),
      traduireMessage('Délai souhaité :') + ' ' + or(data.delay, traduireMessage('À préciser'))
    ];
    if (data.msg) msg.push(traduireMessage('Précisions :') + ' ' + data.msg);
    $('#thanksWa').href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg.join('\n'));

    if (thanks) {
      thanks.classList.add('open');
      thanks.scrollTop = 0;
      document.body.style.overflow = 'hidden';
    }
  }
  function closeThanks() {
    if (thanks) thanks.classList.remove('open');
    document.body.style.overflow = '';
  }
  var back = $('#thanksBack');
  if (back) back.addEventListener('click', closeThanks);

  /* ─────────── MINI FORMULAIRE ─────────── */
  var miniForm = $('#miniFormEl');
  if (miniForm) {
    miniForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#mfName'), phone = $('#mfPhone');
      var okName = name.value.trim().length > 1, okPhone = digits(phone.value).length >= 9;
      markError(name, !okName); markError(phone, !okPhone);
      if (!okName || !okPhone) {
        if (!okName) name.focus(); else phone.focus();
        shake($('#mfCard'));
        return;
      }
      var data = {
        service: val('#mfService'), name: name.value.trim(), phone: phone.value.trim(),
        city: val('#mfCity'), nat: val('#mfNat'), type: val('#mfType'), delay: val('#mfDelay')
      };
      miniForm.style.display = 'none';
      $('#mfOk').style.display = 'block';
      openThanks(data);
    });
  }

  /* ─────────── FORMULAIRE DE CONTACT ─────────── */
  var ctForm = $('#ctForm');
  if (ctForm) {
    ctForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#ctName'), phone = $('#ctPhone');
      var okName = name.value.trim().length > 1, okPhone = digits(phone.value).length >= 9;
      markError(name, !okName); markError(phone, !okPhone);
      if (!okName || !okPhone) {
        if (!okName) name.focus(); else phone.focus();
        shake($('.fcard'));
        return;
      }
      var data = {
        service: val('#ctService'), name: name.value.trim(), phone: phone.value.trim(),
        city: val('#ctCity'), nat: val('#ctNat'), type: val('#ctType'), delay: val('#ctDelay'),
        msg: val('#ctMsg')
      };
      ctForm.style.display = 'none';
      $('.fwarn').style.display = 'none';
      $('#ctOk').style.display = 'block';
      openThanks(data);
    });
  }

  /* ─────────── FORMULAIRE POPUP PACK ─────────── */
  var popForm = $('#popForm');
  if (popForm) {
    popForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#popName'), phone = $('#popPhone');
      var okName = name.value.trim().length > 1, okPhone = digits(phone.value).length >= 9;
      markError(name, !okName); markError(phone, !okPhone);
      if (!okName || !okPhone) {
        if (!okName) name.focus(); else phone.focus();
        shake($('.popup-box'));
        return;
      }
      closePopup();
      openThanks({
        service: currentPack.name + (currentPack.price ? ' — ' + currentPack.price : ''),
        name: name.value.trim(), phone: phone.value.trim(),
        city: val('#popCity'), delay: val('#popDelay')
      });
      popForm.reset();
    });
  }

  /* ─────────── ANNÉE FOOTER ─────────── */
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  /* ─────────── REMISE À ZÉRO DES CHAMPS ─────────── */
  $$('input, select, textarea').forEach(function (i) {
    i.addEventListener('input', function () { markError(i, false); });
    i.addEventListener('change', function () { markError(i, false); });
  });

  /* ─────────── PIXEL / ANALYTICS (placeholders) ─────────── */
  window.ysContacts = { whatsapp: WA_DISPLAY, email: EMAIL, waNumber: WA_NUMBER };
})();
