-- ============================================================
-- Brain: Tasks, Projects, Labels, Comments, Attachments
-- ============================================================

-- ─── Projects ───────────────────────────────────────────────

create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'on_hold', 'completed', 'archived')),
  color text,
  icon text,
  lead_id uuid references public.profiles on delete set null,
  start_date date,
  target_date date,
  created_by uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Members can view workspace projects"
  on public.projects for select
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "Admins can manage projects"
  on public.projects for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin'));

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at();

-- ─── Labels ─────────────────────────────────────────────────

create table public.labels (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  name text not null,
  color text not null default '#3b82f6'
);

alter table public.labels enable row level security;

create policy "Members can view workspace labels"
  on public.labels for select
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "Admins can manage labels"
  on public.labels for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin'));

-- ─── Tasks ──────────────────────────────────────────────────

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  project_id uuid references public.projects on delete set null,
  parent_id uuid references public.tasks on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('backlog', 'todo', 'in_progress', 'done', 'cancelled')),
  priority text not null default 'none' check (priority in ('urgent', 'high', 'medium', 'low', 'none')),
  type text not null default 'task' check (type in ('task', 'bug', 'feature', 'shopping_item', 'maintenance', 'reminder')),
  assignee_id uuid references public.profiles on delete set null,
  due_date timestamptz,
  completed_at timestamptz,
  position float8 not null default 0,
  created_by uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_workspace_id_idx on public.tasks (workspace_id);
create index tasks_project_id_idx on public.tasks (project_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index tasks_status_idx on public.tasks (workspace_id, status);
create index tasks_parent_id_idx on public.tasks (parent_id);

alter table public.tasks enable row level security;

-- Members can view all workspace tasks
create policy "Members can view workspace tasks"
  on public.tasks for select
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

-- Admins have full access; workers can insert/update tasks assigned to them or created by them
create policy "Admins can manage all tasks"
  on public.tasks for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin'));

create policy "Workers can create tasks"
  on public.tasks for insert
  with check (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
    and created_by = auth.uid()
  );

create policy "Workers can update assigned tasks"
  on public.tasks for update
  using (
    workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
    and (assignee_id = auth.uid() or created_by = auth.uid())
  );

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.update_updated_at();

-- ─── Task Labels (junction) ────────────────────────────────

create table public.task_labels (
  task_id uuid not null references public.tasks on delete cascade,
  label_id uuid not null references public.labels on delete cascade,
  primary key (task_id, label_id)
);

alter table public.task_labels enable row level security;

create policy "Members can view task labels"
  on public.task_labels for select
  using (task_id in (select id from public.tasks where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())));

create policy "Admins can manage task labels"
  on public.task_labels for all
  using (task_id in (select id from public.tasks where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role = 'admin')));

-- ─── Comments ───────────────────────────────────────────────

create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks on delete cascade,
  author_id uuid not null references public.profiles on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Members can view task comments"
  on public.comments for select
  using (task_id in (select id from public.tasks where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())));

create policy "Users can create comments"
  on public.comments for insert
  with check (author_id = auth.uid());

create policy "Users can update own comments"
  on public.comments for update
  using (author_id = auth.uid());

create trigger comments_updated_at
  before update on public.comments
  for each row execute function public.update_updated_at();

-- ─── Task Attachments ───────────────────────────────────────

create table public.task_attachments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks on delete cascade,
  file_name text not null,
  file_url text not null,
  file_size bigint not null default 0,
  mime_type text not null default 'application/octet-stream',
  uploaded_by uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.task_attachments enable row level security;

create policy "Members can view task attachments"
  on public.task_attachments for select
  using (task_id in (select id from public.tasks where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())));

create policy "Users can upload attachments"
  on public.task_attachments for insert
  with check (uploaded_by = auth.uid());
