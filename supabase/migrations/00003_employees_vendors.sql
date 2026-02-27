-- ============================================================
-- Brain: Employees and Vendors
-- ============================================================

-- ─── Employees ──────────────────────────────────────────────

create table public.employees (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  user_id uuid references auth.users on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  role_title text,
  department text,
  hire_date date,
  status text not null default 'active' check (status in ('active', 'inactive', 'terminated')),
  hourly_rate numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employees_workspace_id_idx on public.employees (workspace_id);

alter table public.employees enable row level security;

create policy "Members can view workspace employees"
  on public.employees for select
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "Admins can manage employees"
  on public.employees for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin'));

create trigger employees_updated_at
  before update on public.employees
  for each row execute function public.update_updated_at();

-- ─── Vendors ────────────────────────────────────────────────

create table public.vendors (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  website text,
  category text not null default 'service' check (category in ('material_supplier', 'equipment', 'subcontractor', 'service')),
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vendors_workspace_id_idx on public.vendors (workspace_id);

alter table public.vendors enable row level security;

create policy "Members can view workspace vendors"
  on public.vendors for select
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "Admins can manage vendors"
  on public.vendors for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin'));

create trigger vendors_updated_at
  before update on public.vendors
  for each row execute function public.update_updated_at();
