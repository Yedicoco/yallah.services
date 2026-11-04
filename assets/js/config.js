/* ══════════════════════════════════════════════════════
   YALLAH SERVICES — Coordonnées centralisées + améliorations UX
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  window.YS_CONFIG = {
    whatsappFoyers: '212691733585',
    whatsappFoyersAffiche: '+212 691 733 585',
    whatsappCandidats: '212710359446',
    whatsappCandidatsAffiche: '+212 710 359 446',
    email: 'servicesyallah@gmail.com',
    agence: 'Yallah Services',
    ville: 'Casablanca',
    mode: 'auto'
  };

  function initConversionUx() {
    if (!document.body || document.getElementById('ys-conversion-ux')) return;

    var style = document.createElement('style');
    style.id = 'ys-conversion-ux';
    style.textContent = [
      '.hero-secondary{display:inline-flex;align-items:center;justify-content:center;background:rgba(11,32,53,.7);border:1.5px solid #d8b361;color:#f2db9b;border-radius:50px;padding:12px 24px;min-height:44px;box-shadow:0 4px 16px rgba(0,0,0,.16);transition:box-shadow .2s,transform .2s,background .2s}',
      '.hero-secondary:hover{background:rgba(11,32,53,.92);box-shadow:0 0 20px rgba(216,179,97,.32);transform:translateY(-1px)}',
      '.ys-estimator{margin:0 auto 22px;max-width:980px;padding:20px;border:1px solid rgba(216,179,97,.38);border-radius:18px;background:linear-gradient(135deg,rgba(11,32,53,.96),rgba(3,15,32,.96));box-shadow:0 12px 30px rgba(0,0,0,.16)}',
      '.ys-estimator h3{margin:0 0 12px;color:#faf9f5;font-size:18px}.ys-estimator-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.ys-estimator select{width:100%;min-height:44px;padding:10px;border:1px solid #bca777;border-radius:9px;background:#f8f5ed;color:#142237}.ys-estimator a{display:inline-flex;margin-top:12px;padding:11px 18px;border-radius:50px;background:linear-gradient(135deg,#08733d,#004c2b);border:1px solid #d8b361;color:#fff;text-decoration:none;font-weight:700}.ys-estimator small{display:block;margin-top:8px;color:#c0c8d1}@media(max-width:700px){.ys-estimator-grid{grid-template-columns:1fr}}',
      '.ys-wa-menu{position:fixed;right:20px;bottom:78px;z-index:1001;display:none;width:min(310px,calc(100vw - 40px));padding:12px;border:1px solid #d8b361;border-radius:16px;background:#0b2035;box-shadow:0 14px 36px rgba(0,0,0,.35)}.ys-wa-menu.open{display:grid;gap:8px}.ys-wa-menu a{display:block;padding:12px;border-radius:10px;color:#faf9f5;background:#030f20;text-decoration:none}.ys-wa-menu a:hover{border-color:#d8b361;background:#153047}.ys-wa-toggle{cursor:pointer}',
      '.ys-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0 auto 28px;max-width:1100px}.ys-trust article{padding:16px;border:1px solid rgba(216,179,97,.38);border-radius:14px;background:#0b2035;color:#faf9f5}.ys-trust strong{display:block;color:#f2db9b;margin-bottom:5px}.ys-trust span{color:#c0c8d1;font-size:13px}@media(max-width:700px){.ys-trust{grid-template-columns:1fr}}'
    ].join('');
    document.head.appendChild(style);

    var enterprise = document.querySelector('.hero-secondary');
    if (enterprise) enterprise.classList.add('ys-enterprise-ghost');

    var miniForm = document.getElementById('miniForm');
    if (miniForm) {
      var estimator = document.createElement('div');
      estimator.className = 'ys-estimator';
      estimator.innerHTML = '<h3>Estimation express</h3><div class="ys-estimator-grid"><select aria-label="Public"><option>Particulier</option><option>Entreprise</option></select><select id="ys-est-service" aria-label="Besoin"><option>Ménage à la journée</option><option>Grand ménage</option><option>Femme de ménage mensuelle</option><option>Garde d’enfants</option></select><select id="ys-est-city" aria-label="Ville"><option>Casablanca</option><option>Rabat</option><option>Marrakech</option><option>Tanger</option><option>Autre ville</option></select></div><a id="ys-est-whatsapp" href="https://wa.me/212691733585" target="_blank" rel="noopener">💬 Estimer sur WhatsApp</a><small>Votre demande sera préremplie avec le service et la ville choisis.</small>';
      miniForm.parentNode.insertBefore(estimator, miniForm);
      var updateEstimator = function () {
        var service = document.getElementById('ys-est-service').value;
        var city = document.getElementById('ys-est-city').value;
        var msg = 'Bonjour Yallah Services, je cherche ' + service.toLowerCase() + ' à ' + city + '. Quel est le tarif et la disponibilité ?';
        document.getElementById('ys-est-whatsapp').href = 'https://wa.me/212691733585?text=' + encodeURIComponent(msg);
      };
      estimator.querySelectorAll('select').forEach(function (el) { el.addEventListener('change', updateEstimator); });
      updateEstimator();
    }

    var fab = document.querySelector('.wa-fab');
    if (fab) {
      fab.removeAttribute('href'); fab.removeAttribute('target'); fab.removeAttribute('rel'); fab.classList.add('ys-wa-toggle'); fab.setAttribute('role', 'button'); fab.setAttribute('aria-expanded', 'false');
      var menu = document.createElement('div');
      menu.className = 'ys-wa-menu'; menu.innerHTML = '<a href="https://wa.me/212691733585?text=' + encodeURIComponent('Bonjour Yallah Services, je suis un particulier et je souhaite une estimation.') + '" target="_blank" rel="noopener">🏠 Espace Particuliers</a><a href="https://wa.me/212691733585?text=' + encodeURIComponent('Bonjour Yallah Services, je représente une entreprise et je recherche du personnel.') + '" target="_blank" rel="noopener">🏢 Espace Entreprises</a><a href="https://wa.me/212710359446" target="_blank" rel="noopener">🧑‍🍳 Espace Candidats</a>';
      document.body.appendChild(menu);
      fab.addEventListener('click', function () { var open = menu.classList.toggle('open'); fab.setAttribute('aria-expanded', String(open)); });
      document.addEventListener('click', function (e) { if (e.target !== fab && !menu.contains(e.target)) { menu.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); } });
    }

    var packs = document.getElementById('packs');
    if (packs) {
      var trust = document.createElement('div'); trust.className = 'ys-trust'; trust.innerHTML = '<article>🔍 <strong>Profils filtrés</strong><span>Pièce d’identité et références vérifiées.</span></article><article>⏱️ <strong>Remplacement express</strong><span>Sous 48 h selon disponibilité et conditions applicables.</span></article><article>🤝 <strong>Zéro avance</strong><span>Honoraires après validation du profil et période d’essai.</span></article>';
      packs.parentNode.insertBefore(trust, packs);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initConversionUx);
  else initConversionUx();
}());
