import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { canAccess } from "@/utils/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  resource?: string;
}

export function ProtectedRoute({ children, resource }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permisos si se especifica un recurso
  if (resource && user && !canAccess(user.role, resource)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
