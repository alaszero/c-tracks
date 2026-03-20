export const APP_NAME = "C-Tracks";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN: "org_admin",
  FINANCE: "finance",
  OPERATIONS: "operations",
  VIEWER: "viewer",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  org_admin: "Administrador",
  finance: "Finanzas",
  operations: "Operaciones",
  viewer: "Visor",
};

export const MACHINE_STATUS_LABELS: Record<string, string> = {
  operando: "Operando",
  disponible: "Disponible",
  en_mantenimiento: "En Mantenimiento",
  fuera_de_servicio: "Fuera de Servicio",
};

export const MACHINE_STATUS_COLORS: Record<string, string> = {
  operando: "badge-operando",
  disponible: "badge-disponible",
  en_mantenimiento: "badge-mantenimiento",
  fuera_de_servicio: "badge-fuera-servicio",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  planeacion: "Planeación",
  en_curso: "En Curso",
  pausado: "Pausado",
  completado: "Completado",
  cancelado: "Cancelado",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  emitida: "Emitida",
  pagada: "Pagada",
  vencida: "Vencida",
  cancelada: "Cancelada",
};
