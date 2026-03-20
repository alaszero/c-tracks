"""Endpoints CRUD de usuarios."""

from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.security import hash_password, get_current_active_user
from app.core.permissions import Role, require_role, require_permission, Action
from app.core.exceptions import NotFoundException, ConflictException, ForbiddenException
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=list[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_role([Role.SUPER_ADMIN, Role.ORG_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Listar usuarios. org_admin solo ve los de su organización."""
    query = select(User)

    # org_admin solo ve su organización
    if current_user.role == Role.ORG_ADMIN.value:
        query = query.where(User.organization_id == current_user.organization_id)

    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)

    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=UserResponse)
async def create_user(
    data: UserCreate,
    current_user: User = Depends(require_role([Role.SUPER_ADMIN, Role.ORG_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Crear usuario. org_admin solo puede crear en su organización."""
    # Verificar email único
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise ConflictException("Ya existe un usuario con ese email")

    # org_admin no puede crear super_admin ni org_admin
    if current_user.role == Role.ORG_ADMIN.value:
        if data.role in [Role.SUPER_ADMIN.value, Role.ORG_ADMIN.value]:
            raise ForbiddenException("No puedes crear usuarios con ese rol")
        data.organization_id = current_user.organization_id

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        organization_id=data.organization_id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Obtener detalle de un usuario."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise NotFoundException("Usuario")

    # org_admin solo puede ver usuarios de su org
    if (
        current_user.role == Role.ORG_ADMIN.value
        and user.organization_id != current_user.organization_id
    ):
        raise ForbiddenException()

    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    data: UserUpdate,
    current_user: User = Depends(require_role([Role.SUPER_ADMIN, Role.ORG_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Actualizar usuario."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise NotFoundException("Usuario")

    # org_admin solo puede editar usuarios de su org
    if (
        current_user.role == Role.ORG_ADMIN.value
        and user.organization_id != current_user.organization_id
    ):
        raise ForbiddenException()

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", response_model=MessageResponse)
async def deactivate_user(
    user_id: UUID,
    current_user: User = Depends(require_role([Role.SUPER_ADMIN, Role.ORG_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Desactivar usuario (soft delete)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise NotFoundException("Usuario")

    if user.id == current_user.id:
        raise ForbiddenException("No puedes desactivarte a ti mismo")

    user.is_active = False
    await db.commit()

    return MessageResponse(message=f"Usuario {user.email} desactivado")
