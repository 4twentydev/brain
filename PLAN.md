# Brain - Architecture & Implementation Plan

> All-in-one task management, project tracking, and operational database for work and life.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | pnpm workspaces + Turborepo |
| **Web** | Next.js 16+ (App Router) + Tailwind CSS 4 + shadcn/ui |
| **Mobile** | Expo SDK 52+ + NativeWind v4 |
| **Shared** | TypeScript packages for types, validation (Zod), utilities |
| **Backend** | Supabase (Postgres + Auth + RLS + Realtime + Edge Functions) |
| **Auth** | Supabase Auth (email/password + magic link) |
| **Notifications** | Expo Push Notifications + in-app notification center |
| **Deployment** | Web: Vercel | Mobile: EAS Build/Submit |

---

## 2. Monorepo Structure

```
brain/
├── apps/
│   ├── web/                    # Next.js 16 app
│   │   ├── app/                # App Router pages
│   │   ├── components/         # Web-specific components (shadcn/ui)
│   │   └── ...
│   └── mobile/                 # Expo app
│       ├── app/                # Expo Router (file-based routing)
│       ├── components/         # Mobile-specific components
│       └── ...
├── packages/
│   ├── shared/                 # Shared types, constants, utils
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces (DB row types, API types)
│   │   │   ├── constants/      # Enums, status codes, role definitions
│   │   │   ├── validation/     # Zod schemas (shared between web + mobile)
│   │   │   └── utils/          # Pure utility functions
│   │   └── package.json
│   ├── supabase/               # Supabase client, queries, hooks
│   │   ├── src/
│   │   │   ├── client.ts       # Supabase client factory
│   │   │   ├── queries/        # Typed query functions per module
│   │   │   ├── hooks/          # React hooks wrapping queries
│   │   │   └── types/          # Generated DB types (supabase gen types)
│   │   └── package.json
│   └── ui/                     # Cross-platform UI primitives (optional later)
│       └── package.json
├── supabase/
│   ├── migrations/             # SQL migrations (the source of truth)
│   ├── seed.sql                # Seed data
│   └── config.toml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── CLAUDE.md
```

---

## 3. Database Schema (Full Upfront Design)

### 3.1 Core Tables

#### `workspaces`
Multi-workspace support (Elward Systems + Personal).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| name | text | "Elward Systems", "Personal" |
| slug | text (unique) | "elward", "personal" |
| owner_id | uuid (FK → auth.users) | Creator/owner |
| type | text | 'organization' or 'personal' |
| settings | jsonb | Workspace-level config |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `workspace_members`
Maps users to workspaces with roles.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| user_id | uuid (FK → auth.users) | |
| role | text | 'admin' or 'worker' |
| invited_at | timestamptz | |
| joined_at | timestamptz | |

#### `profiles`
Extended user info beyond auth.users.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK, FK → auth.users) | |
| full_name | text | |
| avatar_url | text | |
| phone | text | For notifications |
| default_workspace_id | uuid (FK) | Last active workspace |
| preferences | jsonb | Theme, notification prefs |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### 3.2 Task Management

#### `projects`
Both work and personal projects.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| name | text | |
| description | text | |
| status | text | 'active', 'on_hold', 'completed', 'archived' |
| color | text | Hex color for UI |
| icon | text | Icon identifier |
| lead_id | uuid (FK → profiles) | Project lead |
| start_date | date | |
| target_date | date | |
| created_by | uuid (FK) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `tasks`
Central task table. Everything is a task — work items, personal todos, shopping list items, maintenance jobs.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| project_id | uuid (FK, nullable) | Optional project grouping |
| parent_id | uuid (FK → tasks, nullable) | Subtask support |
| title | text | |
| description | text | Rich text / markdown |
| status | text | 'backlog', 'todo', 'in_progress', 'done', 'cancelled' |
| priority | text | 'urgent', 'high', 'medium', 'low', 'none' |
| type | text | 'task', 'bug', 'feature', 'shopping_item', 'maintenance', 'reminder' |
| assignee_id | uuid (FK → profiles, nullable) | |
| due_date | timestamptz | |
| completed_at | timestamptz | |
| position | float8 | For manual ordering (fractional indexing) |
| created_by | uuid (FK) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `task_labels`
Many-to-many relationship for flexible tagging.

| Column | Type | Notes |
|--------|------|-------|
| task_id | uuid (FK) | |
| label_id | uuid (FK) | |

#### `labels`
Reusable labels per workspace.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| name | text | |
| color | text | |

#### `comments`
Discussion on any task.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| task_id | uuid (FK) | |
| author_id | uuid (FK → profiles) | |
| body | text | Markdown |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `task_attachments`
Files linked to tasks.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| task_id | uuid (FK) | |
| file_name | text | |
| file_url | text | Supabase Storage URL |
| file_size | int8 | Bytes |
| mime_type | text | |
| uploaded_by | uuid (FK) | |
| created_at | timestamptz | |

---

### 3.3 Employees & HR

#### `employees`
Elward Systems workforce.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| user_id | uuid (FK → auth.users, nullable) | Linked account (if they use the app) |
| first_name | text | |
| last_name | text | |
| email | text | |
| phone | text | |
| role_title | text | "Machine Operator", "Installer", etc. |
| department | text | |
| hire_date | date | |
| status | text | 'active', 'inactive', 'terminated' |
| hourly_rate | numeric | Optional |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### 3.4 Vendors & Contacts

#### `vendors`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| name | text | Company name |
| contact_name | text | Primary contact |
| email | text | |
| phone | text | |
| address | text | |
| website | text | |
| category | text | 'material_supplier', 'equipment', 'subcontractor', 'service' |
| notes | text | |
| status | text | 'active', 'inactive' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### 3.5 Machine Maintenance

#### `machines`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| name | text | "CNC Router #1", "Brake Press" |
| model | text | |
| serial_number | text | |
| location | text | Shop area/bay |
| status | text | 'operational', 'maintenance', 'down', 'retired' |
| purchase_date | date | |
| last_service_date | date | |
| next_service_date | date | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `maintenance_logs`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| machine_id | uuid (FK) | |
| performed_by | uuid (FK → employees) | |
| type | text | 'preventive', 'corrective', 'inspection' |
| description | text | What was done |
| parts_used | jsonb | Array of parts/costs |
| cost | numeric | |
| performed_at | timestamptz | |
| next_due | timestamptz | |
| created_at | timestamptz | |

---

### 3.6 Shop Flow & Production

#### `work_orders`
Production jobs flowing through the shop.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| project_id | uuid (FK, nullable) | Linked project |
| order_number | text (unique) | Human-readable ID (WO-2024-001) |
| title | text | |
| description | text | |
| status | text | 'draft', 'queued', 'in_progress', 'qc', 'complete', 'shipped' |
| priority | text | |
| assigned_to | uuid (FK → employees, nullable) | |
| customer_name | text | |
| quantity | int4 | |
| unit | text | 'panels', 'sqft', 'linear_ft', etc. |
| due_date | date | |
| started_at | timestamptz | |
| completed_at | timestamptz | |
| notes | text | |
| created_by | uuid (FK) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `work_order_steps`
Steps/stations in the production process.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| work_order_id | uuid (FK) | |
| name | text | "Cut", "Bend", "Weld", "Paint", "QC" |
| status | text | 'pending', 'in_progress', 'complete', 'skipped' |
| assigned_to | uuid (FK → employees, nullable) | |
| machine_id | uuid (FK → machines, nullable) | |
| position | int4 | Step order |
| started_at | timestamptz | |
| completed_at | timestamptz | |
| notes | text | |

---

### 3.7 Release Management

#### `releases`
Software release tracking (for your side dev projects).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| project_id | uuid (FK) | |
| version | text | Semver "1.2.0" |
| title | text | Release name |
| description | text | Changelog / release notes |
| status | text | 'planned', 'in_progress', 'staging', 'released' |
| target_date | date | |
| released_at | timestamptz | |
| created_by | uuid (FK) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `release_tasks`
Links tasks to releases.

| Column | Type | Notes |
|--------|------|-------|
| release_id | uuid (FK) | |
| task_id | uuid (FK) | |

---

### 3.8 Shopping Lists

Handled via the `tasks` table with `type = 'shopping_item'` and a project acting as the "list". This keeps the model unified.

Additional fields stored in a companion table:

#### `shopping_items`
Extended data for shopping-type tasks.

| Column | Type | Notes |
|--------|------|-------|
| task_id | uuid (PK, FK → tasks) | |
| quantity | numeric | |
| unit | text | 'ea', 'lb', 'oz', 'gal', etc. |
| store | text | Preferred store |
| aisle | text | |
| price_estimate | numeric | |
| purchased | boolean | |

---

### 3.9 Reminders & Notifications

#### `reminders`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| user_id | uuid (FK) | Who gets reminded |
| task_id | uuid (FK, nullable) | Optional task link |
| title | text | |
| body | text | |
| remind_at | timestamptz | |
| recurrence | jsonb | null, or { interval: 'daily'/'weekly'/'monthly', days: [...] } |
| status | text | 'pending', 'sent', 'dismissed' |
| created_at | timestamptz | |

#### `notifications`
In-app notification feed.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| workspace_id | uuid (FK) | |
| type | text | 'task_assigned', 'comment', 'reminder', 'wo_status', etc. |
| title | text | |
| body | text | |
| data | jsonb | Deep link info { screen: 'task', id: '...' } |
| read | boolean | default false |
| created_at | timestamptz | |

#### `push_tokens`
Expo push notification tokens per device.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| token | text | Expo push token |
| device_name | text | |
| platform | text | 'ios', 'android' |
| created_at | timestamptz | |

---

### 3.10 Activity Log

#### `activity_log`
Audit trail across all modules.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| workspace_id | uuid (FK) | |
| user_id | uuid (FK) | Who did it |
| entity_type | text | 'task', 'work_order', 'machine', etc. |
| entity_id | uuid | |
| action | text | 'created', 'updated', 'deleted', 'status_changed' |
| changes | jsonb | { field: { old: x, new: y } } |
| created_at | timestamptz | |

---

## 4. Row-Level Security (RLS) Strategy

All tables enforce workspace-level isolation:

```
-- Pattern for every workspace-scoped table:
CREATE POLICY "Users can access own workspace data"
ON <table> FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);
```

Additional role-based restrictions:
- **Workers** can only view/edit tasks assigned to them and work orders they're assigned to
- **Admins** have full CRUD on everything in their workspace
- **Personal workspace** is restricted to owner only (no members)

---

## 5. UI Architecture

### 5.1 Navigation (Web — Next.js)

```
/ (redirect → /dashboard)
/login
/dashboard                    # Overview widgets + recent activity
/tasks                        # List/board view of all tasks
/tasks/[id]                   # Task detail (slide-over or page)
/projects                     # Project list
/projects/[id]                # Project detail + kanban board
/projects/[id]/settings
/shop-flow                    # Work order pipeline (kanban)
/shop-flow/[id]               # Work order detail
/machines                     # Machine registry
/machines/[id]                # Machine detail + maintenance log
/employees                    # Employee directory
/employees/[id]               # Employee profile
/vendors                      # Vendor list
/vendors/[id]                 # Vendor detail
/shopping                     # Shopping lists
/releases                     # Release tracker
/notifications                # Notification center
/settings                     # Workspace + profile settings
```

### 5.2 Navigation (Mobile — Expo Router)

Bottom tab navigation:
1. **Home** — Dashboard
2. **Tasks** — Task list with filters
3. **Shop** — Work orders (Elward workspace) / Shopping lists (Personal)
4. **Inbox** — Notifications
5. **More** — Machines, employees, vendors, settings

### 5.3 Key UI Patterns

- **Command palette** (Cmd+K / Ctrl+K on web) — Quick search, navigation, actions
- **Keyboard shortcuts** throughout web app (Linear-style)
- **Slide-over panels** for task/item detail (no full page navigations for quick edits)
- **Kanban + List + Table views** for tasks and work orders
- **Dark mode default**, light mode available
- **Optimistic updates** for instant feel
- **Realtime subscriptions** for collaborative data (Supabase Realtime)

---

## 6. Implementation Phases

### Phase 1 — Foundation (Current Sprint)
- [ ] Monorepo scaffold (pnpm + Turborepo)
- [ ] Next.js web app with Tailwind 4 + shadcn/ui
- [ ] Expo mobile app with NativeWind
- [ ] Shared packages (types, supabase client, validation)
- [ ] Supabase Auth integration (both apps)
- [ ] Database migration: core tables (workspaces, profiles, workspace_members)
- [ ] Workspace switcher
- [ ] Basic layout shell (sidebar nav web, tab nav mobile)

### Phase 2 — Tasks & Projects
- [ ] Task CRUD with all views (list, board, table)
- [ ] Project CRUD and project-scoped task boards
- [ ] Labels, filtering, sorting
- [ ] Subtasks
- [ ] Comments
- [ ] Command palette (web)
- [ ] Task detail slide-over

### Phase 3 — Shop Flow & Production
- [ ] Work order CRUD and pipeline board
- [ ] Work order steps/stations
- [ ] Machine registry
- [ ] Maintenance logs and scheduling
- [ ] Employee directory

### Phase 4 — Extended Modules
- [ ] Vendor management
- [ ] Shopping lists
- [ ] Release management
- [ ] Reminders system
- [ ] Activity log / audit trail

### Phase 5 — Notifications & Polish
- [ ] In-app notification center
- [ ] Expo push notifications
- [ ] Supabase Edge Functions for notification triggers
- [ ] Recurring reminders (cron via Supabase pg_cron)
- [ ] Dashboard widgets
- [ ] Performance optimization
- [ ] Keyboard shortcut system (web)

### Phase 6 — Ship
- [ ] RLS hardening and security audit
- [ ] EAS Build config for iOS + Android
- [ ] App Store / Play Store submission
- [ ] Vercel production deployment
- [ ] Seed data for Elward workspace

---

## 7. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Task model | Unified `tasks` table | Shopping items, maintenance tasks, and regular tasks share the same core fields. Extension tables add domain-specific data. Keeps queries simple. |
| Ordering | Fractional indexing (float8 `position`) | Enables drag-and-drop reordering without rewriting every row. |
| Workspace model | Explicit workspace_id on every table | Clean multi-workspace isolation. Simple RLS. Personal and work data never mix. |
| State machine | Status as text column + app-level validation | Simpler than DB-level constraints. Zod schemas enforce valid transitions in the shared package. |
| File storage | Supabase Storage with RLS | Files stay in the same ecosystem. Signed URLs for secure access. |
| Realtime | Supabase Realtime subscriptions | Live task updates when collaborating. Work order status changes propagate instantly. |

---

## 8. Open Items / Future Considerations

- **Offline support** (mobile) — Can be added later with local SQLite + sync
- **Time tracking** on tasks/work orders — Simple start/stop timer, linked to tasks
- **Reporting/analytics** — Charts for production throughput, task velocity, etc.
- **Calendar view** — Due dates and reminders on a calendar
- **Barcode/QR scanning** — For machine identification on the shop floor (Expo camera)
- **Integrations** — GitHub webhooks for release management, QuickBooks for vendor invoicing
