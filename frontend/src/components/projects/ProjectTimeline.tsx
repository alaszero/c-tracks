import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPercent } from "@/utils/formatters";
import type { Milestone } from "@/api/projects";

interface ProjectTimelineProps {
  milestones: Milestone[];
}

export function ProjectTimeline({ milestones }: ProjectTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Cronograma (Milestones)</CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.length > 0 ? (
          <div className="space-y-3">
            {milestones.map((ms) => {
              const isComplete = ms.progress >= 100;
              const isInProgress = ms.actual_start && !ms.actual_end;
              return (
                <div key={ms.id} className="relative">
                  {/* Barra de Gantt simplificada */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{ms.name}</span>
                      <Badge
                        variant={isComplete ? "success" : isInProgress ? "info" : "secondary"}
                        className="text-[10px]"
                      >
                        {isComplete ? "Completado" : isInProgress ? "En curso" : "Pendiente"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Peso: {ms.weight}%
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full h-6 bg-neutral-800 rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-primary/80 rounded-md transition-all"
                      style={{ width: `${Math.min(Number(ms.progress), 100)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-medium text-foreground">
                      {formatPercent(Number(ms.progress))}
                    </span>
                  </div>

                  {/* Fechas */}
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>
                      Plan: {formatDate(ms.planned_start)} — {formatDate(ms.planned_end)}
                    </span>
                    {ms.actual_start && (
                      <span>
                        Real: {formatDate(ms.actual_start)}
                        {ms.actual_end ? ` — ${formatDate(ms.actual_end)}` : " — en curso"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">Sin milestones definidos</p>
        )}
      </CardContent>
    </Card>
  );
}
