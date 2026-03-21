import { useState, useEffect } from "react";
import {
  Shield,
  Building2,
  Users,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/utils/formatters";
import api from "@/api/client";

interface Organization {
  id: string;
  name: string;
  slug: string;
  schema_name: string;
  plan: string;
  is_active: boolean;
  rfc?: string;
  phone?: string;
  created_at: string;
}

interface AdminStats {
  total_organizations: number;
  active_organizations: number;
  total_users: number;
}

const planVariant: Record<string, "success" | "info" | "warning"> = {
  enterprise: "success",
  pro: "info",
  free: "warning",
};

export default function AdminPanel() {
  const user = useAuthStore((s) => s.user);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [orgsRes, statsRes] = await Promise.all([
          api.get<Organization[]>("/admin/organizations", {
            params: { search: search || undefined },
          }),
          api.get<AdminStats>("/admin/stats"),
        ]);
        setOrgs(orgsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error loading admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search]);

  if (user?.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  const toggleOrg = async (orgId: string) => {
    try {
      await api.patch(`/admin/organizations/${orgId}/toggle`);
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === orgId ? { ...o, is_active: !o.is_active } : o
        )
      );
    } catch (err) {
      console.error("Error toggling org:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de tenants, organizaciones y suscripciones
          </p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nueva Organización</Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Organizaciones</p>
                  <p className="text-lg font-bold font-mono text-foreground">
                    {stats.total_organizations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Building2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Activas</p>
                  <p className="text-lg font-bold font-mono text-success">
                    {stats.active_organizations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Users className="w-4 h-4 text-info" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Usuarios Totales</p>
                  <p className="text-lg font-bold font-mono text-foreground">
                    {stats.total_users}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar organización..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Org list */}
      {!loading && (
        <div className="space-y-3">
          {orgs.map((org) => (
            <Card key={org.id} className="hover:border-neutral-600 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-medium text-foreground">{org.name}</h3>
                      <Badge variant={planVariant[org.plan] || "secondary"}>
                        {org.plan.toUpperCase()}
                      </Badge>
                      <Badge variant={org.is_active ? "success" : "danger"}>
                        {org.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono text-xs">{org.slug}</span>
                      <span>Schema: {org.schema_name}</span>
                      {org.rfc && <span>RFC: {org.rfc}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Creada: {formatDate(org.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleOrg(org.id)}
                    className="p-2 rounded-md hover:bg-neutral-800 transition-colors"
                    title={org.is_active ? "Desactivar" : "Activar"}
                  >
                    {org.is_active ? (
                      <ToggleRight className="w-6 h-6 text-success" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {orgs.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron organizaciones</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
