'use strict';

(async function () {
  const $ = (id) => document.getElementById(id);
  const loginPanel = $('loginPanel');
  const crmPanel = $('crmPanel');
  const loginMessage = $('loginMessage');
  const formMessage = $('formMessage');
  const listMessage = $('listMessage');
  let supabase;
  let prospects = [];

  function message(node, text, error = false) {
    node.textContent = text || '';
    node.classList.toggle('error', Boolean(error));
  }

  async function init() {
    if (!window.supabase || !window.supabase.createClient) {
      message(loginMessage, 'Le module de connexion ne s’est pas chargé. Rechargez la page.', true);
      return;
    }
    try {
      const configResponse = await fetch('/api/crm/config', { cache: 'no-store' });
      const config = await configResponse.json();
      if (!configResponse.ok) throw new Error(config.error || 'Configuration indisponible.');
      supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data } = await supabase.auth.getSession();
      if (data.session) await enterCRM();
    } catch (error) {
      message(loginMessage, error.message || 'Connexion impossible.', true);
    }
  }

  async function api(path, options = {}) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error('Session expirée. Reconnectez-vous.');
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + data.session.access_token,
        ...(options.headers || {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Une erreur est survenue.');
    return payload;
  }

  async function enterCRM() {
    loginPanel.hidden = true;
    crmPanel.hidden = false;
    try {
      await loadProspects();
    } catch (error) {
      crmPanel.hidden = true;
      loginPanel.hidden = false;
      message(loginMessage, error.message, true);
      await supabase.auth.signOut();
    }
  }

  async function loadProspects() {
    const result = await api('/api/crm/prospects');
    prospects = result.prospects || [];
    render();
  }

  function render() {
    const query = $('searchInput').value.trim().toLocaleLowerCase('fr');
    const filtered = prospects.filter((p) =>
      [p.nom, p.organisation, p.segment, p.ville, p.telephone, p.email, p.source]
        .filter(Boolean).join(' ').toLocaleLowerCase('fr').includes(query)
    );
    $('totalCount').textContent = prospects.length;
    $('newCount').textContent = prospects.filter((p) => p.statut === 'Nouveau').length;
    $('qualifiedCount').textContent = prospects.filter((p) => p.statut === 'Qualifié').length;
    const tbody = $('prospectRows');
    tbody.replaceChildren();
    if (!filtered.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.className = 'empty';
      cell.textContent = prospects.length ? 'Aucun résultat pour cette recherche.' : 'Aucun prospect enregistré.';
      row.appendChild(cell);
      tbody.appendChild(row);
      return;
    }
    filtered.forEach((p) => {
      const row = document.createElement('tr');
      const name = document.createElement('td');
      const strong = document.createElement('strong');
      strong.textContent = p.nom;
      name.appendChild(strong);
      if (p.organisation) {
        const sub = document.createElement('div');
        sub.className = 'status-note';
        sub.textContent = p.organisation;
        name.appendChild(sub);
      }
      const segment = document.createElement('td'); segment.textContent = p.segment;
      const city = document.createElement('td'); city.textContent = p.ville || '—';
      const contact = document.createElement('td'); contact.className = 'contact';
      contact.textContent = [p.telephone, p.email].filter(Boolean).join(' · ') || '—';
      const status = document.createElement('td');
      const select = document.createElement('select');
      ['Nouveau', 'À contacter', 'Contacté', 'Qualifié', 'Client', 'Non prioritaire'].forEach((value) => {
        const option = document.createElement('option');
        option.value = value; option.textContent = value; option.selected = p.statut === value;
        select.appendChild(option);
      });
      select.addEventListener('change', async () => {
        select.disabled = true;
        try {
          const result = await api('/api/crm/prospects', { method: 'PATCH', body: JSON.stringify({ id: p.id, statut: select.value }) });
          Object.assign(p, result.prospect);
          message(listMessage, 'Statut mis à jour.');
          render();
        } catch (error) {
          select.value = p.statut;
          message(listMessage, error.message, true);
          select.disabled = false;
        }
      });
      status.appendChild(select);
      const created = document.createElement('td');
      created.textContent = p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—';
      row.append(name, segment, city, contact, status, created);
      tbody.appendChild(row);
    });
  }

  $('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    message(loginMessage, 'Connexion en cours…');
    const { error } = await supabase.auth.signInWithPassword({
      email: $('loginEmail').value.trim(),
      password: $('loginPassword').value
    });
    if (error) return message(loginMessage, 'Identifiants incorrects ou compte non activé.', true);
    message(loginMessage, '');
    await enterCRM();
  });

  $('logoutButton').addEventListener('click', async () => {
    await supabase.auth.signOut();
    crmPanel.hidden = true;
    loginPanel.hidden = false;
    $('loginPassword').value = '';
    message(loginMessage, 'Vous êtes déconnecté.');
  });

  $('prospectForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.submitter;
    button.disabled = true;
    message(formMessage, 'Enregistrement…');
    const payload = {
      nom: $('nom').value,
      organisation: $('organisation').value,
      segment: $('segment').value,
      ville: $('ville').value,
      telephone: $('telephone').value,
      email: $('email').value,
      source: $('source').value,
      notes: $('notes').value
    };
    try {
      await api('/api/crm/prospects', { method: 'POST', body: JSON.stringify(payload) });
      $('prospectForm').reset();
      message(formMessage, 'Prospect enregistré.');
      await loadProspects();
    } catch (error) {
      message(formMessage, error.message, true);
    } finally {
      button.disabled = false;
    }
  });

  $('searchInput').addEventListener('input', render);
  init();
})();
