export const ROLES = {
  ADMIN: "admin",
  WORKER: "worker",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const WORKSPACE_TYPES = {
  ORGANIZATION: "organization",
  PERSONAL: "personal",
} as const;

export type WorkspaceType =
  (typeof WORKSPACE_TYPES)[keyof typeof WORKSPACE_TYPES];
