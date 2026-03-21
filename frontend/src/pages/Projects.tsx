import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { formatMXN, formatDate, formatPercent } from "@/utils/formatters";
import { PROJECT_STATUS_LABELS } from "@/utils/constants";

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "secondary"> = {
  planeacion: "secondary",
  en_curso: "info",
  pausado: "warning",
  completado: "success",
  cancelado: "danger",
};

const statusFilters = [
  { value: "", label: "Todos" },
  { value: "en_curso", label: "En Curso" },
  { value: "planeacion", label: "Planeación" },
  { value: "pausado", label: "Pausado" },
  { value: "completado", label: "Completado" },
];

export default function Projects() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { projects, loading } = useProjects({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground mt-1">{projects.length} proyectos registrados</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nuevo Proyecto</Button>
      </div>

      {/* Filtros */}
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
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyecto..."
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Lista de proyectos */}
      {!loading && (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="hover:border-neutral-600 transition-colors cursor-pointer mb-3">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">{project.code}</span>
                        <Badge variant={statusVariant[project.status]}>
                          {PROJECT_STATUS_LABELS[project.status]}
                        </Badge>
                      </div>
                      <h3 className="text-base font-medium text-foreground">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{project.client}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-mono text-sm font-medium text-foreground">{formatMXN(project.contract_amount)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(project.start_date)} — {formatDate(project.estimated_end_date)}
                      </p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Avance</span>
                      <span className="font-mono text-foreground">{formatPercent(project.progress_percentage)}</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(Number(project.progress_percentage), 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {projects.length === 0 && (
            <div className="text-center py-16">
              <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron proyectos</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
