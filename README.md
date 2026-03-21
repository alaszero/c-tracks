# C-Tracks

Sistema modular de gestión operativa y financiera para empresas de maquinaria pesada, construcción e infraestructura vial.

## Stack

- **Backend:** FastAPI + SQLAlchemy 2.0 (async) + PostgreSQL 15 + Redis 7
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **Tasks:** Celery + Redis
- **Deploy:** Docker Compose + Nginx

## Módulos

| Módulo | Descripción |
|--------|-------------|
| **Maquinaria** | Inventario, horómetros, bitácora de uso, mantenimientos, alertas |
| **Proyectos** | Obras/proyectos con milestones, avance físico vs programado, costeo |
| **Servicios** | Órdenes de trabajo, tipos de servicio, productividad |
| **Facturación** | CRUD facturas, aging de cuentas por cobrar, estados |
| **Gastos** | Registro de gastos por categoría, proveedores, cuentas por pagar |
| **Dashboard** | KPIs en tiempo real, flujo de caja, estado de flota |
| **Reportes** | Rentabilidad por proyecto, cashflow histórico, aging |
| **Admin** | Gestión multi-tenant, organizaciones, usuarios |

## Inicio Rápido (Desarrollo)

```bash
# 1. Clonar y configurar
git clone https://github.com/alaszero/c-tracks.git
cd c-tracks
cp .env.example .env

# 2. Levantar con Docker
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# 3. Acceder
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Deploy a Producción

```bash
# Opción 1: Deploy directo
cp .env.example .env
# Editar .env con valores de producción (SECRET_KEY, DATABASE_URL, etc.)
./deploy.sh --build --migrate

# Opción 2: Empaquetar para USB
./scripts/package-for-deploy.sh
# Copiar el .tar.gz al servidor, descomprimir, configurar .env, ejecutar deploy.sh
```

## Scripts Útiles

```bash
# Backup de base de datos
./scripts/backup-db.sh

# Restaurar backup
./scripts/restore-db.sh backups/ctracks_backup_20260320.sql.gz

# Crear tenant/organización
./scripts/create-tenant.sh

# Inicializar base de datos
./scripts/init-db.sh

# Empaquetar para deploy vía USB
./scripts/package-for-deploy.sh
```

## Estructura del Proyecto

```
c-tracks/
├── backend/
│   ├── app/
│   │   ├── api/          # Endpoints (auth, machinery, projects, etc.)
│   │   ├── core/         # Security, permissions, tenant middleware
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── tasks/        # Celery tasks
│   ├── alembic/          # Database migrations
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/          # API clients (axios)
│   │   ├── components/   # UI components (layout, machinery, finance, etc.)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Route pages
│   │   ├── stores/       # Zustand stores
│   │   └── utils/        # Formatters, constants, permissions
│   └── Dockerfile
├── nginx/                # Reverse proxy config
├── scripts/              # DB, tenant, deploy scripts
├── docker-compose.yml    # Base services
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── deploy.sh
```

## Arquitectura Multi-Tenant

Aislamiento basado en schemas de PostgreSQL. Cada organización tiene su propio schema (`tenant_{slug}`). El middleware lee el header `X-Tenant-ID` y configura el `search_path` de la sesión.

## Roles y Permisos

| Rol | Acceso |
|-----|--------|
| `super_admin` | Todo el sistema, gestión de tenants |
| `org_admin` | Todo dentro de su organización |
| `finance` | Facturación, gastos, reportes |
| `operations` | Maquinaria, proyectos, servicios |
| `viewer` | Solo lectura |

## Moneda y Formato

- Moneda: MXN (Peso Mexicano)
- Formato: `$1,234,567.89`
- Fechas: DD/MM/YYYY en UI
- Zona horaria: America/Mexico_City

## Licencia

Privado — Todos los derechos reservados.
