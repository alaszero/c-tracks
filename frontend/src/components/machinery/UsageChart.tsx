import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageChartProps {
  data: { date: string; hours: number }[];
  title?: string;
}

export function UsageChart({ data, title = "Horas Trabajadas (Últimos 30 días)" }: UsageChartProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                label={{
                  value: "Horas",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#94A3B8",
                  fontSize: 11,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#F8FAFC",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value} hrs`, "Horas"]}
                labelFormatter={(label: string) => `Fecha: ${formatDate(label)}`}
              />
              <Bar dataKey="hours" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Sin datos de uso en este periodo
          </div>
        )}
      </CardContent>
    </Card>
  );
}
