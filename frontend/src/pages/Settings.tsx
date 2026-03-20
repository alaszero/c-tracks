import { Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Perfil de organización, usuarios y preferencias
        </p>
      </div>

      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <SettingsIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Módulo de Configuración — Se implementará en Fase 6
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
