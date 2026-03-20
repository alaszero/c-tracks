import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "react-router-dom";

export default function AdminPanel() {
  const user = useAuthStore((s) => s.user);

  if (user?.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Gestión de tenants, organizaciones y suscripciones
        </p>
      </div>

      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Admin Panel — Se implementará en Fase 6
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
