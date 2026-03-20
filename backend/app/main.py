"""C-Tracks — Aplicación FastAPI principal."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.core.tenant import TenantMiddleware
from app.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ciclo de vida de la aplicación."""
    # Startup
    print(f"🚀 {settings.APP_NAME} iniciando en modo {settings.APP_ENV}")
    yield
    # Shutdown
    print(f"👋 {settings.APP_NAME} cerrando")


app = FastAPI(
    title=settings.APP_NAME,
    description="Sistema modular de gestión para empresas de maquinaria y construcción",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Middleware ────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(BaseHTTPMiddleware, dispatch=TenantMiddleware())

# ── Routers ───────────────────────────────────────────
app.include_router(api_router)


# ── Health Check ──────────────────────────────────────
@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.APP_ENV}
