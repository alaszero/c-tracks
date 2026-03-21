import { useState, useEffect } from "react";
import { Plus, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { servicesApi, type ServiceOrder, type ProductivityReport } from "@/api/services";
import { formatMXN, formatDate, formatNumber } from "@/utils/formatters";

const statusVariant: Record<string, "success" | "warning" | "info" | "secondary"> = {
  programada: "secondary",
  en_ejecucion: "info",
  completada: "success",
  facturada: "success",
};

const statusLabels: Record<string, string> = {
  programada: "Programada",
  en_ejecucion: "En Ejecución",
  completada: "Completada",
  facturada: "Facturada",
};

const statusFilters = [
  { value: "", label: "Todas" },
  { value: "programada", label: "Programadas" },
  { value: "en_ejecucion", label: "En Ejecución" },
  { value: "completada", label: "Completadas" },
  { value: "facturada", label: "Facturadas" },
];

export default function Services() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [productivity, setProductivity] = useState<ProductivityReport[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ordersRes, prodRes] = await Promise.all([
          servicesApi.listOrders({ status: statusFilter || undefined }),
          servicesApi.getProductivity(),
        ]);
        setOrders(ordersRes.data);
        setProductivity(prodRes.data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Servicios</h1>
          <p className="text-muted-foreground mt-1">Órdenes de trabajo y productividad</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nueva OT</Button>
      </div>

      {/* Productividad resumen */}
      {productivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Productividad por Tipo de Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Tipo</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Código</th>
                    <th className="text-right px-3 py-2 text-muted-foreground font-medium">Cantidad</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Unidad</th>
                    <th className="text-right px-3 py-2 text-muted-foreground font-medium">Monto Total</th>
                    <th className="text-right px-3 py-2 text-muted-foreground font-medium">OTs</th>
                  </tr>
                </thead>
                <tbody>
                  {productivity.map((p) => (
                    <tr key={p.code} className="border-b border-border/50">
                      <td className="px-3 py-2 text-foreground">{p.service_type}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{p.code}</td>
                      <td className="px-3 py-2 text-right font-mono text-foreground">{formatNumber(p.total_quantity, 2)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{p.unit}</td>
                      <td className="px-3 py-2 text-right font-mono text-foreground">{formatMXN(p.total_amount)}</td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">{p.order_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Tabla de OTs */}
      {!loading && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-800/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">No. OT</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Proyecto</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Cantidad</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-neutral-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-primary">{order.order_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(order.date)}</td>
                  <td className="px-4 py-3">
                    <span className="text-foreground">{order.service_type_name}</span>
                    <span className="text-muted-foreground text-xs ml-1">({order.service_type_code})</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                    {order.project_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {formatNumber(order.quantity, 2)} {order.service_type_unit}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">{formatMXN(order.total)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No se encontraron órdenes de trabajo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
