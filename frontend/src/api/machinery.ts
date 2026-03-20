import client from "./client";

export interface Machine {
  id: string;
  code: string;
  name: string;
  type: string;
  brand: string;
  model?: string;
  year?: number;
  serial_number?: string;
  capacity?: string;
  current_location?: string;
  status: string;
  hourometer_current: number;
  hourometer_next_service: number;
  hours_until_service: number;
  daily_cost: number;
  acquisition_cost?: number;
  image_url?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface MachineCreate {
  code: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  serial_number: string;
  capacity?: string;
  current_location?: string;
  status?: string;
  hourometer_current?: number;
  hourometer_next_service?: number;
  daily_cost?: number;
  acquisition_cost?: number;
  notes?: string;
}

export interface UsageLog {
  id: string;
  machine_id: string;
  project_id?: string;
  date: string;
  hours_worked: number;
  hourometer_start: number;
  hourometer_end: number;
  operator: string;
  fuel_liters?: number;
  notes?: string;
  created_at: string;
}

export interface UsageLogCreate {
  project_id?: string;
  date: string;
  hours_worked: number;
  hourometer_start: number;
  hourometer_end: number;
  operator: string;
  fuel_liters?: number;
  notes?: string;
}

export interface MaintenanceLog {
  id: string;
  machine_id: string;
  type: string;
  description: string;
  cost: number;
  parts_used?: { part: string; qty: number; cost: number }[];
  performed_by: string;
  performed_at: string;
  hourometer_at_service: number;
  downtime_hours: number;
  next_maintenance_hours?: number;
  created_at: string;
}

export interface MaintenanceLogCreate {
  type: string;
  description: string;
  cost?: number;
  parts_used?: { part: string; qty: number; cost: number }[];
  performed_by: string;
  performed_at: string;
  hourometer_at_service: number;
  downtime_hours?: number;
  next_maintenance_hours?: number;
}

export interface MachineStats {
  usage: {
    period_days: number;
    total_entries: number;
    total_hours: number;
    total_fuel: number;
    avg_daily_hours: number;
  };
  daily_hours: { date: string; hours: number }[];
  maintenance: {
    by_type: Record<string, { count: number; total_cost: number }>;
    total_cost: number;
  };
}

export const machineryApi = {
  list: (params?: { status?: string; type?: string; search?: string }) =>
    client.get<Machine[]>("/machinery", { params }),

  get: (id: string) =>
    client.get<Machine>(`/machinery/${id}`),

  create: (data: MachineCreate) =>
    client.post<Machine>("/machinery", data),

  update: (id: string, data: Partial<MachineCreate>) =>
    client.put<Machine>(`/machinery/${id}`, data),

  delete: (id: string) =>
    client.delete(`/machinery/${id}`),

  alerts: () =>
    client.get<Machine[]>("/machinery/alerts"),

  // Uso
  registerUsage: (machineId: string, data: UsageLogCreate) =>
    client.post<UsageLog>(`/machinery/${machineId}/usage`, data),

  getUsageLogs: (machineId: string, params?: { skip?: number; limit?: number }) =>
    client.get<UsageLog[]>(`/machinery/${machineId}/logs`, { params }),

  getStats: (machineId: string, days = 30) =>
    client.get<MachineStats>(`/machinery/${machineId}/stats`, { params: { days } }),

  // Mantenimiento
  registerMaintenance: (machineId: string, data: MaintenanceLogCreate) =>
    client.post<MaintenanceLog>(`/machinery/${machineId}/maintenance`, data),

  getMaintenanceLogs: (machineId: string, params?: { type?: string }) =>
    client.get<MaintenanceLog[]>(`/machinery/${machineId}/maintenance`, { params }),
};
