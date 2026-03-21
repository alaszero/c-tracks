import { Badge } from "@/components/ui/badge";
import { formatMXN, formatDate } from "@/utils/formatters";
import { INVOICE_STATUS_LABELS } from "@/utils/constants";
import type { Invoice } from "@/api/finance";

interface InvoiceTableProps {
  invoices: Invoice[];
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "secondary"> = {
  borrador: "secondary",
  emitida: "info",
  pagada: "success",
  vencida: "danger",
  cancelada: "secondary",
};

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 font-medium text-muted-foreground">Folio</th>
            <th className="pb-3 font-medium text-muted-foreground">Cliente</th>
            <th className="pb-3 font-medium text-muted-foreground">Emisión</th>
            <th className="pb-3 font-medium text-muted-foreground">Vencimiento</th>
            <th className="pb-3 font-medium text-muted-foreground text-right">Total</th>
            <th className="pb-3 font-medium text-muted-foreground text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-border/50 hover:bg-neutral-800/30">
              <td className="py-3 font-mono text-xs text-foreground">{inv.invoice_number}</td>
              <td className="py-3 text-foreground">{inv.client}</td>
              <td className="py-3 text-muted-foreground">{formatDate(inv.issue_date)}</td>
              <td className="py-3 text-muted-foreground">{formatDate(inv.due_date)}</td>
              <td className="py-3 font-mono text-right text-foreground">{formatMXN(inv.total)}</td>
              <td className="py-3 text-center">
                <Badge variant={statusVariant[inv.status]}>
                  {INVOICE_STATUS_LABELS[inv.status] || inv.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
