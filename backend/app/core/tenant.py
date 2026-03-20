"""Middleware multi-tenant: detecta tenant desde header o subdominio."""

from fastapi import Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from app.database import AsyncSessionLocal
from app.core.exceptions import TenantNotFoundException


class TenantMiddleware:
    """Extrae el tenant_id del header X-Tenant-ID y lo guarda en request.state."""

    async def __call__(self, request: Request, call_next):
        # Rutas públicas que no requieren tenant
        public_paths = ["/api/auth/login", "/api/auth/refresh", "/api/admin", "/docs", "/openapi.json", "/health"]
        if any(request.url.path.startswith(p) for p in public_paths):
            response = await call_next(request)
            return response

        tenant_id = request.headers.get("X-Tenant-ID")
        if tenant_id:
            request.state.tenant_id = tenant_id
            request.state.schema_name = f"tenant_{tenant_id}"
        else:
            request.state.tenant_id = None
            request.state.schema_name = "public"

        response = await call_next(request)
        return response


async def get_tenant_session(request: Request) -> AsyncSession:
    """Dependencia: retorna sesión de BD con search_path del tenant activo."""
    schema_name = getattr(request.state, "schema_name", "public")

    async with AsyncSessionLocal() as session:
        if schema_name != "public":
            await session.execute(text(f"SET search_path TO {schema_name}, public"))
        try:
            yield session
        finally:
            await session.close()
