import api from "./client";

// ── Types ───────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  rfc?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  payment_terms: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  project_id?: string;
  invoice_number: string;
  cfdi_uuid?: string;
  client: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: string;
  payment_date?: string;
  pdf_url?: string;
  xml_url?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  supplier_id?: string;
  project_id?: string;
  category: string;
  description: string;
  amount: number;
  tax_amount: number;
  total: number;
  date: string;
  due_date?: string;
  status: string;
  payment_date?: string;
  invoice_ref?: string;
  supplier_name?: string;
  created_at: string;
}

export interface AgingBucket {
  client: string;
  current: number;
  days_31_60: number;
  days_61_90: number;
  over_90: number;
  total: number;
}

export interface DashboardKPIs {
  machines: {
    total: number;
    by_status: Record<string, number>;
  };
  month_revenue: number;
  month_expenses: number;
  margin_percentage: number;
  active_projects: number;
}

export interface CashflowItem {
  month: string;
  income: number;
  expenses: number;
}

export interface ProfitabilityItem {
  project_code: string;
  project_name: string;
  contract_amount: number;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  progress: number;
}

// ── API ─────────────────────────────────────────────────

export const financeApi = {
  // Invoices
  getInvoices: (params?: {
    status?: string;
    client?: string;
    project_id?: string;
  }) => api.get<Invoice[]>("/invoices", { params }),

  getInvoice: (id: string) => api.get<Invoice>(`/invoices/${id}`),

  createInvoice: (data: Partial<Invoice>) =>
    api.post<Invoice>("/invoices", data),

  updateInvoice: (id: string, data: Partial<Invoice>) =>
    api.patch<Invoice>(`/invoices/${id}`, data),

  deleteInvoice: (id: string) => api.delete(`/invoices/${id}`),

  getReceivables: () => api.get<AgingBucket[]>("/invoices/receivables"),

  // Expenses
  getExpenses: (params?: {
    category?: string;
    status?: string;
    project_id?: string;
    supplier_id?: string;
  }) => api.get<Expense[]>("/expenses", { params }),

  getExpense: (id: string) => api.get<Expense>(`/expenses/${id}`),

  createExpense: (data: Partial<Expense>) =>
    api.post<Expense>("/expenses", data),

  updateExpense: (id: string, data: Partial<Expense>) =>
    api.patch<Expense>(`/expenses/${id}`, data),

  deleteExpense: (id: string) => api.delete(`/expenses/${id}`),

  // Suppliers
  getSuppliers: (search?: string) =>
    api.get<Supplier[]>("/expenses/suppliers", { params: { search } }),

  createSupplier: (data: Partial<Supplier>) =>
    api.post<Supplier>("/expenses/suppliers", data),

  updateSupplier: (id: string, data: Partial<Supplier>) =>
    api.patch<Supplier>(`/expenses/suppliers/${id}`, data),

  // Reports / Dashboard
  getDashboardKPIs: () => api.get<DashboardKPIs>("/reports/dashboard"),

  getCashflow: (months?: number) =>
    api.get<CashflowItem[]>("/reports/cashflow", { params: { months } }),

  getProfitability: () =>
    api.get<ProfitabilityItem[]>("/reports/profitability"),
};
