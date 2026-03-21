import { useState, useEffect } from "react";
import { Plus, Search, FileText, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceTable } from "@/components/finance/InvoiceTable";
import { financeApi } from "@/api/finance";
import { formatMXN } from "@/utils/formatters";
import type { Invoice, AgingBucket } from "@/api/finance";

const statusFilters = [
  { value: "", label: "Todas" },
  { value: "emitida", label: "Emitidas" },
  { value: "pagada", label: "Pagadas" },
  { value: "vencida", label: "Vencidas" },
  { value: "borrador", label: "Borradores" },
  { value: "cancelada", label: "Canceladas" },
];

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [invRes, agingRes] = await Promise.all([
          financeApi.getInvoices({
            status: statusFilter || undefined,
            client: search || undefined,
          }),
          financeApi.getReceivables(),
        ]);
        setInvoices(invRes.data);
        setAging(agingRes.data);
      } catch (err) {
        console.error("Error loading invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [statusFilter, search]);

  const totalReceivables = aging.reduce((sum, a) => sum + a.total, 0);
  const overdue = aging.reduce((sum, a) => sum + a.days_31_60 + a.days_61_90 + a.over_90, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facturación</h1>
          <p className="text-muted-foreground mt-1">
            {invoices.length} facturas registradas
          </p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nueva Factura</Button>
      </div>

      {/* KPIs de cuentas por cobrar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Facturas Pendientes</p>
                <p className="text-lg font-bold font-mono text-foreground">
                  {invoices.filter((i) => i.status === "emitida").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <DollarSign className="w-4 h-4 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total por Cobrar</p>
                <p className="text-lg font-bold font-mono text-foreground">
                  {formatMXN(totalReceivables)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-danger/10">
                <DollarSign className="w-4 h-4 text-danger" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vencido (&gt;30 días)</p>
                <p className="text-lg font-bold font-mono text-danger">
                  {formatMXN(overdue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Table */}
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
            placeholder="Buscar por cliente..."
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

      {/* Tabla de facturas */}
      {!loading && (
        <>
          {invoices.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <InvoiceTable invoices={invoices} />
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron facturas</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
