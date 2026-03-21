"""Endpoints de administración: gestión de tenants/organizaciones."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.permissions import Role, require_role
from app.core.security import hash_password
from app.core.exceptions import NotFoundException, ConflictException
from app.models.user import Organization, User
from app.schemas.user import (
    OrganizationCreate,
    OrganizationResponse,
    UserCreate,
    UserResponse,
    MessageResponse,
)

router = APIRouter(
    dependencies=[Depends(require_role([Role.SUPER_ADMIN]))],
)


# ── Organizations ────────────────────────────────────────

@router.get("/organizations", response_model=list[OrganizationResponse])
async def list_organizations(
    search: str | None = Query(None),
    is_active: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Organization).order_by(Organization.created_at.desc())
    if search:
        q = q.where(Organization.name.ilike(f"%{search}%"))
    if is_active is not None:
        q = q.where(Organization.is_active == is_active)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/organizations/{org_id}", response_model=OrganizationResponse)
async def get_organization(org_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise NotFoundException("Organización")
    return org


@router.post("/organizations", response_model=OrganizationResponse, status_code=201)
async def create_organization(data: OrganizationCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(Organization).where(Organization.slug == data.slug)
    )
    if existing.scalar_one_or_none():
        raise ConflictException("Ya existe una organización con ese slug")

    schema_name = f"tenant_{data.slug.replace('-', '_')}"
    org = Organization(
        name=data.name,
        slug=data.slug,
        schema_name=schema_name,
        plan=data.plan,
        rfc=data.rfc,
        address=data.address,
        phone=data.phone,
    )
    db.add(org)
    await db.flush()

    # Crear schema en PostgreSQL
    await db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
    await db.commit()
    await db.refresh(org)
    return org


@router.patch("/organizations/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    data: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise NotFoundException("Organización")

    for key, value in data.model_dump(exclude_unset=True).items():
        if key != "slug":  # No permitir cambio de slug
            setattr(org, key, value)

    await db.commit()
    await db.refresh(org)
    return org


@router.patch("/organizations/{org_id}/toggle", response_model=MessageResponse)
async def toggle_organization(org_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise NotFoundException("Organización")

    org.is_active = not org.is_active
    await db.commit()

    status = "activada" if org.is_active else "desactivada"
    return MessageResponse(message=f"Organización {status}")


# ── Organization Users ───────────────────────────────────

@router.get("/organizations/{org_id}/users", response_model=list[UserResponse])
async def list_org_users(org_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User)
        .where(User.organization_id == org_id)
        .order_by(User.created_at.desc())
    )
    return result.scalars().all()


@router.post("/organizations/{org_id}/users", response_model=UserResponse, status_code=201)
async def create_org_user(
    org_id: UUID,
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    # Verificar que exista la org
    org = await db.execute(select(Organization).where(Organization.id == org_id))
    if not org.scalar_one_or_none():
        raise NotFoundException("Organización")

    # Verificar email único
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise ConflictException("Ya existe un usuario con ese email")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        organization_id=org_id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# ── Stats ────────────────────────────────────────────────

@router.get("/stats")
async def admin_stats(db: AsyncSession = Depends(get_db)):
    """Estadísticas generales del sistema."""
    org_count = await db.execute(select(func.count(Organization.id)))
    user_count = await db.execute(select(func.count(User.id)))
    active_orgs = await db.execute(
        select(func.count(Organization.id)).where(Organization.is_active == True)
    )

    return {
        "total_organizations": org_count.scalar() or 0,
        "active_organizations": active_orgs.scalar() or 0,
        "total_users": user_count.scalar() or 0,
    }
