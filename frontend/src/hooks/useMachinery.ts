import { useState, useEffect, useCallback } from "react";
import { machineryApi, type Machine, type MachineStats, type UsageLog, type MaintenanceLog } from "@/api/machinery";

export function useMachinery(filters?: { status?: string; type?: string; search?: string }) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await machineryApi.list(filters);
      setMachines(data);
      setError(null);
    } catch {
      setError("Error al cargar maquinaria");
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.type, filters?.search]);

  useEffect(() => { fetch(); }, [fetch]);

  return { machines, loading, error, refetch: fetch };
}

export function useMachineDetail(id: string | undefined) {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [stats, setStats] = useState<MachineStats | null>(null);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [machineRes, statsRes, usageRes, maintRes] = await Promise.all([
        machineryApi.get(id),
        machineryApi.getStats(id),
        machineryApi.getUsageLogs(id),
        machineryApi.getMaintenanceLogs(id),
      ]);
      setMachine(machineRes.data);
      setStats(statsRes.data);
      setUsageLogs(usageRes.data);
      setMaintenanceLogs(maintRes.data);
    } catch {
      setMachine(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { machine, stats, usageLogs, maintenanceLogs, loading, refetch: fetch };
}
