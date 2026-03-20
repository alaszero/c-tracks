import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  FolderKanban,
  Wrench,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { canAccess } from "@/utils/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  resource: string;
  section: "main" | "finance" | "reports" | "admin";
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, resource: "dashboard", section: "main" },
  { label: "Maquinaria", path: "/machinery", icon: Truck, resource: "machinery", section: "main" },
  { label: "Proyectos", path: "/projects", icon: FolderKanban, resource: "projects", section: "main" },
  { label: "Servicios", path: "/services", icon: Wrench, resource: "services", section: "main" },
  { label: "Facturación", path: "/invoices", icon: FileText, resource: "invoices", section: "finance" },
  { label: "Gastos", path: "/expenses", icon: Receipt, resource: "expenses", section: "finance" },
  { label: "Reportes", path: "/reports", icon: BarChart3, resource: "reports", section: "reports" },
  { label: "Configuración", path: "/settings", icon: Settings, resource: "settings", section: "admin" },
];

const sectionLabels: Record<string, string> = {
  main: "Operaciones",
  finance: "Finanzas",
  reports: "Reportes",
  admin: "Administración",
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const role = user?.role || "viewer";

  // Agrupar items por sección
  const sections = navItems.reduce(
    (acc, item) => {
      if (!acc[item.section]) acc[item.section] = [];
      acc[item.section].push(item);
      return acc;
    },
    {} as Record<string, NavItem[]>
  );

  // Agregar panel admin para super_admin
  if (role === "super_admin") {
    if (!sections.admin) sections.admin = [];
    sections.admin.unshift({
      label: "Admin Panel",
      path: "/admin",
      icon: Shield,
      resource: "admin",
      section: "admin",
    });
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen bg-neutral-900 border-r border-border transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-mono font-bold text-white text-sm shrink-0">
              CT
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-foreground whitespace-nowrap">
                C-Tracks
              </span>
            )}
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="mb-4">
              {!collapsed && (
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {sectionLabels[section]}
                </p>
              )}
              {items
                .filter((item) => canAccess(role, item.resource))
                .map((item) => (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors mb-0.5",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )
                        }
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    )}
                  </Tooltip>
                ))}
            </div>
          ))}
        </nav>

        {/* Toggle collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}
