#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Serveur de recrutement (Node.js, sans dépendance)

   · Sert le site (accueil foyers, fiche candidat, confirmation, admin)
   · Enregistre chaque candidature dans data/candidatures.json
   · API :  GET  /api/sante
            POST /api/candidature
            GET  /api/admin/candidatures      (clé requise)
            GET  /api/admin/export.csv        (clé requise)
            DELETE /api/admin/candidature/:numero (clé requise)
   · Espace recruteur : /admin

   Lancement :
       ADMIN_KEY='MaCleSecrete' node server.js
       PORT=3000 WHATSAPP_CANDIDATS=212710359446 node server.js

   Variables d'environnement :
       PORT               (défaut 3000)
       ADMIN_KEY          (défaut « yallah2026 » — À CHANGER en production)
       WHATSAPP_FOYERS    (défaut 212691733585)
       WHATSAPP_CANDIDATS (défaut 212710359446, repli : WHATSAPP_NUMBER)
       CONTACT_EMAIL      (défaut servicesyallah@gmail.com)
       DATA_DIR           (défaut ./data)
       TRUST_PROXY        (1 si le serveur est derrière un reverse proxy)
══════════════════════════════════════════════════════════════════ */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/* ─────────────────────────── CONFIGURATION ─────────────────────────── */

const PORT = parseInt(process.env.PORT || '3000', 10);
const ADMIN_KEY = process.env.ADMIN_KEY || 'yallah2026';
const CLE_PAR_DEFAUT = !process.env.ADMIN_KEY;
const WHATSAPP_FOYERS = process.env.WHATSAPP_FOYERS || '212691733585';
const WHATSAPP_CANDIDATS = process.env.WHATSAPP_CANDIDATS || process.env.WHATSAPP_NUMBER || '212710359446';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'servicesyallah@gmail.com';
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const FICHIER_DONNEES = path.join(DATA_DIR, 'candidatures.json');
const TRUST_PROXY = process.env.TRUST_PROXY === '1';

const RACINE = __dirname;
const LIMITE_ENVOIS = 12;            // envois par heure et par IP
const FENETRE_MS = 60 * 60 * 1000;
const TAILLE_MAX_CORPS = 64 * 1024;  // 64 Ko
const SEL_IP = process.env.IP_SALT || 'yallah-services-09-08';

/* ─────────────────────────── OUTILS ─────────────────────────── */

function afficherNumero(wa) {
  const n = String(wa || '').replace(/\D/g, '');
  if (n.length === 12 && n.startsWith('212')) {
    return '+' + n.slice(0, 3) + ' ' + n.slice(3, 4) + n.slice(4, 6) + ' ' + n.slice(6, 9) + ' ' + n.slice(9);
  }
  return '+' + n;
}

function hacherIp(ip) {
  return crypto.createHash('sha256').update(SEL_IP + '|' + String(ip)).digest('hex').slice(0, 24);
}

function texte(v) {
  return v === undefined || v === null ? '' : String(v).trim();
}

function liste(v) {
  if (Array.isArray(v)) return v.map(texte).filter(Boolean);
  const t = texte(v);
  return t ? [t] : [];
}

function chiffres(v) {
  return (texte(v).match(/\d/g) || []).length;
}

function ipDe(requete) {
  if (TRUST_PROXY) {
    const transmis = requete.headers['x-forwarded-for'];
    if (transmis) return String(transmis).split(',')[0].trim();
  }
  return requete.socket.remoteAddress || 'inconnue';
}

/* ─────────────────────────── STOCKAGE ─────────────────────────── */

let donnees = { version: 1, candidatures: [] };
let ecritureEnCours = null;

function chargerDonnees() {
  try {
    if (fs.existsSync(FICHIER_DONNEES)) {
      const brut = fs.readFileSync(FICHIER_DONNEES, 'utf8');
      const analyse = JSON.parse(brut);
      if (analyse && Array.isArray(analyse.candidatures)) donnees = analyse;
    }
  } catch (erreur) {
    console.error('[données] Fichier illisible, sauvegarde de côté :', erreur.message);
    try {
      fs.renameSync(FICHIER_DONNEES, FICHIER_DONNEES + '.corrompu-' + Date.now());
    } catch (e) { /* ignore */ }
  }
}

function ecrireDonnees() {
  if (ecritureEnCours) return ecritureEnCours;
  ecritureEnCours = new Promise((resoudre, rejeter) => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const temporaire = FICHIER_DONNEES + '.tmp';
      fs.writeFileSync(temporaire, JSON.stringify(donnees, null, 2), 'utf8');
      fs.renameSync(temporaire, FICHIER_DONNEES);
      resoudre();
    } catch (erreur) {
      rejeter(erreur);
    } finally {
      ecritureEnCours = null;
    }
  });
  return ecritureEnCours;
}

function prochainNumero() {
  const annee = new Date().getFullYear();
  const prefixe = 'YS-' + annee + '-';
  let maximum = 0;
  donnees.candidatures.forEach((c) => {
    if (c.numero && c.numero.indexOf(prefixe) === 0) {
      const n = parseInt(c.numero.slice(prefixe.length), 10);
      if (!isNaN(n) && n > maximum) maximum = n;
    }
  });
  return prefixe + ('000' + (maximum + 1)).slice(-4);
}

/* ─────────────────────────── VALIDATION ─────────────────────────── */

const MESSAGES = {
  nomComplet: ['Indiquez votre nom complet (3 lettres minimum).', 'اكتبي اسمك الكامل (3 أحرف على الأقل).'],
  telephone: ['Numéro invalide : saisissez au moins 8 chiffres.', 'رقم غير صحيح: أدخلي 8 أرقام على الأقل.'],
  ville: ['Choisissez votre ville.', 'اختاري مدينتك.'],
  age: ['Indiquez un âge entre 18 et 70 ans.', 'أدخلي عمرًا بين 18 و70 سنة.'],
  poste: ['Choisissez le métier souhaité.', 'اختاري المهنة المطلوبة.'],
  experience: ['Indiquez votre expérience.', 'حدّدي خبرتك.'],
  salaire: ['Montant entre 1 000 et 20 000 DH.', 'المبلغ بين 1000 و20000 درهم.'],
  logement: ['Précisez logée ou non logée.', 'حدّدي إن كنت مقيمة أو غير مقيمة.'],
  travail: ['Cochez au moins un type de travail.', 'اختاري نوع عمل واحدًا على الأقل.'],
  disponible: ['Indiquez une date de disponibilité valide.', 'حدّدي تاريخ توفّر صحيح.'],
  ref1Nom: ['Indiquez le nom de la référence 1.', 'اكتبي اسم المرجع الأول.'],
  ref1Lien: ['Précisez le lien avec la référence 1.', 'حدّدي صفة العلاقة بالمرجع الأول.'],
  ref1Tel: ['Numéro de la référence 1 invalide.', 'رقم المرجع الأول غير صحيح.'],
  ref2Nom: ['Indiquez le nom de la référence 2.', 'اكتبي اسم المرجع الثاني.'],
  ref2Lien: ['Précisez le lien avec la référence 2.', 'حدّدي صفة العلاقة بالمرجع الثاني.'],
  ref2Tel: ['Numéro de la référence 2 invalide.', 'رقم المرجع الثاني غير صحيح.'],
  consentement: ['Le consentement est obligatoire (loi 09-08).', 'الموافقة إلزامية (القانون 09-08).']
};

function nettoyerFiche(brut) {
  const champs = ['nomComplet', 'telephone', 'ville', 'quartier', 'age', 'origine', 'poste', 'experience',
    'salaire', 'logement', 'disponible', 'jours', 'villesAcceptees', 'ref1Nom', 'ref1Lien', 'ref1Tel',
    'ref2Nom', 'ref2Lien', 'ref2Tel', 'message'];
  const fiche = {};
  champs.forEach((champ) => { fiche[champ] = texte(brut[champ]).slice(0, 1200); });
  fiche.travail = liste(brut.travail).slice(0, 10);
  fiche.langues = liste(brut.langues).slice(0, 10);
  fiche.competences = liste(brut.competences).slice(0, 12);
  fiche.documents = liste(brut.documents).slice(0, 12);
  fiche.consentement = texte(brut.consentement) === 'oui' ? 'oui' : '';
  fiche.langue = texte(brut.langue) === 'ar' ? 'ar' : 'fr';
  return fiche;
}

function valider(fiche) {
  const erreurs = {};
  if (fiche.nomComplet.length < 3) erreurs.nomComplet = 1;
  if (chiffres(fiche.telephone) < 8 || chiffres(fiche.telephone) > 15) erreurs.telephone = 1;
  if (!fiche.ville) erreurs.ville = 1;
  const age = parseInt(fiche.age, 10);
  if (!age || age < 18 || age > 70) erreurs.age = 1;
  if (!fiche.poste) erreurs.poste = 1;
  if (!fiche.experience) erreurs.experience = 1;
  if (fiche.salaire !== '') {
    const salaire = parseInt(fiche.salaire, 10);
    if (!salaire || salaire < 1000 || salaire > 20000) erreurs.salaire = 1;
  }
  if (!fiche.logement) erreurs.logement = 1;
  if (fiche.travail.length === 0) erreurs.travail = 1;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fiche.disponible) || isNaN(new Date(fiche.disponible + 'T00:00:00').getTime())) {
    erreurs.disponible = 1;
  }
  if (fiche.ref1Nom.length < 3) erreurs.ref1Nom = 1;
  if (!fiche.ref1Lien) erreurs.ref1Lien = 1;
  if (chiffres(fiche.ref1Tel) < 8 || chiffres(fiche.ref1Tel) > 15) erreurs.ref1Tel = 1;
  if (fiche.ref2Nom.length < 3) erreurs.ref2Nom = 1;
  if (!fiche.ref2Lien) erreurs.ref2Lien = 1;
  if (chiffres(fiche.ref2Tel) < 8 || chiffres(fiche.ref2Tel) > 15) erreurs.ref2Tel = 1;
  if (fiche.consentement !== 'oui') erreurs.consentement = 1;
  return erreurs;
}

function messagesErreurs(erreurs, langue) {
  const index = langue === 'ar' ? 1 : 0;
  const sortie = {};
  Object.keys(erreurs).forEach((champ) => {
    if (MESSAGES[champ]) sortie[champ] = MESSAGES[champ][index];
  });
  return sortie;
}

/* ─────────────────────────── LIMITATION DE DÉBIT ─────────────────────────── */

const envoisParIp = new Map();

function tropDEnvois(ip) {
  const maintenant = Date.now();
  const historique = (envoisParIp.get(ip) || []).filter((t) => maintenant - t < FENETRE_MS);
  if (historique.length >= LIMITE_ENVOIS) {
    envoisParIp.set(ip, historique);
    return true;
  }
  historique.push(maintenant);
  envoisParIp.set(ip, historique);
  if (envoisParIp.size > 5000) {
    for (const [cle, valeurs] of envoisParIp) {
      if (!valeurs.some((t) => maintenant - t < FENETRE_MS)) envoisParIp.delete(cle);
    }
  }
  return false;
}

/* ─────────────────────────── RÉPONSES HTTP ─────────────────────────── */

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8'
};

function entetesSecurite(extra) {
  /* Remarque : pas d'en-tête X-Frame-Options ici, afin que le site puisse
     être affiché dans un aperçu (iframe) pendant la mise au point.
     En production, l'hébergeur ajoute X-Frame-Options: SAMEORIGIN
     (voir netlify.toml) — pensez à le faire aussi sur votre serveur. */
  return Object.assign({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }, extra || {});
}

function envoyerJson(reponse, code, objet, extra) {
  const corps = Buffer.from(JSON.stringify(objet), 'utf8');
  reponse.writeHead(code, entetesSecurite(Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': corps.length,
    'Cache-Control': 'no-store'
  }, extra || {})));
  reponse.end(corps);
}

function envoyerTexte(reponse, code, texteReponse, extra) {
  const corps = Buffer.from(texteReponse, 'utf8');
  reponse.writeHead(code, entetesSecurite(Object.assign({
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': corps.length
  }, extra || {})));
  reponse.end(corps);
}

/* ─────────────────────────── FICHIERS STATIQUES ─────────────────────────── */

const DOSSIERS_PUBLICS = new Set(['assets']);
const INTERDITS = new Set(['server.js', 'build-site.js', 'generer-images-logo.py',
  'pousser-et-ouvrir-pr.sh', 'deploiement-netlify.sh', '.gitignore', 'netlify.toml']);

function fichierStatique(cheminUrl) {
  let propre = decodeURIComponent(cheminUrl.split('?')[0]);
  if (propre === '/' || propre === '') propre = '/index.html';
  if (propre.indexOf('/data/') === 0 || propre.indexOf('/.') !== -1) return null;

  const relatif = propre.replace(/^\/+/, '').replace(/\\/g, '/');
  const premier = relatif.split('/')[0];
  if (relatif.indexOf('/') === -1 && INTERDITS.has(relatif)) return null;
  if (relatif.indexOf('/') !== -1 && !DOSSIERS_PUBLICS.has(premier)) return null;

  const absolu = path.resolve(RACINE, relatif);
  if (!absolu.startsWith(RACINE)) return null;
  if (!fs.existsSync(absolu) || !fs.statSync(absolu).isFile()) return null;
  return absolu;
}

/* ─────────────────────────── CONFIG INJECTÉE ─────────────────────────── */

function scriptConfig() {
  return '/* Généré par server.js — ne pas modifier à la main. */\n' +
    'window.YS_CONFIG = ' + JSON.stringify({
      whatsappFoyers: WHATSAPP_FOYERS,
      whatsappFoyersAffiche: afficherNumero(WHATSAPP_FOYERS),
      whatsappCandidats: WHATSAPP_CANDIDATS,
      whatsappCandidatsAffiche: afficherNumero(WHATSAPP_CANDIDATS),
      email: CONTACT_EMAIL,
      agence: 'Yallah Services',
      ville: 'Casablanca',
      mode: 'serveur'
    }, null, 2) + ';\n';
}

/* ─────────────────────────── EXPORT CSV ─────────────────────────── */

const COLONNES_CSV = [
  ['numero', 'Numéro'],
  ['recuLe', 'Reçu le'],
  ['nomComplet', 'Nom complet'],
  ['telephone', 'Téléphone WhatsApp'],
  ['ville', 'Ville'],
  ['quartier', 'Quartier'],
  ['age', 'Âge'],
  ['origine', "Pays d'origine"],
  ['poste', 'Métier souhaité'],
  ['experience', 'Expérience'],
  ['salaire', 'Salaire souhaité (DH/mois)'],
  ['logement', 'Logement'],
  ['travail', 'Type de travail'],
  ['disponible', 'Disponible à partir du'],
  ['jours', 'Jours par semaine'],
  ['villesAcceptees', 'Villes acceptées'],
  ['langues', 'Langues'],
  ['competences', 'Compétences'],
  ['documents', 'Documents fournis'],
  ['ref1Nom', 'Référence 1 — nom'],
  ['ref1Lien', 'Référence 1 — lien'],
  ['ref1Tel', 'Référence 1 — téléphone'],
  ['ref2Nom', 'Référence 2 — nom'],
  ['ref2Lien', 'Référence 2 — lien'],
  ['ref2Tel', 'Référence 2 — téléphone'],
  ['message', 'Message'],
  ['langue', 'Langue de la fiche']
];

function celluleCsv(valeur) {
  let v = Array.isArray(valeur) ? valeur.join(' · ') : (valeur === undefined || valeur === null ? '' : String(valeur));
  v = v.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (/[";\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
  return v;
}

function construireCsv() {
  const lignes = [];
  lignes.push(COLONNES_CSV.map(([, titre]) => celluleCsv(titre)).join(';'));
  donnees.candidatures.forEach((candidature) => {
    const fiche = candidature.fiche || {};
    const valeurs = COLONNES_CSV.map(([cle]) => {
      if (cle === 'numero') return celluleCsv(candidature.numero || '');
      if (cle === 'recuLe') return celluleCsv(candidature.recuLe || '');
      return celluleCsv(fiche[cle]);
    });
    lignes.push(valeurs.join(';'));
  });
  return '\ufeff' + lignes.join('\r\n') + '\r\n';
}

/* ─────────────────────────── STATISTIQUES ─────────────────────────── */

function statistiques() {
  const total = donnees.candidatures.length;
  const parPoste = new Map();
  let contacts = 0;
  let referencesCompletes = 0;
  const parVille = new Map();
  donnees.candidatures.forEach((c) => {
    const fiche = c.fiche || {};
    if (fiche.poste) parPoste.set(fiche.poste, (parPoste.get(fiche.poste) || 0) + 1);
    if (fiche.ville) parVille.set(fiche.ville, (parVille.get(fiche.ville) || 0) + 1);
    if (chiffres(fiche.telephone) >= 8) contacts += 1;
    if (chiffres(fiche.ref1Tel) >= 8 && chiffres(fiche.ref2Tel) >= 8) referencesCompletes += 1;
  });
  let postePlusDemande = '—';
  let maximum = 0;
  parPoste.forEach((nombre, poste) => {
    if (nombre > maximum) { maximum = nombre; postePlusDemande = poste; }
  });
  let villePrincipale = '—';
  maximum = 0;
  parVille.forEach((nombre, ville) => {
    if (nombre > maximum) { maximum = nombre; villePrincipale = ville; }
  });
  return {
    total: total,
    postePlusDemande: postePlusDemande,
    villePrincipale: villePrincipale,
    contactsDisponibles: contacts,
    referencesCompletes: referencesCompletes,
    parPoste: Array.from(parPoste.entries()).sort((a, b) => b[1] - a[1]),
    parVille: Array.from(parVille.entries()).sort((a, b) => b[1] - a[1])
  };
}

/* ─────────────────────────── AUTORISATION ADMIN ─────────────────────────── */

function egalesEnTempsConstant(a, b) {
  const ta = Buffer.from(String(a));
  const tb = Buffer.from(String(b));
  if (ta.length !== tb.length) return false;
  return crypto.timingSafeEqual(ta, tb);
}

function cleFournie(requete, url) {
  const entete = requete.headers['x-admin-key'];
  if (entete) return String(entete);
  const dansUrl = url.searchParams.get('cle') || url.searchParams.get('key');
  return dansUrl || '';
}

function autorise(requete, url) {
  return egalesEnTempsConstant(cleFournie(requete, url), ADMIN_KEY);
}

/* ─────────────────────────── CORPS DE REQUÊTE ─────────────────────────── */

function lireCorps(requete) {
  return new Promise((resoudre, rejeter) => {
    let taille = 0;
    const morceaux = [];
    requete.on('data', (morceau) => {
      taille += morceau.length;
      if (taille > TAILLE_MAX_CORPS) {
        rejeter(Object.assign(new Error('Corps trop volumineux'), { code: 413 }));
        requete.destroy();
        return;
      }
      morceaux.push(morceau);
    });
    requete.on('end', () => resoudre(Buffer.concat(morceaux).toString('utf8')));
    requete.on('error', rejeter);
  });
}

function lireJson(requete) {
  return lireCorps(requete).then((brut) => {
    if (!brut) return {};
    try {
      return JSON.parse(brut);
    } catch (e) {
      throw Object.assign(new Error('JSON invalide'), { code: 400 });
    }
  });
}

/* ─────────────────────────── ROUTAGE ─────────────────────────── */

function traiterCandidature(requete, reponse) {
  const ip = ipDe(requete);
  if (tropDEnvois(ip)) {
    envoyerJson(reponse, 429, {
      ok: false,
      erreur: 'trop_de_demandes',
      message: "Trop d'envois depuis cette connexion (12 par heure maximum). Réessayez plus tard."
    }, { 'Retry-After': '3600' });
    return;
  }

  lireJson(requete).then((brut) => {
    /* Champ piège : si rempli, on répond « succès » sans rien enregistrer. */
    if (texte(brut.site_web) !== '') {
      envoyerJson(reponse, 201, { ok: true, numero: 'YS-' + new Date().getFullYear() + '-0000', piege: true });
      return;
    }

    const fiche = nettoyerFiche(brut);
    const erreurs = valider(fiche);
    if (Object.keys(erreurs).length > 0) {
      envoyerJson(reponse, 422, {
        ok: false,
        erreur: 'validation',
        erreurs: erreurs,
        messages: messagesErreurs(erreurs, fiche.langue)
      });
      return;
    }

    const numero = prochainNumero();
    const maintenant = new Date();
    donnees.candidatures.push({
      numero: numero,
      recuLe: maintenant.toISOString(),
      ipHash: hacherIp(ip),
      fiche: fiche
    });

    ecrireDonnees().then(() => {
      console.log('[candidature] ' + numero + ' — ' + fiche.poste + ' — ' + fiche.ville +
        ' — contacts : ' + (chiffres(fiche.ref1Tel) >= 8 && chiffres(fiche.ref2Tel) >= 8 ? 'références complètes' : 'à compléter'));
      envoyerJson(reponse, 201, {
        ok: true,
        numero: numero,
        recuLe: maintenant.toISOString(),
        whatsapp: WHATSAPP_CANDIDATS,
        email: CONTACT_EMAIL
      });
    }).catch((erreur) => {
      console.error("[candidature] écriture impossible :", erreur.message);
      donnees.candidatures.pop();
      envoyerJson(reponse, 500, {
        ok: false,
        erreur: 'enregistrement',
        message: "L'enregistrement a échoué. Réessayez ou écrivez-nous sur WhatsApp."
      });
    });
  }).catch((erreur) => {
    const code = erreur.code === 413 ? 413 : 400;
    envoyerJson(reponse, code, { ok: false, erreur: 'requete', message: erreur.message });
  });
}

function traiterRequete(requete, reponse) {
  const url = new URL(requete.url, 'http://localhost');
  const chemin = url.pathname;

  /* ── Santé (utilisée par le site pour détecter le mode serveur) ── */
  if (chemin === '/api/sante') {
    envoyerJson(reponse, 200, { ok: true, service: 'yallah-services', candidatures: donnees.candidatures.length });
    return;
  }

  /* ── Dépôt d'une candidature ── */
  if (chemin === '/api/candidature') {
    if (requete.method !== 'POST') {
      envoyerJson(reponse, 405, { ok: false, erreur: 'methode', message: 'Utilisez POST.' }, { Allow: 'POST' });
      return;
    }
    traiterCandidature(requete, reponse);
    return;
  }

  /* ── Espace recruteur (API) ── */
  if (chemin.indexOf('/api/admin') === 0) {
    if (!autorise(requete, url)) {
      envoyerJson(reponse, 403, { ok: false, erreur: 'cle_invalide', message: "Clé d'accès invalide." });
      return;
    }

    if (chemin === '/api/admin/candidatures' && requete.method === 'GET') {
      envoyerJson(reponse, 200, {
        ok: true,
        statistiques: statistiques(),
        candidatures: donnees.candidatures.slice().reverse(),
        contacts: { whatsapp: WHATSAPP_CANDIDATS, email: CONTACT_EMAIL }
      });
      return;
    }

    if (chemin === '/api/admin/export.csv' && requete.method === 'GET') {
      const corps = Buffer.from(construireCsv(), 'utf8');
      reponse.writeHead(200, entetesSecurite({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Length': corps.length,
        'Content-Disposition': 'attachment; filename="candidatures-yallah-services-' +
          new Date().toISOString().slice(0, 10) + '.csv"',
        'Cache-Control': 'no-store'
      }));
      reponse.end(corps);
      return;
    }

    const suppression = /^\/api\/admin\/candidature\/([A-Za-z0-9\-]+)$/.exec(chemin);
    if (suppression && (requete.method === 'DELETE' || requete.method === 'POST')) {
      const numero = suppression[1];
      const avant = donnees.candidatures.length;
      donnees.candidatures = donnees.candidatures.filter((c) => c.numero !== numero);
      if (donnees.candidatures.length === avant) {
        envoyerJson(reponse, 404, { ok: false, erreur: 'introuvable', message: 'Dossier introuvable.' });
        return;
      }
      ecrireDonnees().then(() => {
        console.log('[admin] dossier supprimé : ' + numero);
        envoyerJson(reponse, 200, { ok: true, supprime: numero });
      }).catch(() => {
        envoyerJson(reponse, 500, { ok: false, erreur: 'ecriture', message: 'Suppression non enregistrée.' });
      });
      return;
    }

    envoyerJson(reponse, 404, { ok: false, erreur: 'inconnue', message: 'Route inconnue.' });
    return;
  }

  /* ── Espace recruteur (page) ── */
  if (chemin === '/admin' || chemin === '/admin/' || chemin === '/admin.html') {
    const fichier = path.join(RACINE, 'admin.html');
    if (!fs.existsSync(fichier)) { envoyerTexte(reponse, 404, 'Espace recruteur indisponible.'); return; }
    const corps = fs.readFileSync(fichier);
    reponse.writeHead(200, entetesSecurite({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': corps.length,
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store'
    }));
    reponse.end(corps);
    return;
  }

  /* ── Configuration injectée ── */
  if (chemin === '/assets/js/config.js') {
    const corps = Buffer.from(scriptConfig(), 'utf8');
    reponse.writeHead(200, entetesSecurite({
      'Content-Type': 'application/javascript; charset=utf-8',
      'Content-Length': corps.length,
      'Cache-Control': 'no-store'
    }));
    reponse.end(corps);
    return;
  }

  /* ── Fichiers statiques ── */
  if (requete.method === 'GET' || requete.method === 'HEAD') {
    const fichier = fichierStatique(chemin);
    if (fichier) {
      const extension = path.extname(fichier).toLowerCase();
      const statistiquesFichier = fs.statSync(fichier);
      const immutable = chemin.indexOf('/assets/') === 0;
      /* Lecture et navigation natives dans les MP4 (notamment sur mobile).
         Vercel gère ces requêtes Range pour la version statique. */
      if (extension === '.mp4') {
        const taille = statistiquesFichier.size;
        const entetes = entetesSecurite({
          'Content-Type': TYPES[extension],
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400'
        });
        const plage = requete.method === 'GET' && /^bytes=(\d*)-(\d*)$/.exec(requete.headers.range || '');
        if (plage && (plage[1] || plage[2])) {
          const debut = plage[1] ? Number(plage[1]) : Math.max(0, taille - Number(plage[2]));
          const fin = plage[1] && plage[2] ? Math.min(Number(plage[2]), taille - 1) : taille - 1;
          if (!Number.isSafeInteger(debut) || !Number.isSafeInteger(fin) || debut > fin || debut >= taille) {
            reponse.writeHead(416, { ...entetes, 'Content-Range': 'bytes */' + taille });
            reponse.end();
            return;
          }
          reponse.writeHead(206, { ...entetes,
            'Content-Range': 'bytes ' + debut + '-' + fin + '/' + taille,
            'Content-Length': fin - debut + 1
          });
          fs.createReadStream(fichier, { start: debut, end: fin }).pipe(reponse);
        } else {
          reponse.writeHead(200, { ...entetes, 'Content-Length': taille });
          if (requete.method === 'HEAD') reponse.end();
          else fs.createReadStream(fichier).pipe(reponse);
        }
        return;
      }
      reponse.writeHead(200, entetesSecurite({
        'Content-Type': TYPES[extension] || 'application/octet-stream',
        'Content-Length': statistiquesFichier.size,
        'Cache-Control': immutable ? 'public, max-age=86400' : 'no-cache'
      }));
      if (requete.method === 'HEAD') { reponse.end(); return; }
      fs.createReadStream(fichier).pipe(reponse);
      return;
    }
  }

  envoyerTexte(reponse, 404, 'Page introuvable — Yallah Services');
}

/* ─────────────────────────── DÉMARRAGE ─────────────────────────── */

chargerDonnees();

const serveur = http.createServer((requete, reponse) => {
  try {
    traiterRequete(requete, reponse);
  } catch (erreur) {
    console.error('[erreur]', erreur);
    envoyerTexte(reponse, 500, 'Erreur interne du serveur.');
  }
});

serveur.listen(PORT, '0.0.0.0', () => {
  const ligne = '─'.repeat(62);
  console.log(ligne);
  console.log('  YALLAH SERVICES — serveur de recrutement');
  console.log(ligne);
  console.log('  Accueil foyers   : http://localhost:' + PORT + '/');
  console.log('  Fiche candidat   : http://localhost:' + PORT + '/candidature.html');
  console.log('  Espace recruteur : http://localhost:' + PORT + '/admin');
  console.log('  WhatsApp foyers    : ' + afficherNumero(WHATSAPP_FOYERS));
  console.log('  WhatsApp candidats : ' + afficherNumero(WHATSAPP_CANDIDATS));
  console.log('  E-mail références  : ' + CONTACT_EMAIL);
  console.log('  Dossiers enregistrés : ' + donnees.candidatures.length + ' (' + FICHIER_DONNEES + ')');
  if (CLE_PAR_DEFAUT) {
    console.log('');
    console.log('  ⚠️  ADMIN_KEY non définie : clé par défaut « ' + ADMIN_KEY + ' »');
    console.log('      Lancez plutôt : ADMIN_KEY=\'VotreCle\' node server.js');
  }
  console.log(ligne);
});

process.on('SIGINT', () => {
  console.log('\nArrêt du serveur — données enregistrées dans ' + FICHIER_DONNEES);
  serveur.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500);
});
