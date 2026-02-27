export const TASK_STATUSES = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

export const TASK_PRIORITIES = {
  URGENT: "urgent",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NONE: "none",
} as const;

export type TaskPriority =
  (typeof TASK_PRIORITIES)[keyof typeof TASK_PRIORITIES];

export const TASK_TYPES = {
  TASK: "task",
  BUG: "bug",
  FEATURE: "feature",
  SHOPPING_ITEM: "shopping_item",
  MAINTENANCE: "maintenance",
  REMINDER: "reminder",
} as const;

export type TaskType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];

export const PROJECT_STATUSES = {
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

export type ProjectStatus =
  (typeof PROJECT_STATUSES)[keyof typeof PROJECT_STATUSES];

export const WORK_ORDER_STATUSES = {
  DRAFT: "draft",
  QUEUED: "queued",
  IN_PROGRESS: "in_progress",
  QC: "qc",
  COMPLETE: "complete",
  SHIPPED: "shipped",
} as const;

export type WorkOrderStatus =
  (typeof WORK_ORDER_STATUSES)[keyof typeof WORK_ORDER_STATUSES];

export const MACHINE_STATUSES = {
  OPERATIONAL: "operational",
  MAINTENANCE: "maintenance",
  DOWN: "down",
  RETIRED: "retired",
} as const;

export type MachineStatus =
  (typeof MACHINE_STATUSES)[keyof typeof MACHINE_STATUSES];

export const EMPLOYEE_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  TERMINATED: "terminated",
} as const;

export type EmployeeStatus =
  (typeof EMPLOYEE_STATUSES)[keyof typeof EMPLOYEE_STATUSES];

export const VENDOR_CATEGORIES = {
  MATERIAL_SUPPLIER: "material_supplier",
  EQUIPMENT: "equipment",
  SUBCONTRACTOR: "subcontractor",
  SERVICE: "service",
} as const;

export type VendorCategory =
  (typeof VENDOR_CATEGORIES)[keyof typeof VENDOR_CATEGORIES];

export const RELEASE_STATUSES = {
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  STAGING: "staging",
  RELEASED: "released",
} as const;

export type ReleaseStatus =
  (typeof RELEASE_STATUSES)[keyof typeof RELEASE_STATUSES];

export const MAINTENANCE_TYPES = {
  PREVENTIVE: "preventive",
  CORRECTIVE: "corrective",
  INSPECTION: "inspection",
} as const;

export type MaintenanceType =
  (typeof MAINTENANCE_TYPES)[keyof typeof MAINTENANCE_TYPES];
