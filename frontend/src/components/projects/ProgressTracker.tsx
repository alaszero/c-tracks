import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/utils/formatters";
import type { Project, Milestone } from "@/api/projects";

interface ProgressTrackerProps {
  project: Project;
  milestones: Milestone[];
}

export function ProgressTracker({ project, milestones }: ProgressTrackerProps) {
  // Calcular avance programado basado en fechas
  const now = new Date();
  const start = new Date(project.start_date);
  const end = new Date(project.estimated_end_date);
  const totalDays = Math.max((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24), 1);
  const elapsedDays = Math.max((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24), 0);
  const scheduledProgress = Math.min((elapsedDays / totalDays) * 100, 100);
  const actualProgress = Number(project.progress_percentage);
  const deviation = actualProgress - scheduledProgress;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Avance Físico vs Programado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avance real */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground font-medium">Avance Real</span>
            <span className="font-mono text-primary">{formatPercent(actualProgress)}</span>
          </div>
          <div className="w-full h-4 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(actualProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Avance programado */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Avance Programado</span>
            <span className="font-mono text-muted-foreground">{formatPercent(scheduledProgress)}</span>
          </div>
          <div className="w-full h-4 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-info/50 rounded-full transition-all"
              style={{ width: `${Math.min(scheduledProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Desviación */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Desviación</span>
          <span className={`text-sm font-mono font-medium ${
            deviation >= 0 ? "text-success" : "text-danger"
          }`}>
            {deviation >= 0 ? "+" : ""}{formatPercent(deviation)}
          </span>
        </div>

        {/* Resumen milestones */}
        <div className="flex gap-3 pt-2 border-t border-border">
          <div className="text-center flex-1">
            <p className="text-lg font-bold font-mono text-foreground">{milestones.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold font-mono text-success">
              {milestones.filter(m => Number(m.progress) >= 100).length}
            </p>
            <p className="text-xs text-muted-foreground">Completados</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold font-mono text-info">
              {milestones.filter(m => m.actual_start && Number(m.progress) < 100).length}
            </p>
            <p className="text-xs text-muted-foreground">En curso</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
