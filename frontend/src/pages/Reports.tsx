import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { ProfitabilityCard } from "@/components/finance/ProfitabilityCard";
import { financeApi } from "@/api/finance";
import { formatMXN } from "@/utils/formatters";
import type { CashflowItem, ProfitabilityItem, AgingBucket } from "@/api/finance";

export default function Reports() {
  const [cashflow, setCashflow] = useState<CashflowItem[]>([]);
  const [profitability, setProfitability] = useState<ProfitabilityItem[]>([]);
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cfRes, profRes, agingRes] = await Promise.all([
          financeApi.getCashflow(12),
          financeApi.getProfitability(),
          financeApi.getReceivables(),
        ]);
        setCashflow(cfRes.data);
        setProfitability(profRes.data);
        setAging(agingRes.data);
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Totales de cashflow
  const totalIncome = cashflow.reduce((s, c) => s + c.income, 0);
  const totalExpenses = cashflow.reduce((s, c) => s + c.expenses, 0);
  const totalNet = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Análisis financiero y de rentabilidad
        </p>
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ingresos (12 meses)</p>
            <p className="text-xl font-bold font-mono text-foreground mt-1">{formatMXN(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Egresos (12 meses)</p>
            <p className="text-xl font-bold font-mono text-foreground mt-1">{formatMXN(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Utilidad Neta</p>
            <p className={`text-xl font-bold font-mono mt-1 ${totalNet >= 0 ? "text-success" : "text-danger"}`}>
              {formatMXN(totalNet)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart data={cashflow} />
        <ProfitabilityCard data={profitability} />
      </div>

      {/* Aging cuentas por cobrar */}
      {aging.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cuentas por Cobrar — Aging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Cliente</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Vigente</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">31-60 días</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">61-90 días</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">+90 días</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {aging.map((row) => (
                    <tr key={row.client} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{row.client}</td>
                      <td className="py-2 font-mono text-right text-foreground">{formatMXN(row.current)}</td>
                      <td className="py-2 font-mono text-right text-warning">{formatMXN(row.days_31_60)}</td>
                      <td className="py-2 font-mono text-right text-warning">{formatMXN(row.days_61_90)}</td>
                      <td className="py-2 font-mono text-right text-danger">{formatMXN(row.over_90)}</td>
                      <td className="py-2 font-mono text-right font-medium text-foreground">{formatMXN(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
