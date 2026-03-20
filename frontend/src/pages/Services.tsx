import { Wrench, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Services() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Servicios</h1>
          <p className="text-muted-foreground mt-1">
            Órdenes de trabajo y productividad
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva OT
        </Button>
      </div>

      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Módulo de Servicios — Se implementará en Fase 4
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
