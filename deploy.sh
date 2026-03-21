#!/bin/bash
# ═══════════════════════════════════════════════════════════
# C-Tracks — Script de deploy para producción
# Uso: ./deploy.sh [--build] [--migrate] [--seed]
# ═══════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Verificar prerequisitos ──────────────────────────────
command -v docker >/dev/null 2>&1 || error "Docker no está instalado"
command -v docker compose >/dev/null 2>&1 || error "Docker Compose no está disponible"

# ── Verificar .env ───────────────────────────────────────
if [ ! -f .env ]; then
    error "Archivo .env no encontrado. Copiar .env.example y configurar."
fi

# ── Parsear argumentos ───────────────────────────────────
BUILD=false
MIGRATE=false

for arg in "$@"; do
    case $arg in
        --build) BUILD=true ;;
        --migrate) MIGRATE=true ;;
        *) warn "Argumento desconocido: $arg" ;;
    esac
done

# ── Detener servicios existentes ─────────────────────────
log "Deteniendo servicios existentes..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# ── Build si se solicita ─────────────────────────────────
if [ "$BUILD" = true ]; then
    log "Construyendo imágenes..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
else
    log "Construyendo imágenes (cache)..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml build
fi

# ── Levantar base de datos primero ───────────────────────
log "Iniciando base de datos..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d db redis
sleep 5

# ── Migraciones ──────────────────────────────────────────
if [ "$MIGRATE" = true ]; then
    log "Ejecutando migraciones..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend alembic upgrade head
fi

# ── Levantar todos los servicios ─────────────────────────
log "Iniciando todos los servicios..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# ── Verificar salud ──────────────────────────────────────
log "Verificando servicios..."
sleep 10

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
    log "Backend OK (HTTP 200)"
else
    warn "Backend no responde aún (HTTP $HEALTH). Verificar logs: docker compose logs backend"
fi

FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
if [ "$FRONTEND" = "200" ]; then
    log "Frontend OK (HTTP 200)"
else
    warn "Frontend no responde aún (HTTP $FRONTEND). Verificar logs: docker compose logs frontend"
fi

# ── Resumen ──────────────────────────────────────────────
echo ""
log "═══════════════════════════════════════════"
log " C-Tracks desplegado exitosamente"
log " Frontend: http://localhost"
log " Backend:  http://localhost:8000"
log " Docs:     http://localhost:8000/docs"
log "═══════════════════════════════════════════"
echo ""
log "Comandos útiles:"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml ps"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml down"
