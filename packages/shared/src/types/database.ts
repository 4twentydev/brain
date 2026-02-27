import type {
  Role,
  WorkspaceType,
  TaskStatus,
  TaskPriority,
  TaskType,
  ProjectStatus,
  WorkOrderStatus,
  MachineStatus,
  EmployeeStatus,
  VendorCategory,
  ReleaseStatus,
  MaintenanceType,
} from "../constants";

// ─── Core ───────────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  type: WorkspaceType;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: Role;
  invited_at: string;
  joined_at: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  default_workspace_id: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Tasks & Projects ───────────────────────────────────

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  color: string | null;
  icon: string | null;
  lead_id: string | null;
  start_date: string | null;
  target_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  workspace_id: string;
  project_id: string | null;
  parent_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignee_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
}

export interface TaskLabel {
  task_id: string;
  label_id: string;
}

export interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}

// ─── Employees ──────────────────────────────────────────

export interface Employee {
  id: string;
  workspace_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role_title: string | null;
  department: string | null;
  hire_date: string | null;
  status: EmployeeStatus;
  hourly_rate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Vendors ────────────────────────────────────────────

export interface Vendor {
  id: string;
  workspace_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  category: VendorCategory;
  notes: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

// ─── Machines & Maintenance ─────────────────────────────

export interface Machine {
  id: string;
  workspace_id: string;
  name: string;
  model: string | null;
  serial_number: string | null;
  location: string | null;
  status: MachineStatus;
  purchase_date: string | null;
  last_service_date: string | null;
  next_service_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceLog {
  id: string;
  machine_id: string;
  performed_by: string;
  type: MaintenanceType;
  description: string;
  parts_used: Record<string, unknown>[];
  cost: number | null;
  performed_at: string;
  next_due: string | null;
  created_at: string;
}

// ─── Shop Flow ──────────────────────────────────────────

export interface WorkOrder {
  id: string;
  workspace_id: string;
  project_id: string | null;
  order_number: string;
  title: string;
  description: string | null;
  status: WorkOrderStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  customer_name: string | null;
  quantity: number;
  unit: string;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderStep {
  id: string;
  work_order_id: string;
  name: string;
  status: "pending" | "in_progress" | "complete" | "skipped";
  assigned_to: string | null;
  machine_id: string | null;
  position: number;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

// ─── Releases ───────────────────────────────────────────

export interface Release {
  id: string;
  workspace_id: string;
  project_id: string;
  version: string;
  title: string;
  description: string | null;
  status: ReleaseStatus;
  target_date: string | null;
  released_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReleaseTask {
  release_id: string;
  task_id: string;
}

// ─── Shopping ───────────────────────────────────────────

export interface ShoppingItem {
  task_id: string;
  quantity: number | null;
  unit: string | null;
  store: string | null;
  aisle: string | null;
  price_estimate: number | null;
  purchased: boolean;
}

// ─── Reminders & Notifications ──────────────────────────

export interface Reminder {
  id: string;
  workspace_id: string;
  user_id: string;
  task_id: string | null;
  title: string;
  body: string | null;
  remind_at: string;
  recurrence: {
    interval: "daily" | "weekly" | "monthly";
    days?: number[];
  } | null;
  status: "pending" | "sent" | "dismissed";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  workspace_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  device_name: string | null;
  platform: "ios" | "android";
  created_at: string;
}

// ─── Activity Log ───────────────────────────────────────

export interface ActivityLog {
  id: string;
  workspace_id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: "created" | "updated" | "deleted" | "status_changed";
  changes: Record<string, { old: unknown; new: unknown }>;
  created_at: string;
}
