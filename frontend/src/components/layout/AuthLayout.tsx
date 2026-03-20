import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-neutral-900 border-r border-border relative overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #F97316 0, #F97316 1px, transparent 0, transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center font-mono font-bold text-white text-3xl mx-auto mb-6">
            CT
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">C-Tracks</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Sistema modular de gestión para empresas de maquinaria y construcción
          </p>
          <div className="flex gap-3 justify-center mt-8">
            {["Maquinaria", "Proyectos", "Finanzas", "Reportes"].map((mod) => (
              <span
                key={mod}
                className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {mod}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
