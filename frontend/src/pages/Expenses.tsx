import { useState, useEffect } from "react";
import { Plus, Search, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { financeApi } from "@/api/finance";
import { formatMXN, formatDate } from "@/utils/formatters";
import type { Expense } from "@/api/finance";

const categoryLabels: Record<string, string> = {
  combustible: "Combustible",
  refacciones: "Refacciones",
  materiales: "Materiales",
  renta: "Renta",
  nomina: "Nómina",
  subcontrato: "Subcontrato",
  servicios: "Servicios",
  otro: "Otro",
};

const statusVariant: Record<string, "success" | "warning" | "info" | "secondary"> = {
  pendiente: "warning",
  programada: "info",
  pagada: "success",
};

const categoryFilters = [
  { value: "", label: "Todas" },
  { value: "combustible", label: "Combustible" },
  { value: "refacciones", label: "Refacciones" },
  { value: "materiales", label: "Materiales" },
  { value: "nomina", label: "Nómina" },
  { value: "subcontrato", label: "Subcontrato" },
  { value: "servicios", label: "Servicios" },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await financeApi.getExpenses({
          category: categoryFilter || undefined,
        });
        setExpenses(res.data);
      } catch (err) {
        console.error("Error loading expenses:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryFilter]);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.total), 0);
  const pendingExpenses = expenses.filter((e) => e.status === "pendiente");
  const pendingTotal = pendingExpenses.reduce((sum, e) => sum + Number(e.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gastos</h1>
          <p className="text-muted-foreground mt-1">
            {expenses.length} gastos registrados
          </p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nuevo Gasto</Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Gastos (vista actual)</p>
            <p className="text-xl font-bold font-mono text-foreground mt-1">{formatMXN(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pendientes de Pago</p>
            <p className="text-xl font-bold font-mono text-warning mt-1">{formatMXN(pendingTotal)}</p>
            <p className="text-xs text-muted-foreground">{pendingExpenses.length} gastos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {categoryFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setCategoryFilter(f.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              categoryFilter === f.value
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

      {/* Tabla */}
      {!loading && (
        <>
          {expenses.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 font-medium text-muted-foreground">Fecha</th>
                        <th className="pb-3 font-medium text-muted-foreground">Categoría</th>
                        <th className="pb-3 font-medium text-muted-foreground">Descripción</th>
                        <th className="pb-3 font-medium text-muted-foreground">Proveedor</th>
                        <th className="pb-3 font-medium text-muted-foreground text-right">Total</th>
                        <th className="pb-3 font-medium text-muted-foreground text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="border-b border-border/50 hover:bg-neutral-800/30">
                          <td className="py-3 text-muted-foreground">{formatDate(exp.date)}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 bg-neutral-800 rounded text-xs text-foreground">
                              {categoryLabels[exp.category] || exp.category}
                            </span>
                          </td>
                          <td className="py-3 text-foreground max-w-xs truncate">{exp.description}</td>
                          <td className="py-3 text-muted-foreground">{exp.supplier_name || "—"}</td>
                          <td className="py-3 font-mono text-right text-foreground">{formatMXN(exp.total)}</td>
                          <td className="py-3 text-center">
                            <Badge variant={statusVariant[exp.status] || "secondary"}>
                              {exp.status === "pendiente"
                                ? "Pendiente"
                                : exp.status === "programada"
                                  ? "Programada"
                                  : "Pagada"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-16">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron gastos</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
