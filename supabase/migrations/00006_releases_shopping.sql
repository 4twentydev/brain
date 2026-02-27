-- ============================================================
-- Brain: Releases, Shopping Items
-- ============================================================

-- ─── Releases ───────────────────────────────────────────────

create table public.releases (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  project_id uuid not null references public.projects on delete cascade,
  version text not null,
  title text not null,
  description text,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'staging', 'released')),
  target_date date,
  released_at timestamptz,
  created_by uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.releases enable row level security;

create policy "Members can view releases"
  on public.releases for select
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "Admins can manage releases"
  on public.releases for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin'));

create trigger releases_updated_at
  before update on public.releases
  for each row execute function public.update_updated_at();

-- ─── Release Tasks (junction) ───────────────────────────────

create table public.release_tasks (
  release_id uuid not null references public.releases on delete cascade,
  task_id uuid not null references public.tasks on delete cascade,
  primary key (release_id, task_id)
);

alter table public.release_tasks enable row level security;

create policy "Members can view release tasks"
  on public.release_tasks for select
  using (
    release_id in (
      select id from public.releases
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
    )
  );

-- ─── Shopping Items ─────────────────────────────────────────
-- Extension table for tasks with type = 'shopping_item'

create table public.shopping_items (
  task_id uuid primary key references public.tasks on delete cascade,
  quantity numeric,
  unit text,
  store text,
  aisle text,
  price_estimate numeric,
  purchased boolean not null default false
);

alter table public.shopping_items enable row level security;

create policy "Members can view shopping items"
  on public.shopping_items for select
  using (
    task_id in (
      select id from public.tasks
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
    )
  );

create policy "Users can manage own shopping items"
  on public.shopping_items for all
  using (
    task_id in (
      select id from public.tasks
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
      and (assignee_id = auth.uid() or created_by = auth.uid())
    )
  );
