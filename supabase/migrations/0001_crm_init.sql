-- Yallah Services CRM — migration initiale
-- À exécuter dans Supabase SQL Editor, sur un projet dédié.
-- Le navigateur ne reçoit jamais la clé service_role.

create extension if not exists pgcrypto;

create table if not exists public.crm_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'manager')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(trim(nom)) >= 2),
  organisation text,
  segment text not null check (segment in ('Particulier', 'Entreprise', 'Partenaire')),
  ville text,
  telephone text,
  email text,
  source text not null default 'Saisie manuelle',
  statut text not null default 'Nouveau'
    check (statut in ('Nouveau', 'À contacter', 'Contacté', 'Qualifié', 'Client', 'Non prioritaire')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  type text not null check (type in ('appel', 'email', 'linkedin', 'whatsapp', 'reunion', 'note')),
  contenu text not null,
  auteur uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.prospects(id) on delete cascade,
  titre text not null,
  echeance timestamptz,
  statut text not null default 'À faire' check (statut in ('À faire', 'En cours', 'Terminée', 'Annulée')),
  assignee uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  canal text not null check (canal in ('linkedin', 'email', 'whatsapp')),
  segment text,
  contenu text not null,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists prospects_statut_idx on public.prospects(statut);
create index if not exists prospects_segment_idx on public.prospects(segment);
create index if not exists prospects_ville_idx on public.prospects(ville);
create index if not exists prospects_created_at_idx on public.prospects(created_at desc);
create index if not exists interactions_prospect_idx on public.interactions(prospect_id, created_at desc);
create index if not exists tasks_echeance_idx on public.tasks(echeance) where statut <> 'Terminée';

alter table public.crm_admins enable row level security;
alter table public.prospects enable row level security;
alter table public.interactions enable row level security;
alter table public.tasks enable row level security;
alter table public.message_templates enable row level security;
alter table public.audit_logs enable row level security;

-- Les appels API du CRM vérifient le JWT et l'appartenance à crm_admins
-- côté serveur, puis utilisent la clé service_role conservée dans Vercel.
-- Les politiques ci-dessous protègent également les accès directs éventuels.
drop policy if exists "admin can read own membership" on public.crm_admins;
create policy "admin can read own membership" on public.crm_admins
  for select to authenticated using (user_id = auth.uid() and active = true);

drop policy if exists "active admins manage prospects" on public.prospects;
create policy "active admins manage prospects" on public.prospects
  for all to authenticated using (
    exists (select 1 from public.crm_admins a where a.user_id = auth.uid() and a.active = true)
  ) with check (
    exists (select 1 from public.crm_admins a where a.user_id = auth.uid() and a.active = true)
  );

drop policy if exists "active admins manage interactions" on public.interactions;
create policy "active admins manage interactions" on public.interactions
  for all to authenticated using (
    exists (select 1 from public.crm_admins a where a.user_id = auth.uid() and a.active = true)
  ) with check (
    exists (select 1 from public.crm_admins a where a.user_id = auth.uid() and a.active = true)
  );

drop policy if exists "active admins manage tasks" on public.tasks;
create policy "active admins manage tasks" on public.tasks
  for all to authenticated using (
    exists (select 1 from public.crm_admins a where a.user_id = auth.uid() and a.active = true)
  ) with check (
    exists (select 1 from public.crm_admins a where a.user_id = auth.uid() and a.active = true)
  );

drop policy if exists "active admins manage templates" on public.message_templates;
create policy "active admins manage templates" on public.message_templates
  for all to authenticated using (
    exists (select 1 from public.crm_admins a where a.user_id = auth.uid() and a.active = true)
  ) with check (
    exists (select 1 from public.crm_admins a where a.user_id = auth.uid() and a.active = true)
  );

drop policy if exists "active admins read audit logs" on public.audit_logs;
create policy "active admins read audit logs" on public.audit_logs
  for select to authenticated using (
    exists (select 1 from public.crm_admins a where a.user_id = auth.uid() and a.active = true)
  );

-- Provisionnement du premier administrateur :
-- 1. Créer son compte dans Supabase Authentication.
-- 2. Copier son UUID depuis Authentication > Users.
-- 3. Exécuter : insert into public.crm_admins (user_id, role) values ('UUID-DU-COMPTE', 'admin');
