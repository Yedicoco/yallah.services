/*
 * First-party conversion hooks for WhatsApp contact links.
 * No cookies, PII, network requests, or third-party tags are added here.
 * GTM may listen for the `whatsapp_click` custom dataLayer event when configured.
 */
(function (window, document) {
  'use strict';

  var dataLayer = window.dataLayer;
  if (!Array.isArray(dataLayer)) {
    dataLayer = [];
    window.dataLayer = dataLayer;
  }

  function cleanLabel(link) {
    var label = link.getAttribute('aria-label') || link.textContent || 'WhatsApp';
    return label.replace(/\+?\d[\d\s().-]{7,}\d/g, '')
      .replace(/\s+/g, ' ').trim().slice(0, 80) || 'WhatsApp';
  }

  function pageSource() {
    var path = window.location.pathname.replace(/\/+$/, '').replace(/\.html$/i, '');
    return path.split('/').pop() || 'home';
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    var link = target && target.closest ? target.closest('a[href]') : null;
    if (!link) return;

    var destination;
    try {
      destination = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }
    if (destination.hostname !== 'wa.me') return;

    var audience = /212710359446/.test(destination.pathname) || /candidature/i.test(window.location.pathname)
      ? 'candidate'
      : 'client';
    var source = link.getAttribute('data-src') || pageSource();

    dataLayer.push({
      event: 'whatsapp_click',
      event_category: 'conversion',
      audience: audience,
      source: source,
      page_path: window.location.pathname,
      page_title: document.title,
      link_label: cleanLabel(link)
    });
  }, true);
})(window, document);

/* Le module UX est séparé de config.js afin que build-site.js puisse
   régénérer les coordonnées sans l’écraser. */
(function (document) {
  function charger() {
    if (document.getElementById('ys-conversion-ux-script')) return;
    var script = document.createElement('script');
    script.id = 'ys-conversion-ux-script';
    script.src = 'assets/js/conversion-ux.js?v=20261104';
    script.defer = true;
    document.head.appendChild(script);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', charger);
  else charger();
})(document);
