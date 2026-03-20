import { useState, useEffect } from "react";
import { Plus, LayoutGrid, List, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MachineCard } from "@/components/machinery/MachineCard";
import { MachineTable } from "@/components/machinery/MachineTable";
import { MaintenanceAlert } from "@/components/machinery/MaintenanceAlert";
import { useMachinery } from "@/hooks/useMachinery";
import { machineryApi, type Machine } from "@/api/machinery";
import { MACHINE_STATUS_LABELS } from "@/utils/constants";

type ViewMode = "grid" | "table";

const statusFilters = [
  { value: "", label: "Todos" },
  { value: "operando", label: "Operando" },
  { value: "disponible", label: "Disponible" },
  { value: "en_mantenimiento", label: "Mantenimiento" },
  { value: "fuera_de_servicio", label: "Fuera de servicio" },
];

export default function Machinery() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [alerts, setAlerts] = useState<Machine[]>([]);

  const { machines, loading, refetch } = useMachinery({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  useEffect(() => {
    machineryApi.alerts().then((res) => setAlerts(res.data)).catch(() => {});
  }, []);

  // Contadores por estado
  const counts = machines.reduce(
    (acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maquinaria</h1>
          <p className="text-muted-foreground mt-1">
            {machines.length} equipos registrados
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Máquina
        </Button>
      </div>

      {/* Alertas de mantenimiento */}
      <MaintenanceAlert machines={alerts} />

      {/* Filtros y controles */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              {f.value && counts[f.value] !== undefined && (
                <span className="ml-1.5 opacity-70">({counts[f.value] || 0})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar máquina..."
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex border border-border rounded-md">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 ${viewMode === "table" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      {!loading && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {machines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      )}

      {!loading && viewMode === "table" && (
        <MachineTable machines={machines} />
      )}

      {!loading && machines.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No se encontraron máquinas</p>
          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); }}
              className="text-primary text-sm mt-2 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
