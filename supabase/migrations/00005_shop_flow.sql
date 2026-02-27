-- ============================================================
-- Brain: Work Orders and Shop Flow
-- ============================================================

-- ─── Work Orders ────────────────────────────────────────────

create table public.work_orders (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  project_id uuid references public.projects on delete set null,
  order_number text not null unique,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'queued', 'in_progress', 'qc', 'complete', 'shipped')),
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low', 'none')),
  assigned_to uuid references public.employees on delete set null,
  customer_name text,
  quantity int not null default 1,
  unit text not null default 'panels',
  due_date date,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_by uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index work_orders_workspace_id_idx on public.work_orders (workspace_id);
create index work_orders_status_idx on public.work_orders (workspace_id, status);

alter table public.work_orders enable row level security;

create policy "Members can view workspace work orders"
  on public.work_orders for select
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "Admins can manage work orders"
  on public.work_orders for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin'));

create trigger work_orders_updated_at
  before update on public.work_orders
  for each row execute function public.update_updated_at();

-- ─── Work Order Steps ───────────────────────────────────────

create table public.work_order_steps (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid not null references public.work_orders on delete cascade,
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'complete', 'skipped')),
  assigned_to uuid references public.employees on delete set null,
  machine_id uuid references public.machines on delete set null,
  position int not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  notes text
);

create index work_order_steps_wo_idx on public.work_order_steps (work_order_id);

alter table public.work_order_steps enable row level security;

create policy "Members can view work order steps"
  on public.work_order_steps for select
  using (
    work_order_id in (
      select id from public.work_orders
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
    )
  );

create policy "Admins can manage work order steps"
  on public.work_order_steps for all
  using (
    work_order_id in (
      select id from public.work_orders
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin')
    )
  );
