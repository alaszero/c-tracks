import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Bell,
  Shield,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { ROLE_LABELS } from "@/utils/constants";

type Tab = "profile" | "organization" | "notifications" | "security";

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "organization", label: "Organización", icon: Building2 },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "security", label: "Seguridad", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Perfil, organización y preferencias
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex lg:flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Perfil de Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Nombre</label>
                  <Input defaultValue={user?.full_name} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                  <Input defaultValue={user?.email} disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    El email no se puede cambiar
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Rol</label>
                  <Badge variant="info">
                    {ROLE_LABELS[user?.role || "viewer"]}
                  </Badge>
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "organization" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos de la Organización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Nombre de la Empresa
                  </label>
                  <Input placeholder="Constructora ABC S.A. de C.V." />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">RFC</label>
                  <Input placeholder="XAXX010101000" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Dirección Fiscal
                  </label>
                  <Input placeholder="Av. Principal #123, Col. Centro" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Teléfono</label>
                  <Input placeholder="(33) 1234-5678" />
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preferencias de Notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    label: "Alertas de Mantenimiento",
                    desc: "Recibir alertas cuando las máquinas necesiten servicio",
                  },
                  {
                    label: "Facturas Vencidas",
                    desc: "Recibir alertas de facturas que pasen su fecha de vencimiento",
                  },
                  {
                    label: "Avance de Proyectos",
                    desc: "Notificar cuando se registre avance en proyectos",
                  },
                  {
                    label: "Reporte Semanal",
                    desc: "Recibir resumen semanal de KPIs por email",
                  },
                ].map((notif) => (
                  <div
                    key={notif.label}
                    className="flex items-center justify-between p-3 rounded-md bg-neutral-800/50 border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{notif.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-9 h-5 bg-neutral-700 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Preferencias
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Contraseña Actual
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Nueva Contraseña
                  </label>
                  <Input type="password" placeholder="Mínimo 6 caracteres" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Confirmar Contraseña
                  </label>
                  <Input type="password" placeholder="Repetir nueva contraseña" />
                </div>
                <Button>
                  <Shield className="w-4 h-4 mr-2" />
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
