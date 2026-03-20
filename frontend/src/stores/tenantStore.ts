import { create } from "zustand";

interface TenantState {
  tenantId: string | null;
  tenantName: string | null;
  setTenant: (id: string, name: string) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: localStorage.getItem("tenant_id"),
  tenantName: localStorage.getItem("tenant_name"),

  setTenant: (id, name) => {
    localStorage.setItem("tenant_id", id);
    localStorage.setItem("tenant_name", name);
    set({ tenantId: id, tenantName: name });
  },

  clearTenant: () => {
    localStorage.removeItem("tenant_id");
    localStorage.removeItem("tenant_name");
    set({ tenantId: null, tenantName: null });
  },
}));
