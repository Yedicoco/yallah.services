#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Vérification des messages générés par le site

       node outils/tester-messages.js

   Rejoue, sans navigateur, ce que produit assets/js/fiche.js :
     · le message WhatsApp du candidat (fiche complète, français et arabe) ;
     · le lien e-mail avec les deux références et le dossier en objet ;
     · la numérotation locale YS-AAAA-NNNN ;
     · le récapitulatif bilingue affiché sur la page de confirmation ;
     · le basculement de langue (bilingue.erreur).
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = path.resolve(__dirname, '..');

let erreurs = 0;
function verifier(intitule, condition, detail) {
  if (condition) {
    console.log('  ✅ ' + intitule);
  } else {
    erreurs += 1;
    console.log('  ❌ ' + intitule + (detail ? ' → ' + detail : ''));
  }
}
function section(titre) { console.log('\n' + titre); }

/* ── Chargement de config.js + fiche.js dans un faux navigateur ── */
const memoire = () => {
  const donnees = {};
  return {
    getItem: (cle) => (cle in donnees ? donnees[cle] : null),
    setItem: (cle, valeur) => { donnees[cle] = String(valeur); },
    removeItem: (cle) => { delete donnees[cle]; }
  };
};

const fenetre = {
  localStorage: memoire(),
  sessionStorage: memoire(),
  location: { search: '' }
};
fenetre.window = fenetre;
fenetre.document = { documentElement: {}, body: {}, querySelectorAll: () => [], querySelector: () => null };
fenetre.navigator = {};

const contexte = vm.createContext(fenetre);
vm.runInContext(fs.readFileSync(path.join(RACINE, 'assets/js/config.js'), 'utf8'), contexte, { filename: 'config.js' });
vm.runInContext(fs.readFileSync(path.join(RACINE, 'assets/js/fiche.js'), 'utf8'), contexte, { filename: 'fiche.js' });

const F = fenetre.YSFiche;
const CONFIG = fenetre.YS_CONFIG;

const FICHE = {
  nomComplet: 'Aminata Diallo', telephone: '0612345678', ville: 'Casablanca', quartier: 'Sidi Bernoussi',
  age: '32', origine: "Côte d'Ivoire", poste: 'Nounou', experience: '3 à 5 ans', salaire: '3500',
  logement: 'Logée', travail: ['Temps plein', 'Nuit'], disponible: '2026-11-01', jours: '6 jours',
  villesAcceptees: 'Casablanca, Rabat', langues: ['Français', 'Darija marocaine'],
  competences: ["Garde d'enfants"], documents: ['CIN ou passeport'],
  ref1Nom: 'Mme Bennani', ref1Lien: 'Ancien employeur', ref1Tel: '0661223344',
  ref2Nom: 'M. Alaoui', ref2Lien: "Responsable d'entreprise", ref2Tel: '+212 6 55 44 33 22',
  message: 'Disponible rapidement.', consentement: 'oui'
};
const NUMERO = 'YS-2026-0001';

/* ── 1. Coordonnées ── */
section('1. Coordonnées centralisées (config.js)');
verifier('WhatsApp candidats = 212710359446', CONFIG.whatsappCandidats === '212710359446', CONFIG.whatsappCandidats);
verifier('WhatsApp candidats affiché = +212 710 359 446', CONFIG.whatsappCandidatsAffiche === '+212 710 359 446');
verifier('WhatsApp foyers = 212691733585', CONFIG.whatsappFoyers === '212691733585');
verifier('E-mail = servicesyallah@gmail.com', CONFIG.email === 'servicesyallah@gmail.com');
verifier('Mode statique utilisé par build-site.js', typeof CONFIG.mode === 'string');

/* ── 2. Lien WhatsApp ── */
section('2. Lien WhatsApp du candidat');
const lienWa = F.lienWhatsApp(FICHE, NUMERO, 'fr');
verifier('le lien pointe vers le numéro candidats', lienWa.indexOf('https://wa.me/212710359446?text=') === 0, lienWa.slice(0, 60));
const messageWa = decodeURIComponent(lienWa.split('text=')[1]);
verifier('le message contient le numéro de dossier', messageWa.indexOf('YS-2026-0001') !== -1);
verifier('le message contient le nom du candidat', messageWa.indexOf('Aminata Diallo') !== -1);
verifier('le message contient les deux références', messageWa.indexOf('Mme Bennani') !== -1 && messageWa.indexOf('M. Alaoui') !== -1);
verifier('le message contient les types de travail cochés', messageWa.indexOf('Temps plein, Nuit') !== -1);
verifier('le message rappelle l\'envoi des références par e-mail', /e-mail/.test(messageWa));
verifier('le message indique le consentement loi 09-08', /09-08/.test(messageWa));
const messageWaAr = decodeURIComponent(F.lienWhatsApp(FICHE, NUMERO, 'ar').split('text=')[1]);
verifier('version arabe : entête « ترشّح جديد »', messageWaAr.indexOf('ترشّح جديد') !== -1);
verifier('version arabe : dossier présent', messageWaAr.indexOf('YS-2026-0001') !== -1);
verifier('version arabe : date en arabe (نونبر)', messageWaAr.indexOf('نونبر') !== -1, messageWaAr.slice(0, 120));

/* ── 3. Lien e-mail ── */
section('3. Lien e-mail des références');
const lienMail = F.lienEmail(FICHE, NUMERO);
verifier('le lien pointe vers servicesyallah@gmail.com', lienMail.indexOf('mailto:servicesyallah@gmail.com?subject=') === 0, lienMail.slice(0, 60));
verifier('le numéro de dossier est dans l\'objet', decodeURIComponent(lienMail.split('subject=')[1].split('&')[0]).indexOf('YS-2026-0001') !== -1);
const corpsMail = decodeURIComponent(lienMail.split('&body=')[1]);
verifier('le corps contient les deux références complètes', corpsMail.indexOf('Mme Bennani') !== -1 && corpsMail.indexOf('0661223344') !== -1 && corpsMail.indexOf('M. Alaoui') !== -1);
verifier('le corps rappelle la règle des références', /ni validée ni présentée à un foyer/.test(corpsMail));
verifier('le corps est signé du candidat', corpsMail.trim().endsWith('Aminata Diallo'));

/* ── 4. Numérotation locale (site statique) ── */
section('4. Numérotation locale');
const numero1 = F.numeroLocal();
const numero2 = F.numeroLocal();
verifier('format YS-AAAA-NNNN', /^YS-\d{4}-\d{4}$/.test(numero1), numero1);
verifier('incrémentation 0001 → 0002', numero1.endsWith('0001') && numero2.endsWith('0002'), numero1 + ' / ' + numero2);
fenetre.localStorage.setItem('ys_compteur_' + new Date().getFullYear(), '0');
verifier('reprise après remise à zéro', F.numeroLocal().endsWith('0001'));

/* ── 5. Récapitulatif bilingue ── */
section('5. Récapitulatif de la page de confirmation');
const recapFr = F.resume(FICHE, 'fr');
const recapAr = F.resume(FICHE, 'ar');
verifier('autant de lignes en français et en arabe', recapFr.length === recapAr.length, recapFr.length + ' / ' + recapAr.length);
verifier('aucune valeur « undefined » ou « null »', recapFr.every((l) => !/undefined|null/.test(l.valeur)));
verifier('le téléphone est normalisé', recapFr.find((l) => l.champ === 'telephone').valeur === '0612345678');
verifier('le salaire est libellé en DH/mois', recapFr.find((l) => l.champ === 'salaire').valeur === '3500 DH/mois');
verifier('la date est au format JJ/MM/AAAA', recapFr.find((l) => l.champ === 'disponible').valeur === '01/11/2026', recapFr.find((l) => l.champ === 'disponible').valeur);
verifier('libellés arabes présents', recapAr.find((l) => l.champ === 'poste').libelle === 'المهنة');
verifier('métier absent → « — »', F.valeurAffichee('quartier', '', 'fr') === '—');

/* ── 6. Bascule de langue ── */
section('6. Bascule de langue (moteur partagé)');
fenetre.document = {
  documentElement: { getAttribute: () => null, lang: '', dir: '' },
  body: { classList: { toggle: () => {} } },
  querySelectorAll: () => [],
  getElementById: () => null
};
verifier('langue par défaut : français', F.bilingue.langue() === 'fr', F.bilingue.langue());
F.bilingue.definir('ar');
verifier('passage en arabe mémorisé', F.bilingue.langue() === 'ar' && fenetre.localStorage.getItem('ys_langue') === 'ar');
verifier('messages d\'erreur bilingues', F.bilingue.erreur('nom', 'Nom requis.', 'الاسم مطلوب.') === 'الاسم مطلوب.');
F.bilingue.definir('fr');
verifier('retour au français', F.bilingue.erreur('nom', 'Nom requis.', 'الاسم مطلوب.') === 'Nom requis.');

/* ── Résultat ── */
console.log('\n' + '─'.repeat(62));
console.log(erreurs === 0 ? '✅ Tous les messages sont conformes.' : '❌ ' + erreurs + ' problème(s) détecté(s).');
console.log('─'.repeat(62));
process.exit(erreurs === 0 ? 0 : 1);
