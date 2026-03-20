import { Bell, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/utils/constants";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-neutral-900/50 backdrop-blur-sm">
      {/* Lado izquierdo */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm text-muted-foreground">
          Sistema de Gestión de Maquinaria y Construcción
        </h2>
      </div>

      {/* Lado derecho */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* Separador */}
        <div className="w-px h-8 bg-border" />

        {/* Usuario */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground leading-none">
              {user?.full_name}
            </p>
            <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
              {ROLE_LABELS[user?.role || "viewer"]}
            </Badge>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
