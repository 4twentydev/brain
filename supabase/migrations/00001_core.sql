-- ============================================================
-- Brain: Core tables (workspaces, profiles, workspace_members)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Profiles ───────────────────────────────────────────────
-- Extends auth.users with app-specific data.
-- Trigger auto-creates a profile row on sign-up.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  default_workspace_id uuid, -- FK added after workspaces table exists
  preferences jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Workspaces ─────────────────────────────────────────────

create table public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users on delete cascade,
  type text not null check (type in ('organization', 'personal')),
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

-- Now add the FK from profiles to workspaces
alter table public.profiles
  add constraint profiles_default_workspace_id_fkey
  foreign key (default_workspace_id) references public.workspaces (id)
  on delete set null;

-- ─── Workspace Members ──────────────────────────────────────

create table public.workspace_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'worker' check (role in ('admin', 'worker')),
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  unique (workspace_id, user_id)
);

alter table public.workspace_members enable row level security;

-- ─── RLS Policies ───────────────────────────────────────────

-- Workspaces: users can see workspaces they belong to
create policy "Members can view workspace"
  on public.workspaces for select
  using (
    id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

-- Workspaces: only admins can update
create policy "Admins can update workspace"
  on public.workspaces for update
  using (
    id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Workspaces: any authenticated user can create (they become admin)
create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

-- Workspace members: members can view other members in their workspace
create policy "Members can view workspace members"
  on public.workspace_members for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members wm
      where wm.user_id = auth.uid()
    )
  );

-- Workspace members: admins can insert/update members
create policy "Admins can manage members"
  on public.workspace_members for insert
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update members"
  on public.workspace_members for update
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── Auto-create personal workspace on sign-up ─────────────

create or replace function public.handle_new_user_workspace()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  ws_id uuid;
begin
  -- Create personal workspace
  insert into public.workspaces (name, slug, owner_id, type)
  values ('Personal', 'personal-' || new.id, new.id, 'personal')
  returning id into ws_id;

  -- Add user as admin of personal workspace
  insert into public.workspace_members (workspace_id, user_id, role, joined_at)
  values (ws_id, new.id, 'admin', now());

  -- Set as default workspace
  update public.profiles
  set default_workspace_id = ws_id
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_created_workspace
  after insert on auth.users
  for each row execute function public.handle_new_user_workspace();

-- ─── Updated_at trigger ─────────────────────────────────────

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.update_updated_at();
