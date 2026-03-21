import client from "./client";

export interface ServiceType {
  id: string;
  name: string;
  code: string;
  unit_of_measure: string;
  default_rate: number;
  is_active: boolean;
}

export interface ServiceOrder {
  id: string;
  project_id?: string;
  service_type_id: string;
  order_number: string;
  date: string;
  location?: string;
  quantity: number;
  unit_price: number;
  total: number;
  machines_used?: { machine_id: string; hours: number }[];
  status: string;
  notes?: string;
  service_type_name?: string;
  service_type_code?: string;
  service_type_unit?: string;
  project_name?: string;
  created_at: string;
}

export interface ServiceOrderCreate {
  project_id?: string;
  service_type_id: string;
  order_number: string;
  date: string;
  location?: string;
  quantity: number;
  unit_price: number;
  machines_used?: { machine_id: string; hours: number }[];
  status?: string;
  notes?: string;
}

export interface ProductivityReport {
  service_type: string;
  code: string;
  unit: string;
  total_quantity: number;
  total_amount: number;
  order_count: number;
}

export const servicesApi = {
  // Tipos
  getTypes: () => client.get<ServiceType[]>("/services/types"),
  createType: (data: { name: string; code: string; unit_of_measure: string; default_rate?: number }) =>
    client.post<ServiceType>("/services/types", data),

  // Órdenes
  listOrders: (params?: { status?: string; service_type_id?: string; project_id?: string }) =>
    client.get<ServiceOrder[]>("/services/orders", { params }),

  createOrder: (data: ServiceOrderCreate) =>
    client.post<ServiceOrder>("/services/orders", data),

  updateOrder: (id: string, data: Partial<ServiceOrderCreate>) =>
    client.put<ServiceOrder>(`/services/orders/${id}`, data),

  // Productividad
  getProductivity: (params?: { date_from?: string; date_to?: string }) =>
    client.get<ProductivityReport[]>("/services/productivity", { params }),
};
