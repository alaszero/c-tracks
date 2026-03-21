import { useState, useEffect, useCallback } from "react";
import { projectsApi, type Project, type Milestone, type ProjectCost, type CostSummary } from "@/api/projects";

export function useProjects(filters?: { status?: string; search?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await projectsApi.list(filters);
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.search]);

  useEffect(() => { fetch(); }, [fetch]);

  return { projects, loading, refetch: fetch };
}

export function useProjectDetail(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [costs, setCosts] = useState<ProjectCost[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [projRes, msRes, costRes, summaryRes] = await Promise.all([
        projectsApi.get(id),
        projectsApi.getMilestones(id),
        projectsApi.getCosts(id),
        projectsApi.getCostSummary(id),
      ]);
      setProject(projRes.data);
      setMilestones(msRes.data);
      setCosts(costRes.data);
      setCostSummary(summaryRes.data);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { project, milestones, costs, costSummary, loading, refetch: fetch };
}
