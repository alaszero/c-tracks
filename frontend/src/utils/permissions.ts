import { ROLES } from "./constants";

type Role = (typeof ROLES)[keyof typeof ROLES];
type Action = "create" | "read" | "update" | "delete" | "export";

const PERMISSIONS: Record<string, Record<string, Action[]>> = {
  [ROLES.SUPER_ADMIN]: { "*": ["create", "read", "update", "delete", "export"] },
  [ROLES.ORG_ADMIN]: { "*": ["create", "read", "update", "delete", "export"] },
  [ROLES.FINANCE]: {
    invoices: ["create", "read", "update", "delete", "export"],
    expenses: ["create", "read", "update", "delete", "export"],
    suppliers: ["create", "read", "update", "delete"],
    dashboard: ["read"],
    reports: ["read", "export"],
    machinery: ["read"],
    projects: ["read"],
    services: ["read"],
  },
  [ROLES.OPERATIONS]: {
    machinery: ["create", "read", "update", "delete", "export"],
    projects: ["create", "read", "update", "delete", "export"],
    services: ["create", "read", "update", "delete", "export"],
    dashboard: ["read"],
    reports: ["read", "export"],
    invoices: ["read"],
    expenses: ["read"],
  },
  [ROLES.VIEWER]: {
    dashboard: ["read"],
    reports: ["read"],
    machinery: ["read"],
    projects: ["read"],
    services: ["read"],
    invoices: ["read"],
    expenses: ["read"],
  },
};

export function hasPermission(role: Role, resource: string, action: Action): boolean {
  const rolePerms = PERMISSIONS[role];
  if (!rolePerms) return false;

  if (rolePerms["*"]) {
    return rolePerms["*"].includes(action);
  }

  return rolePerms[resource]?.includes(action) ?? false;
}

export function canAccess(role: Role, resource: string): boolean {
  return hasPermission(role, resource, "read");
}
