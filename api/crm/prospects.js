'use strict';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SEGMENTS = new Set(['Particulier', 'Entreprise', 'Partenaire']);
const STATUSES = new Set(['Nouveau', 'À contacter', 'Contacté', 'Qualifié', 'Client', 'Non prioritaire']);

function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function authorize(req) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!url || !anon || !service || !match) return { error: 'Configuration ou session manquante.', status: 401 };

  const userResponse = await fetch(url.replace(/\/$/, '') + '/auth/v1/user', {
    headers: { apikey: anon, Authorization: 'Bearer ' + match[1] }
  });
  if (!userResponse.ok) return { error: 'Session invalide ou expirée.', status: 401 };
  const user = await userResponse.json();

  const adminResponse = await fetch(
    url.replace(/\/$/, '') + '/rest/v1/crm_admins?user_id=eq.' +
      encodeURIComponent(user.id) + '&active=eq.true&select=user_id&limit=1',
    { headers: { apikey: service, Authorization: 'Bearer ' + service } }
  );
  if (!adminResponse.ok) return { error: 'Vérification des droits impossible.', status: 503 };
  const admins = await adminResponse.json();
  if (!Array.isArray(admins) || admins.length === 0) return { error: 'Accès CRM non autorisé.', status: 403 };

  return { user, url: url.replace(/\/$/, ''), service };
}

async function dbRequest(auth, path, options = {}) {
  return fetch(auth.url + '/rest/v1/' + path, {
    ...options,
    headers: {
      apikey: auth.service,
      Authorization: 'Bearer ' + auth.service,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}

module.exports = async function handler(req, res) {
  const auth = await authorize(req).catch(() => ({ error: 'Service d’authentification indisponible.', status: 503 }));
  if (auth.error) return json(res, auth.status, { error: auth.error });

  if (req.method === 'GET') {
    const response = await dbRequest(auth, 'prospects?select=id,nom,organisation,segment,ville,telephone,email,source,statut,notes,created_at,updated_at&order=created_at.desc&limit=200');
    if (!response.ok) return json(res, 502, { error: 'Impossible de charger les prospects.' });
    return json(res, 200, { prospects: await response.json() });
  }

  if (req.method === 'POST') {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const nom = clean(body.nom, 120);
    const segment = clean(body.segment, 30);
    if (nom.length < 2) return json(res, 400, { error: 'Le nom du prospect doit contenir au moins 2 caractères.' });
    if (!SEGMENTS.has(segment)) return json(res, 400, { error: 'Segment invalide.' });

    const payload = {
      nom,
      organisation: clean(body.organisation, 160) || null,
      segment,
      ville: clean(body.ville, 100) || null,
      telephone: clean(body.telephone, 40) || null,
      email: clean(body.email, 254).toLowerCase() || null,
      source: clean(body.source, 80) || 'Saisie manuelle',
      statut: 'Nouveau',
      notes: clean(body.notes, 4000) || null,
      created_by: auth.user.id
    };
    const response = await dbRequest(auth, 'prospects', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return json(res, 502, { error: 'Enregistrement impossible. Vérifiez la migration SQL Supabase.' });
    const rows = await response.json();
    return json(res, 201, { prospect: rows[0] });
  }

  if (req.method === 'PATCH') {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const id = clean(body.id, 36);
    if (!UUID_RE.test(id)) return json(res, 400, { error: 'Identifiant prospect invalide.' });
    const patch = {};
    if (typeof body.statut === 'string') {
      if (!STATUSES.has(body.statut)) return json(res, 400, { error: 'Statut invalide.' });
      patch.statut = body.statut;
    }
    if (typeof body.notes === 'string') patch.notes = clean(body.notes, 4000) || null;
    if (typeof body.telephone === 'string') patch.telephone = clean(body.telephone, 40) || null;
    if (typeof body.email === 'string') patch.email = clean(body.email, 254).toLowerCase() || null;
    if (Object.keys(patch).length === 0) return json(res, 400, { error: 'Aucune modification valide.' });
    patch.updated_at = new Date().toISOString();

    const response = await dbRequest(auth, 'prospects?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(patch)
    });
    if (!response.ok) return json(res, 502, { error: 'Modification impossible.' });
    const rows = await response.json();
    if (!rows.length) return json(res, 404, { error: 'Prospect introuvable.' });
    return json(res, 200, { prospect: rows[0] });
  }

  res.setHeader('Allow', 'GET, POST, PATCH');
  return json(res, 405, { error: 'Méthode non autorisée.' });
};
