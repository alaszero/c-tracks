import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMXN, formatPercent } from "@/utils/formatters";
import type { ProfitabilityItem } from "@/api/finance";

interface ProfitabilityCardProps {
  data: ProfitabilityItem[];
}

export function ProfitabilityCard({ data }: ProfitabilityCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Rentabilidad por Proyecto</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-3">
            {data.map((p) => (
              <div
                key={p.project_code}
                className="p-3 rounded-md bg-neutral-800/50 border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">{p.project_code}</span>
                    <p className="text-sm font-medium text-foreground">{p.project_name}</p>
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${
                      p.margin >= 20 ? "text-success" : p.margin >= 0 ? "text-warning" : "text-danger"
                    }`}
                  >
                    {formatPercent(p.margin)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Ingresos</p>
                    <p className="font-mono text-foreground">{formatMXN(p.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gastos</p>
                    <p className="font-mono text-foreground">{formatMXN(p.expenses)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Utilidad</p>
                    <p className={`font-mono ${p.profit >= 0 ? "text-success" : "text-danger"}`}>
                      {formatMXN(p.profit)}
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(p.progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 text-right">
                    {formatPercent(p.progress)} avance
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Sin datos de rentabilidad
          </div>
        )}
      </CardContent>
    </Card>
  );
}
