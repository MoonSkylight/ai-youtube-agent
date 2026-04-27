create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  display_name text,
  business_name text,
  niche text,
  timezone text default 'Australia/Melbourne',
  preferred_tone text,
  work_hours_per_day numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  details text,
  category text not null,
  priority text not null default 'medium',
  status text not null default 'draft',
  due_at timestamptz,
  source_agent text,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  requested_by_agent text not null,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  sku text,
  title text,
  brand text,
  category text,
  cost_price numeric,
  sell_price numeric,
  quantity integer default 0,
  marketplace text,
  source_status text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid references products(id) on delete set null,
  marketplace text not null,
  status text not null default 'draft',
  external_listing_id text,
  title text,
  bullets jsonb,
  description text,
  keywords jsonb,
  price numeric,
  ai_score numeric,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  platform text not null,
  topic text,
  hook text,
  angle text,
  target_audience text,
  status text not null default 'draft',
  created_by text default 'agent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  content_idea_id uuid references content_ideas(id) on delete set null,
  platform text not null,
  title text,
  hook text,
  script_body text,
  cta text,
  caption text,
  hashtags jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  script_id uuid references scripts(id) on delete set null,
  title text not null,
  platform_target text not null,
  file_asset_id uuid,
  thumbnail_asset_id uuid,
  caption text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  script_id uuid references scripts(id) on delete set null,
  asset_type text not null,
  storage_path text not null,
  mime_type text,
  duration_seconds numeric,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists publish_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  video_id uuid,
  platform text not null,
  scheduled_for timestamptz,
  external_post_id text,
  status text not null default 'queued',
  failure_reason text,
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  summary text,
  target_users text,
  platform_type text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_features (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references app_projects(id) on delete cascade,
  name text not null,
  description text,
  priority text not null default 'medium',
  status text not null default 'draft',
  spec text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  routine_date date not null,
  morning_plan text,
  top_priorities jsonb,
  completed_summary text,
  carryover_tasks jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  snapshot_date date not null,
  open_tasks integer not null default 0,
  pending_approvals integer not null default 0,
  listing_drafts integer not null default 0,
  script_drafts integer not null default 0,
  queued_publish_jobs integer not null default 0,
  posted_publish_jobs integer not null default 0,
  app_projects integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists event_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  status text not null default 'info',
  message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text,
  level text not null default 'info',
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists integration_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null,
  is_enabled boolean not null default false,
  mode text,
  account_label text,
  config jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists integration_settings_user_provider_idx on integration_settings (user_id, provider);

create table if not exists oauth_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null,
  external_account_id text,
  account_label text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scope text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists oauth_connections_user_provider_idx on oauth_connections (user_id, provider);

create table if not exists sync_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null,
  job_type text not null,
  status text not null default 'queued',
  started_at timestamptz,
  completed_at timestamptz,
  failure_reason text,
  attempts integer not null default 0,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists import_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null,
  sync_job_id uuid references sync_jobs(id) on delete set null,
  entity_type text not null,
  imported_count integer not null default 0,
  skipped_count integer not null default 0,
  failed_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists worker_locks (
  lock_key text primary key,
  acquired_at timestamptz not null default now(),
  expires_at timestamptz not null,
  metadata jsonb
);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  agent_name text not null,
  input_summary text,
  output_summary text,
  status text not null default 'completed',
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz not null default now()
);
