"""Endpoints de autenticación: login, refresh, registro."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, engine
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_active_user,
)
from app.core.exceptions import CredentialsException, ConflictException, ForbiddenException
from app.core.permissions import Role, require_role
from app.models.user import User, Organization
from app.schemas.user import (
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    RegisterRequest,
    UserResponse,
    OrganizationResponse,
    MessageResponse,
)

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Autenticar usuario y emitir tokens JWT."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise CredentialsException("Email o contraseña incorrectos")

    if not user.is_active:
        raise CredentialsException("Cuenta desactivada")

    # Actualizar último login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    # Generar tokens
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "org_id": str(user.organization_id) if user.organization_id else None,
    }

    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Renovar tokens usando el refresh token."""
    payload = decode_token(data.refresh_token)

    if payload.get("type") != "refresh":
        raise CredentialsException("Token de refresco inválido")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise CredentialsException("Usuario no válido")

    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "org_id": str(user.organization_id) if user.organization_id else None,
    }

    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/register", response_model=MessageResponse)
async def register_organization(
    data: RegisterRequest,
    current_user: User = Depends(require_role([Role.SUPER_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Registrar nueva organización con su usuario admin. Solo super_admin."""
    # Verificar que no exista el slug
    existing = await db.execute(
        select(Organization).where(Organization.slug == data.org_slug)
    )
    if existing.scalar_one_or_none():
        raise ConflictException("Ya existe una organización con ese slug")

    # Verificar que no exista el email
    existing_user = await db.execute(
        select(User).where(User.email == data.email)
    )
    if existing_user.scalar_one_or_none():
        raise ConflictException("Ya existe un usuario con ese email")

    schema_name = f"tenant_{data.org_slug.replace('-', '_')}"

    # Crear la organización
    org = Organization(
        name=data.org_name,
        slug=data.org_slug,
        schema_name=schema_name,
        plan="free",
    )
    db.add(org)
    await db.flush()  # Para obtener el ID

    # Crear usuario admin de la organización
    admin_user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role="org_admin",
        organization_id=org.id,
    )
    db.add(admin_user)

    # Crear el schema del tenant en PostgreSQL
    await db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))

    await db.commit()

    return MessageResponse(
        message=f"Organización '{data.org_name}' creada exitosamente",
        detail=f"Schema: {schema_name}, Admin: {data.email}",
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
):
    """Obtener información del usuario autenticado."""
    return current_user
