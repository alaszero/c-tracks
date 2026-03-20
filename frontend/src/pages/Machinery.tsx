import { Truck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Machinery() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maquinaria</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de equipos, bitácora de uso y mantenimientos
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Máquina
        </Button>
      </div>

      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Módulo de Maquinaria — Se implementará en Fase 3
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
