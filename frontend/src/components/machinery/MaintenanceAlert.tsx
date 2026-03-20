import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatHourometer } from "@/utils/formatters";
import type { Machine } from "@/api/machinery";
import { Link } from "react-router-dom";

interface MaintenanceAlertProps {
  machines: Machine[];
}

export function MaintenanceAlert({ machines }: MaintenanceAlertProps) {
  if (machines.length === 0) return null;

  return (
    <Card className="border-warning/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Alertas de Mantenimiento
          <Badge variant="warning" className="ml-auto">{machines.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {machines.map((machine) => (
          <Link
            key={machine.id}
            to={`/machinery/${machine.id}`}
            className="flex items-center justify-between p-3 rounded-md bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {machine.code} — {machine.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Próximo servicio en {formatHourometer(machine.hours_until_service)}
              </p>
            </div>
            <Badge variant={machine.hours_until_service <= 10 ? "danger" : "warning"}>
              {machine.hours_until_service <= 10 ? "Urgente" : "Próximo"}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
