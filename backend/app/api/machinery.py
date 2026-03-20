"""Endpoints CRUD de maquinaria, bitácora de uso y mantenimientos."""

from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.tenant import get_tenant_session
from app.core.permissions import Action, require_permission
from app.core.exceptions import NotFoundException, ConflictException
from app.models.machinery import Machine, MaintenanceLog, UsageLog
from app.schemas.machinery import (
    MachineCreate, MachineUpdate, MachineResponse, MachineListResponse,
    MaintenanceLogCreate, MaintenanceLogResponse,
    UsageLogCreate, UsageLogResponse,
)
from app.services.machinery_service import (
    get_machines_needing_maintenance,
    get_usage_stats,
    get_daily_usage,
    get_maintenance_cost_summary,
    update_hourometer_from_usage,
)

router = APIRouter()


# ── CRUD Máquinas ─────────────────────────────────────

@router.get("", response_model=list[MachineListResponse])
async def list_machines(
    status: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(require_permission("machinery", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Listar máquinas con filtros."""
    query = select(Machine).where(Machine.is_active == True)

    if status:
        query = query.where(Machine.status == status)
    if type:
        query = query.where(Machine.type == type)
    if search:
        query = query.where(
            Machine.name.ilike(f"%{search}%") | Machine.code.ilike(f"%{search}%")
        )

    query = query.offset(skip).limit(limit).order_by(Machine.code)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=MachineResponse, status_code=201)
async def create_machine(
    data: MachineCreate,
    current_user=Depends(require_permission("machinery", Action.CREATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Crear nueva máquina."""
    # Verificar código único
    existing = await db.execute(select(Machine).where(Machine.code == data.code))
    if existing.scalar_one_or_none():
        raise ConflictException(f"Ya existe una máquina con el código {data.code}")

    machine = Machine(**data.model_dump())
    db.add(machine)
    await db.commit()
    await db.refresh(machine)
    return machine


@router.get("/alerts", response_model=list[MachineListResponse])
async def get_maintenance_alerts(
    current_user=Depends(require_permission("machinery", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Máquinas que necesitan mantenimiento pronto (≤50 hrs)."""
    machines = await get_machines_needing_maintenance(db)
    return machines


@router.get("/{machine_id}", response_model=MachineResponse)
async def get_machine(
    machine_id: UUID,
    current_user=Depends(require_permission("machinery", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Detalle de una máquina."""
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise NotFoundException("Máquina")
    return machine


@router.put("/{machine_id}", response_model=MachineResponse)
async def update_machine(
    machine_id: UUID,
    data: MachineUpdate,
    current_user=Depends(require_permission("machinery", Action.UPDATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Actualizar máquina."""
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise NotFoundException("Máquina")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(machine, field, value)

    await db.commit()
    await db.refresh(machine)
    return machine


@router.delete("/{machine_id}")
async def delete_machine(
    machine_id: UUID,
    current_user=Depends(require_permission("machinery", Action.DELETE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Soft delete de máquina."""
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise NotFoundException("Máquina")

    machine.is_active = False
    await db.commit()
    return {"message": f"Máquina {machine.code} desactivada"}


# ── Uso diario ────────────────────────────────────────

@router.post("/{machine_id}/usage", response_model=UsageLogResponse, status_code=201)
async def register_usage(
    machine_id: UUID,
    data: UsageLogCreate,
    current_user=Depends(require_permission("machinery", Action.CREATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Registrar uso diario de una máquina."""
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise NotFoundException("Máquina")

    log = UsageLog(machine_id=machine_id, **data.model_dump())
    db.add(log)

    # Actualizar horómetro
    await update_hourometer_from_usage(db, machine, data.hourometer_end)

    await db.commit()
    await db.refresh(log)
    return log


@router.get("/{machine_id}/logs", response_model=list[UsageLogResponse])
async def get_usage_logs(
    machine_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(require_permission("machinery", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Bitácora de uso de una máquina."""
    result = await db.execute(
        select(UsageLog)
        .where(UsageLog.machine_id == machine_id)
        .order_by(UsageLog.date.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{machine_id}/stats")
async def get_machine_stats(
    machine_id: UUID,
    days: int = Query(30, ge=7, le=365),
    current_user=Depends(require_permission("machinery", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Estadísticas de uso y gráfica diaria."""
    stats = await get_usage_stats(db, machine_id, days)
    daily = await get_daily_usage(db, machine_id, days)
    maintenance = await get_maintenance_cost_summary(db, machine_id)

    return {
        "usage": stats,
        "daily_hours": daily,
        "maintenance": maintenance,
    }


# ── Mantenimiento ─────────────────────────────────────

@router.post("/{machine_id}/maintenance", response_model=MaintenanceLogResponse, status_code=201)
async def register_maintenance(
    machine_id: UUID,
    data: MaintenanceLogCreate,
    current_user=Depends(require_permission("machinery", Action.CREATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Registrar mantenimiento de una máquina."""
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise NotFoundException("Máquina")

    log = MaintenanceLog(machine_id=machine_id, **data.model_dump())
    db.add(log)

    # Actualizar próximo servicio si se especifica
    if data.next_maintenance_hours:
        machine.hourometer_next_service = data.next_maintenance_hours

    # Actualizar horómetro si el valor es mayor
    if data.hourometer_at_service > machine.hourometer_current:
        machine.hourometer_current = data.hourometer_at_service

    await db.commit()
    await db.refresh(log)
    return log


@router.get("/{machine_id}/maintenance", response_model=list[MaintenanceLogResponse])
async def get_maintenance_logs(
    machine_id: UUID,
    type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(require_permission("machinery", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Historial de mantenimientos de una máquina."""
    query = select(MaintenanceLog).where(MaintenanceLog.machine_id == machine_id)
    if type:
        query = query.where(MaintenanceLog.type == type)
    query = query.order_by(MaintenanceLog.performed_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()
