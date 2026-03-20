import { Link } from "react-router-dom";
import { Truck, MapPin, Gauge, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatHourometer, formatMXN } from "@/utils/formatters";
import { MACHINE_STATUS_LABELS } from "@/utils/constants";
import type { Machine } from "@/api/machinery";

const statusVariant: Record<string, "success" | "warning" | "danger" | "info"> = {
  operando: "success",
  disponible: "info",
  en_mantenimiento: "warning",
  fuera_de_servicio: "danger",
};

const typeIcons: Record<string, string> = {
  excavadora: "EXC",
  retroexcavadora: "RET",
  pipa: "PIP",
  motoconformadora: "MOT",
  compactador: "CMP",
  camion_volteo: "CVT",
  planta_asfalto: "PLT",
  otro: "OTR",
};

interface MachineCardProps {
  machine: Machine;
}

export function MachineCard({ machine }: MachineCardProps) {
  const isAlert = machine.hours_until_service <= 50;

  return (
    <Link to={`/machinery/${machine.id}`}>
      <Card className={`hover:border-neutral-600 transition-all cursor-pointer ${isAlert ? "border-warning/50" : ""}`}>
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-mono font-bold text-primary">
                  {typeIcons[machine.type] || "OTR"}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{machine.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{machine.code}</p>
              </div>
            </div>
            <Badge variant={statusVariant[machine.status] || "secondary"}>
              {MACHINE_STATUS_LABELS[machine.status] || machine.status}
            </Badge>
          </div>

          {/* Info */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                Horómetro
              </span>
              <span className="font-mono text-foreground">
                {formatHourometer(machine.hourometer_current)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Próx. servicio
              </span>
              <span className={`font-mono ${isAlert ? "text-warning font-medium" : "text-foreground"}`}>
                {formatHourometer(machine.hours_until_service)}
              </span>
            </div>

            {machine.current_location && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Ubicación
                </span>
                <span className="text-foreground truncate max-w-[140px]">
                  {machine.current_location}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span>Costo diario</span>
              <span className="font-mono text-foreground">{formatMXN(machine.daily_cost)}</span>
            </div>
          </div>

          {/* Alerta de mantenimiento */}
          {isAlert && (
            <div className="mt-3 px-2 py-1.5 rounded bg-warning/10 border border-warning/20 text-warning text-xs text-center">
              Mantenimiento próximo
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
