import { useState, useEffect } from "react";
import {
  Truck,
  FolderKanban,
  DollarSign,
  TrendingUp,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { FleetStatusMap } from "@/components/dashboard/FleetStatusMap";
import { useAuthStore } from "@/stores/authStore";
import { financeApi } from "@/api/finance";
import { formatMXN, formatPercent } from "@/utils/formatters";
import type { DashboardKPIs, CashflowItem } from "@/api/finance";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [cashflow, setCashflow] = useState<CashflowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [kpiRes, cfRes] = await Promise.all([
          financeApi.getDashboardKPIs(),
          financeApi.getCashflow(6),
        ]);
        setKpis(kpiRes.data);
        setCashflow(cfRes.data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const operatingMachines = kpis?.machines.by_status["operativa"] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido, {user?.full_name}. Resumen operativo del día.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Máquinas Operando"
          value={String(operatingMachines)}
          sublabel={`de ${kpis?.machines.total || 0} total`}
          icon={Truck}
          color="text-success"
          bgColor="bg-success/10"
        />
        <KPICard
          label="Proyectos Activos"
          value={String(kpis?.active_projects || 0)}
          sublabel="en curso actualmente"
          icon={FolderKanban}
          color="text-info"
          bgColor="bg-info/10"
        />
        <KPICard
          label="Facturación del Mes"
          value={formatMXN(kpis?.month_revenue || 0)}
          sublabel={`Gastos: ${formatMXN(kpis?.month_expenses || 0)}`}
          icon={DollarSign}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <KPICard
          label="Margen de Utilidad"
          value={formatPercent(kpis?.margin_percentage || 0)}
          sublabel="del mes en curso"
          icon={TrendingUp}
          color={
            (kpis?.margin_percentage || 0) >= 20
              ? "text-success"
              : (kpis?.margin_percentage || 0) >= 0
                ? "text-warning"
                : "text-danger"
          }
          bgColor={
            (kpis?.margin_percentage || 0) >= 20
              ? "bg-success/10"
              : "bg-warning/10"
          }
        />
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={cashflow} />
        <FleetStatusMap
          byStatus={kpis?.machines.by_status || {}}
          total={kpis?.machines.total || 0}
        />
      </div>
    </div>
  );
}
