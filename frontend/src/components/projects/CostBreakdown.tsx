import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMXN } from "@/utils/formatters";
import type { CostSummary } from "@/api/projects";

const CATEGORY_LABELS: Record<string, string> = {
  materiales: "Materiales",
  maquinaria: "Maquinaria",
  mano_de_obra: "Mano de Obra",
  subcontrato: "Subcontrato",
  otro: "Otro",
};

const COLORS = ["#F97316", "#3B82F6", "#22C55E", "#EAB308", "#94A3B8"];

interface CostBreakdownProps {
  costSummary: CostSummary | null;
  budget: number;
}

export function CostBreakdown({ costSummary, budget }: CostBreakdownProps) {
  const chartData = costSummary
    ? Object.entries(costSummary.by_category).map(([key, val]) => ({
        name: CATEGORY_LABELS[key] || key,
        value: val.total,
        count: val.count,
      }))
    : [];

  const totalCost = costSummary?.total_cost || 0;
  const budgetUsed = budget > 0 ? (totalCost / budget) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Desglose de Costos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gráfica */}
          <div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => formatMXN(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Sin costos registrados
              </div>
            )}
          </div>

          {/* Tabla resumen */}
          <div className="space-y-2">
            {chartData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-mono text-foreground">{formatMXN(item.value)}</span>
              </div>
            ))}

            <div className="pt-2 mt-2 border-t border-border">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-foreground">Total ejercido</span>
                <span className="font-mono text-foreground">{formatMXN(totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Presupuesto</span>
                <span className="font-mono text-muted-foreground">{formatMXN(budget)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">% Utilizado</span>
                <span className={`font-mono ${budgetUsed > 90 ? "text-danger" : budgetUsed > 75 ? "text-warning" : "text-success"}`}>
                  {budgetUsed.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
