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
import { useAuthStore } from "@/stores/authStore";
import { formatMXN } from "@/utils/formatters";

// Datos placeholder — se reemplazarán con datos reales en Fase 5
const kpis = [
  {
    label: "Máquinas Operando",
    value: "12",
    sublabel: "de 18 total",
    icon: Truck,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "Proyectos Activos",
    value: "5",
    sublabel: "2 próximos a completar",
    icon: FolderKanban,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    label: "Facturación del Mes",
    value: formatMXN(2450000),
    sublabel: "Meta: $3,000,000",
    icon: DollarSign,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Margen de Utilidad",
    value: "24.5%",
    sublabel: "+2.1% vs mes anterior",
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

const alerts = [
  {
    machine: "EXC-003 — Excavadora CAT 320",
    message: "Próximo servicio en 45 horas",
    type: "warning" as const,
  },
  {
    machine: "PIP-001 — Pipa de Agua 10,000L",
    message: "Fuera de servicio — Falla en bomba",
    type: "danger" as const,
  },
  {
    machine: "MOT-002 — Motoconformadora 140K",
    message: "Mantenimiento preventivo completado",
    type: "success" as const,
  },
];

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

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
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="hover:border-neutral-600 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1 font-mono">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.sublabel}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas y actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Maquinaria */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Alertas de Maquinaria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-3 rounded-md bg-neutral-800/50 border border-border"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{alert.machine}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                </div>
                <Badge variant={alert.type}>
                  {alert.type === "warning"
                    ? "Atención"
                    : alert.type === "danger"
                      ? "Crítico"
                      : "OK"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Proyectos recientes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                action: "OT completada",
                detail: "Riego de impregnación — Carr. GDL-Tepic Km 52",
                time: "Hace 2 horas",
              },
              {
                action: "Factura emitida",
                detail: "FAC-2026-0089 — $485,000.00 MXN",
                time: "Hace 4 horas",
              },
              {
                action: "Avance registrado",
                detail: "Terracería tramo 3 — 78% completado",
                time: "Hace 6 horas",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-3 rounded-md bg-neutral-800/50 border border-border"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {item.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Placeholder para gráficas (Fase 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Flujo de Caja — Ingresos vs Egresos (Recharts - Fase 5)
          </p>
        </Card>
        <Card className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Utilización de Flota (Recharts - Fase 5)
          </p>
        </Card>
      </div>
    </div>
  );
}
