import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CashflowItem } from "@/api/finance";

interface RevenueChartProps {
  data: CashflowItem[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Flujo de Caja — Ingresos vs Egresos</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#F8FAFC",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString("es-MX")}`,
                  name === "income" ? "Ingresos" : "Egresos",
                ]}
              />
              <Legend
                formatter={(value: string) =>
                  value === "income" ? "Ingresos" : "Egresos"
                }
                wrapperStyle={{ fontSize: "12px", color: "#94A3B8" }}
              />
              <Bar dataKey="income" fill="#F97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#64748B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
            Sin datos de flujo de caja
          </div>
        )}
      </CardContent>
    </Card>
  );
}
