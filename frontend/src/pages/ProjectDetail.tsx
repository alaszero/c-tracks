import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectTimeline } from "@/components/projects/ProjectTimeline";
import { ProgressTracker } from "@/components/projects/ProgressTracker";
import { CostBreakdown } from "@/components/projects/CostBreakdown";
import { useProjectDetail } from "@/hooks/useProjects";
import { formatMXN, formatDate } from "@/utils/formatters";
import { PROJECT_STATUS_LABELS } from "@/utils/constants";

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "secondary"> = {
  planeacion: "secondary",
  en_curso: "info",
  pausado: "warning",
  completado: "success",
  cancelado: "danger",
};

const COST_CATEGORY_LABELS: Record<string, string> = {
  materiales: "Materiales",
  maquinaria: "Maquinaria",
  mano_de_obra: "Mano de Obra",
  subcontrato: "Subcontrato",
  otro: "Otro",
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { project, milestones, costs, costSummary, loading } = useProjectDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
        <Link to="/projects" className="text-primary text-sm mt-2 hover:underline">Volver</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <Badge variant={statusVariant[project.status]}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              <span className="font-mono">{project.code}</span> — {project.client}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Editar</Button>
          <Button>Agregar Milestone</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" /> Monto Contrato
            </div>
            <p className="text-xl font-bold font-mono text-foreground">{formatMXN(project.contract_amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" /> Presupuesto
            </div>
            <p className="text-xl font-bold font-mono text-foreground">{formatMXN(project.budget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" /> Inicio
            </div>
            <p className="text-lg font-medium text-foreground">{formatDate(project.start_date)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" /> Fin Estimado
            </div>
            <p className="text-lg font-medium text-foreground">{formatDate(project.estimated_end_date)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Avance + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectTimeline milestones={milestones} />
        </div>
        <ProgressTracker project={project} milestones={milestones} />
      </div>

      {/* Costos */}
      <CostBreakdown costSummary={costSummary} budget={Number(project.budget)} />

      {/* Tabla de costos detallada */}
      {costs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Costos Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Fecha</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Categoría</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Descripción</th>
                    <th className="text-right px-3 py-2 text-muted-foreground font-medium">Monto</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Ref. Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((cost) => (
                    <tr key={cost.id} className="border-b border-border/50">
                      <td className="px-3 py-2 font-mono text-xs">{formatDate(cost.date)}</td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {COST_CATEGORY_LABELS[cost.category] || cost.category}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-foreground">{cost.description}</td>
                      <td className="px-3 py-2 text-right font-mono text-foreground">{formatMXN(cost.amount)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{cost.invoice_ref || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info adicional */}
      {(project.location || project.description) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {project.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{project.location}</span>
              </div>
            )}
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
