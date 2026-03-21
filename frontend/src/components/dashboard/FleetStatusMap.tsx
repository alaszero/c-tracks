import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MACHINE_STATUS_LABELS, MACHINE_STATUS_COLORS } from "@/utils/constants";

interface FleetStatusMapProps {
  byStatus: Record<string, number>;
  total: number;
}

const statusOrder = ["operativa", "en_mantenimiento", "fuera_de_servicio", "en_transito"];

export function FleetStatusMap({ byStatus, total }: FleetStatusMapProps) {
  const statusColorMap: Record<string, string> = {
    operativa: "bg-success",
    en_mantenimiento: "bg-warning",
    fuera_de_servicio: "bg-danger",
    en_transito: "bg-info",
  };

  const textColorMap: Record<string, string> = {
    operativa: "text-success",
    en_mantenimiento: "text-warning",
    fuera_de_servicio: "text-danger",
    en_transito: "text-info",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Estado de la Flota</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra apilada */}
        <div className="w-full h-6 bg-neutral-800 rounded-full overflow-hidden flex">
          {statusOrder.map((status) => {
            const count = byStatus[status] || 0;
            if (count === 0) return null;
            const pct = (count / total) * 100;
            return (
              <div
                key={status}
                className={`h-full ${statusColorMap[status]} transition-all`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="grid grid-cols-2 gap-3">
          {statusOrder.map((status) => {
            const count = byStatus[status] || 0;
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColorMap[status]}`} />
                  <span className="text-sm text-muted-foreground">
                    {MACHINE_STATUS_LABELS[status] || status}
                  </span>
                </div>
                <span className={`font-mono text-sm font-medium ${textColorMap[status]}`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-border text-center">
          <span className="text-2xl font-bold font-mono text-foreground">{total}</span>
          <p className="text-xs text-muted-foreground">Máquinas Totales</p>
        </div>
      </CardContent>
    </Card>
  );
}
