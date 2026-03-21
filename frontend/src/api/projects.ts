import client from "./client";

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  location?: string;
  status: string;
  start_date: string;
  estimated_end_date: string;
  actual_end_date?: string;
  budget: number;
  contract_amount: number;
  progress_percentage: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProjectCreate {
  code: string;
  name: string;
  client: string;
  location?: string;
  status?: string;
  start_date: string;
  estimated_end_date: string;
  budget?: number;
  contract_amount?: number;
  description?: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  planned_start: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  progress: number;
  weight: number;
  created_at: string;
}

export interface MilestoneCreate {
  name: string;
  planned_start: string;
  planned_end: string;
  weight?: number;
}

export interface ProjectCost {
  id: string;
  project_id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  invoice_ref?: string;
  created_at: string;
}

export interface ProjectCostCreate {
  category: string;
  description: string;
  amount: number;
  date: string;
  invoice_ref?: string;
}

export interface CostSummary {
  by_category: Record<string, { count: number; total: number }>;
  total_cost: number;
}

export const projectsApi = {
  list: (params?: { status?: string; search?: string }) =>
    client.get<Project[]>("/projects", { params }),

  get: (id: string) =>
    client.get<Project>(`/projects/${id}`),

  create: (data: ProjectCreate) =>
    client.post<Project>("/projects", data),

  update: (id: string, data: Partial<ProjectCreate>) =>
    client.put<Project>(`/projects/${id}`, data),

  // Milestones
  getMilestones: (projectId: string) =>
    client.get<Milestone[]>(`/projects/${projectId}/milestones`),

  createMilestone: (projectId: string, data: MilestoneCreate) =>
    client.post<Milestone>(`/projects/${projectId}/milestones`, data),

  updateMilestone: (projectId: string, milestoneId: string, data: Partial<Milestone>) =>
    client.put<Milestone>(`/projects/${projectId}/milestones/${milestoneId}`, data),

  // Costos
  getCosts: (projectId: string, params?: { category?: string }) =>
    client.get<ProjectCost[]>(`/projects/${projectId}/costs`, { params }),

  addCost: (projectId: string, data: ProjectCostCreate) =>
    client.post<ProjectCost>(`/projects/${projectId}/costs`, data),

  getCostSummary: (projectId: string) =>
    client.get<CostSummary>(`/projects/${projectId}/costs/summary`),
};
