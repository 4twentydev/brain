-- ============================================================
-- Brain: Machines and Maintenance Logs
-- ============================================================

-- ─── Machines ───────────────────────────────────────────────

create table public.machines (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  name text not null,
  model text,
  serial_number text,
  location text,
  status text not null default 'operational' check (status in ('operational', 'maintenance', 'down', 'retired')),
  purchase_date date,
  last_service_date date,
  next_service_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index machines_workspace_id_idx on public.machines (workspace_id);

alter table public.machines enable row level security;

create policy "Members can view workspace machines"
  on public.machines for select
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "Admins can manage machines"
  on public.machines for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin'));

create trigger machines_updated_at
  before update on public.machines
  for each row execute function public.update_updated_at();

-- ─── Maintenance Logs ───────────────────────────────────────

create table public.maintenance_logs (
  id uuid primary key default uuid_generate_v4(),
  machine_id uuid not null references public.machines on delete cascade,
  performed_by uuid references public.employees on delete set null,
  type text not null default 'preventive' check (type in ('preventive', 'corrective', 'inspection')),
  description text not null,
  parts_used jsonb not null default '[]',
  cost numeric,
  performed_at timestamptz not null default now(),
  next_due timestamptz,
  created_at timestamptz not null default now()
);

create index maintenance_logs_machine_id_idx on public.maintenance_logs (machine_id);

alter table public.maintenance_logs enable row level security;

create policy "Members can view maintenance logs"
  on public.maintenance_logs for select
  using (
    machine_id in (
      select id from public.machines
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
    )
  );

create policy "Admins can manage maintenance logs"
  on public.maintenance_logs for all
  using (
    machine_id in (
      select id from public.machines
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin')
    )
  );
