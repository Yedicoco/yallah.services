#!/usr/bin/env node
'use strict';
// Prérequis : npm install --no-save --no-package-lock jsdom@26
const fs = require('fs');
const assert = require('assert');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('assets/js/app.js', 'utf8');
function page() {
  const dom = new JSDOM(html, { url: 'https://example.test/', runScripts: 'outside-only' });
  dom.window.eval(app);
  return dom;
}
function set(doc, id, value) { doc.getElementById(id).value = value; }
function change(win, id, value) { set(win.document, id, value); win.document.getElementById(id).dispatchEvent(new win.Event('change')); }
function submit(win, id) { win.document.getElementById(id).dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true })); }
function message(doc) { return new URL(doc.getElementById('thanksWa').href).searchParams.get('text'); }
for (const service of ['froid-climatisation', 'esthetique-bien-etre']) {
  const dom = page(), w = dom.window, d = w.document;
  set(d, 'ctName', 'Test Client'); set(d, 'ctPhone', '0612345678');
  change(w, 'ctService', service); set(d, 'ctCity', 'Casablanca');
  set(d, 'ctQuartier', 'Centre'); set(d, 'ctDate', '2027-01-18'); set(d, 'ctMsg', 'Besoin de renseignements');
  assert(d.querySelector('#ctNat').closest('.fg').hidden);
  assert(d.querySelector('.fhint').hidden);
  submit(w, 'ctForm');
  const text = message(d);
  for (const part of ['Test Client', '0612345678', 'Casablanca', 'Centre', '2027-01-18', 'Besoin de renseignements', d.querySelector('#ctService').selectedOptions[0].text]) assert(text.includes(part), part);
  assert(!text.includes('Type de poste :'));
  assert(d.querySelector('.recap-personnel').hidden);
  assert.equal(d.getElementById('factMsg').textContent, 'Besoin de renseignements');
  dom.window.close();
}
for (const form of ['ct', 'mf']) {
  const dom = page(), w = dom.window, d = w.document;
  set(d, form + 'Name', 'Test Client'); set(d, form + 'Phone', '0612345678');
  change(w, form + 'Service', 'froid-climatisation');
  const select = d.getElementById(form + 'Service');
  change(w, form + 'Service', select.options[1].value);
  assert(!d.querySelector(form === 'ct' ? '#ctNat' : '#mfNat').closest(form === 'ct' ? '.fg' : 'select').hidden);
  submit(w, form === 'ct' ? 'ctForm' : 'miniFormEl');
  assert(message(d).includes('0612345678'));
  assert(message(d).includes('Type de poste :'));
  assert(!d.querySelector('.recap-personnel').hidden);
  dom.window.close();
}
console.log('✅ Formulaires : nouveaux services, données WhatsApp et retour aux services historiques.');
