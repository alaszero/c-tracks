import { useAuthStore } from "@/stores/authStore";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, fetchUser } =
    useAuthStore();
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
      navigate("/");
    },
    [login, navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    fetchUser,
    // Helpers de rol
    isSuperAdmin: user?.role === "super_admin",
    isOrgAdmin: user?.role === "org_admin",
    isFinance: user?.role === "finance",
    isOperations: user?.role === "operations",
    isViewer: user?.role === "viewer",
  };
}
