import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Generación de reportes con filtros y exportación
        </p>
      </div>

      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Módulo de Reportes — Se implementará en Fase 5
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
