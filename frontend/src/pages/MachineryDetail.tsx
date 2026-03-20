import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Gauge, Clock, MapPin, DollarSign, Calendar,
  Wrench, Fuel, User, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsageChart } from "@/components/machinery/UsageChart";
import { useMachineDetail } from "@/hooks/useMachinery";
import { formatHourometer, formatMXN, formatDate, formatDateTime } from "@/utils/formatters";
import { MACHINE_STATUS_LABELS } from "@/utils/constants";

const statusVariant: Record<string, "success" | "warning" | "danger" | "info"> = {
  operando: "success",
  disponible: "info",
  en_mantenimiento: "warning",
  fuera_de_servicio: "danger",
};

const maintTypeLabels: Record<string, string> = {
  preventivo: "Preventivo",
  correctivo: "Correctivo",
  emergencia: "Emergencia",
};

export default function MachineryDetail() {
  const { id } = useParams<{ id: string }>();
  const { machine, stats, usageLogs, maintenanceLogs, loading } = useMachineDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Máquina no encontrada</p>
        <Link to="/machinery" className="text-primary text-sm mt-2 hover:underline">
          Volver a maquinaria
        </Link>
      </div>
    );
  }

  const isAlert = machine.hours_until_service <= 50;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/machinery">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{machine.name}</h1>
              <Badge variant={statusVariant[machine.status]}>
                {MACHINE_STATUS_LABELS[machine.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 font-mono">{machine.code} — {machine.brand} {machine.model} ({machine.year})</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Editar</Button>
          <Button>Registrar Uso</Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Gauge className="w-3.5 h-3.5" /> Horómetro
            </div>
            <p className="text-xl font-bold font-mono text-foreground">
              {formatHourometer(machine.hourometer_current)}
            </p>
          </CardContent>
        </Card>
        <Card className={isAlert ? "border-warning/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Clock className="w-3.5 h-3.5" /> Próx. Servicio
            </div>
            <p className={`text-xl font-bold font-mono ${isAlert ? "text-warning" : "text-foreground"}`}>
              {formatHourometer(machine.hours_until_service)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" /> Costo Diario
            </div>
            <p className="text-xl font-bold font-mono text-foreground">
              {formatMXN(machine.daily_cost)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Wrench className="w-3.5 h-3.5" /> Costo Mant.
            </div>
            <p className="text-xl font-bold font-mono text-foreground">
              {formatMXN(stats?.maintenance.total_cost || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UsageChart data={stats?.daily_hours || []} />
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estadísticas (30 días)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Días de uso", value: `${stats?.usage.total_entries || 0} días` },
              { label: "Total horas", value: formatHourometer(stats?.usage.total_hours || 0) },
              { label: "Promedio diario", value: `${stats?.usage.avg_daily_hours || 0} hrs/día` },
              { label: "Combustible", value: `${stats?.usage.total_fuel || 0} L` },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-mono text-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bitácora de uso y Mantenimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bitácora de uso */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Bitácora de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageLogs.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {usageLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3 rounded-md bg-neutral-800/50 border border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{formatDate(log.date)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {log.operator}
                        </span>
                        {log.fuel_liters && (
                          <span className="flex items-center gap-1">
                            <Fuel className="w-3 h-3" /> {log.fuel_liters}L
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium text-primary">{log.hours_worked} hrs</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {log.hourometer_start} → {log.hourometer_end}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">Sin registros de uso</p>
            )}
          </CardContent>
        </Card>

        {/* Historial de mantenimientos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Historial de Mantenimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceLogs.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {maintenanceLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-md bg-neutral-800/50 border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={log.type === "emergencia" ? "danger" : log.type === "correctivo" ? "warning" : "success"}
                          >
                            {maintTypeLabels[log.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(log.performed_at)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-1.5">{log.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Por: {log.performed_by} — Horómetro: {log.hourometer_at_service}
                        </p>
                      </div>
                      <span className="font-mono text-sm text-foreground whitespace-nowrap">
                        {formatMXN(log.cost)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">Sin mantenimientos registrados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info adicional */}
      {(machine.notes || machine.current_location || machine.serial_number) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">No. Serie</p>
                <p className="font-mono text-foreground">{machine.serial_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Capacidad</p>
                <p className="text-foreground">{machine.capacity || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ubicación</p>
                <p className="text-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {machine.current_location || "—"}
                </p>
              </div>
              {machine.notes && (
                <div className="sm:col-span-3">
                  <p className="text-muted-foreground">Notas</p>
                  <p className="text-foreground">{machine.notes}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Costo de Adquisición</p>
                <p className="font-mono text-foreground">{formatMXN(machine.acquisition_cost || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
