'use strict';

// Seules les deux valeurs publiques Supabase sont exposées au navigateur.
// SUPABASE_SERVICE_ROLE_KEY ne doit JAMAIS être renvoyée par cette route.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return res.status(503).json({
      error: 'Configuration Supabase incomplète. Consultez docs/CRM-DEPLOIEMENT.md.'
    });
  }

  return res.status(200).json({ supabaseUrl: url, supabaseAnonKey: anonKey });
};
