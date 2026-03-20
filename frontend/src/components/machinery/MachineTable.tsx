import { Link } from "react-router-dom";
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

interface MachineTableProps {
  machines: Machine[];
}

export function MachineTable({ machines }: MachineTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-neutral-800/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Código</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Marca</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Horómetro</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Próx. Servicio</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ubicación</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Costo/día</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((machine) => {
            const isAlert = machine.hours_until_service <= 50;
            return (
              <tr
                key={machine.id}
                className="border-b border-border hover:bg-neutral-800/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/machinery/${machine.id}`}
                    className="font-mono text-primary hover:underline"
                  >
                    {machine.code}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground">{machine.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{machine.brand}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[machine.status] || "secondary"}>
                    {MACHINE_STATUS_LABELS[machine.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono text-foreground">
                  {formatHourometer(machine.hourometer_current)}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${isAlert ? "text-warning" : "text-foreground"}`}>
                  {formatHourometer(machine.hours_until_service)}
                  {isAlert && " ⚠"}
                </td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                  {machine.current_location || "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono text-foreground">
                  {formatMXN(machine.daily_cost)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {machines.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron máquinas
        </div>
      )}
    </div>
  );
}
