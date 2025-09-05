-- 001_init_schema.sql
BEGIN;

-- Extensions
create extension if not exists pgcrypto;

-- 1) Tables de base
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id),
  name text not null,
  join_enabled boolean not null default true,
  join_code text unique,
  image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('owner','admin','member')),
  status text not null default 'active' check (status in ('active','inactive','banned','left')),
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists group_settings (
  group_id uuid primary key references groups(id) on delete cascade,
  drop_time time,
  notifications_enabled boolean not null default true,
  allow_global_prompts boolean not null default true,
  group_audience_tag_id uuid
);

create table if not exists prompt_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('audience')),
  created_at timestamptz not null default now(),
  unique (name, category)
);

alter table group_settings
  add constraint fk_group_audience_tag
  foreign key (group_audience_tag_id) references prompt_tags(id);

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('group','global')),
  owner_group_id uuid references groups(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected','archived')),
  is_enabled boolean not null default true,
  type text not null check (type in ('question','vote','challenge')),
  title text not null,
  body text,
  audience_tag_id uuid references prompt_tags(id),
  min_group_size int,
  max_group_size int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prompt_tag_links (
  prompt_id uuid not null references prompts(id) on delete cascade,
  tag_id uuid not null references prompt_tags(id) on delete cascade,
  primary key (prompt_id, tag_id)
);

create table if not exists group_prompt_blocks (
  group_id uuid not null references groups(id) on delete cascade,
  prompt_id uuid not null references prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, prompt_id)
);

create table if not exists daily_rounds (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  scheduled_for_local_date date not null,
  status text not null check (status in ('scheduled','open','closed')),
  open_at timestamptz,
  close_at timestamptz,
  -- snapshot inline
  source_prompt_id uuid,
  resolved_scope text check (resolved_scope in ('group','global')),
  resolved_owner_group_id uuid,
  resolved_type text check (resolved_type in ('question','vote','challenge')),
  resolved_title text,
  resolved_body text,
  resolved_audience_tag_id uuid,
  resolved_min_group_size int,
  resolved_max_group_size int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, scheduled_for_local_date)
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references daily_rounds(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text,
  created_at timestamptz not null default now(),
  deleted_by_admin uuid references profiles(id),
  deleted_at timestamptz,
  unique (round_id, author_id)
);

create table if not exists submission_media (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  storage_path text not null,
  kind text not null check (kind in ('image','video','audio','file')),
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references daily_rounds(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_by_admin uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists round_votes (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references daily_rounds(id) on delete cascade,
  voter_id uuid not null references profiles(id) on delete cascade,
  target_user_id uuid not null references profiles(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (round_id, voter_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  type text not null check (type in (
    'round_open','transfer_requested','transfer_accepted','transfer_rejected',
    'group_prompt_pending','group_prompt_resolved','global_prompt_pending','global_prompt_resolved'
  )),
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  platform text not null check (platform in ('ios','android','web')),
  token text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_group_prefs (
  user_id uuid not null references profiles(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  mute boolean not null default false,
  push boolean not null default true,
  primary key (user_id, group_id)
);

create table if not exists group_ownership_transfers (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  from_user_id uuid not null references profiles(id) on delete cascade,
  to_user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Index clés
create index if not exists idx_rounds_status_close_at on daily_rounds(status, close_at);
create index if not exists idx_submissions_round_author on submissions(round_id, author_id);
create index if not exists idx_votes_round_voter on round_votes(round_id, voter_id);
create index if not exists idx_group_members_membership on group_members(group_id, user_id, status);

-- 3) Contraintes d'unicité spécifiques
-- Uniqueness already enforced by table constraints above; no duplicate indexes needed

COMMIT;
