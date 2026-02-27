-- ============================================================
-- Brain: Reminders, Notifications, Push Tokens, Activity Log
-- ============================================================

-- ─── Reminders ──────────────────────────────────────────────

create table public.reminders (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  task_id uuid references public.tasks on delete set null,
  title text not null,
  body text,
  remind_at timestamptz not null,
  recurrence jsonb, -- { interval: 'daily'|'weekly'|'monthly', days: [...] }
  status text not null default 'pending' check (status in ('pending', 'sent', 'dismissed')),
  created_at timestamptz not null default now()
);

create index reminders_user_id_idx on public.reminders (user_id);
create index reminders_remind_at_idx on public.reminders (remind_at) where status = 'pending';

alter table public.reminders enable row level security;

create policy "Users can view own reminders"
  on public.reminders for select
  using (user_id = auth.uid());

create policy "Users can manage own reminders"
  on public.reminders for all
  using (user_id = auth.uid());

-- ─── Notifications ──────────────────────────────────────────

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  workspace_id uuid not null references public.workspaces on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);
create index notifications_unread_idx on public.notifications (user_id) where read = false;

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

-- ─── Push Tokens ────────────────────────────────────────────

create table public.push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  token text not null,
  device_name text,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  unique (user_id, token)
);

alter table public.push_tokens enable row level security;

create policy "Users can manage own push tokens"
  on public.push_tokens for all
  using (user_id = auth.uid());

-- ─── Activity Log ───────────────────────────────────────────

create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action text not null check (action in ('created', 'updated', 'deleted', 'status_changed')),
  changes jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index activity_log_workspace_idx on public.activity_log (workspace_id, created_at desc);
create index activity_log_entity_idx on public.activity_log (entity_type, entity_id);

alter table public.activity_log enable row level security;

create policy "Members can view workspace activity"
  on public.activity_log for select
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

-- Insert-only for the system (via triggers/edge functions)
create policy "System can insert activity"
  on public.activity_log for insert
  with check (user_id = auth.uid());
