"""Endpoints de órdenes de servicio, tipos y productividad."""

from uuid import UUID
from typing import Optional
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import get_tenant_session
from app.core.permissions import Action, require_permission
from app.core.exceptions import NotFoundException, ConflictException
from app.models.service import ServiceType, ServiceOrder
from app.models.project import Project
from app.schemas.service import (
    ServiceTypeCreate, ServiceTypeResponse,
    ServiceOrderCreate, ServiceOrderUpdate, ServiceOrderResponse, ServiceOrderListResponse,
    ProductivityReport,
)

router = APIRouter()


# ── Tipos de servicio ─────────────────────────────────

@router.get("/types", response_model=list[ServiceTypeResponse])
async def list_service_types(
    current_user=Depends(require_permission("services", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    result = await db.execute(
        select(ServiceType).where(ServiceType.is_active == True).order_by(ServiceType.name)
    )
    return result.scalars().all()


@router.post("/types", response_model=ServiceTypeResponse, status_code=201)
async def create_service_type(
    data: ServiceTypeCreate,
    current_user=Depends(require_permission("services", Action.CREATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    existing = await db.execute(select(ServiceType).where(ServiceType.code == data.code))
    if existing.scalar_one_or_none():
        raise ConflictException(f"Ya existe un tipo de servicio con código {data.code}")

    st = ServiceType(**data.model_dump())
    db.add(st)
    await db.commit()
    await db.refresh(st)
    return st


# ── Órdenes de trabajo ────────────────────────────────

@router.get("/orders", response_model=list[ServiceOrderListResponse])
async def list_orders(
    status: Optional[str] = None,
    service_type_id: Optional[UUID] = None,
    project_id: Optional[UUID] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(require_permission("services", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    query = (
        select(
            ServiceOrder,
            ServiceType.name.label("service_type_name"),
            ServiceType.code.label("service_type_code"),
            ServiceType.unit_of_measure.label("service_type_unit"),
            Project.name.label("project_name"),
        )
        .join(ServiceType, ServiceOrder.service_type_id == ServiceType.id)
        .outerjoin(Project, ServiceOrder.project_id == Project.id)
    )

    if status:
        query = query.where(ServiceOrder.status == status)
    if service_type_id:
        query = query.where(ServiceOrder.service_type_id == service_type_id)
    if project_id:
        query = query.where(ServiceOrder.project_id == project_id)

    query = query.order_by(ServiceOrder.date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)

    orders = []
    for row in result.all():
        order = row[0]
        orders.append(ServiceOrderListResponse(
            id=order.id,
            order_number=order.order_number,
            date=order.date,
            quantity=order.quantity,
            unit_price=order.unit_price,
            total=order.total,
            status=order.status,
            location=order.location,
            service_type_name=row.service_type_name,
            service_type_code=row.service_type_code,
            service_type_unit=row.service_type_unit,
            project_name=row.project_name,
        ))
    return orders


@router.post("/orders", response_model=ServiceOrderResponse, status_code=201)
async def create_order(
    data: ServiceOrderCreate,
    current_user=Depends(require_permission("services", Action.CREATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    # Verificar OT única
    existing = await db.execute(
        select(ServiceOrder).where(ServiceOrder.order_number == data.order_number)
    )
    if existing.scalar_one_or_none():
        raise ConflictException(f"Ya existe una OT con número {data.order_number}")

    # Calcular total
    total = data.quantity * data.unit_price

    order = ServiceOrder(
        **data.model_dump(),
        total=total,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


@router.put("/orders/{order_id}", response_model=ServiceOrderResponse)
async def update_order(
    order_id: UUID,
    data: ServiceOrderUpdate,
    current_user=Depends(require_permission("services", Action.UPDATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    result = await db.execute(select(ServiceOrder).where(ServiceOrder.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise NotFoundException("Orden de trabajo")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(order, field, value)

    # Recalcular total si cambió cantidad o precio
    if data.quantity is not None or data.unit_price is not None:
        order.total = order.quantity * order.unit_price

    await db.commit()
    await db.refresh(order)
    return order


# ── Productividad ─────────────────────────────────────

@router.get("/productivity", response_model=list[ProductivityReport])
async def get_productivity(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user=Depends(require_permission("services", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Reporte de productividad: cantidad ejecutada por tipo de servicio."""
    query = (
        select(
            ServiceType.name.label("service_type"),
            ServiceType.code.label("code"),
            ServiceType.unit_of_measure.label("unit"),
            func.sum(ServiceOrder.quantity).label("total_quantity"),
            func.sum(ServiceOrder.total).label("total_amount"),
            func.count(ServiceOrder.id).label("order_count"),
        )
        .join(ServiceType, ServiceOrder.service_type_id == ServiceType.id)
        .where(ServiceOrder.status.in_(["completada", "facturada"]))
        .group_by(ServiceType.name, ServiceType.code, ServiceType.unit_of_measure)
        .order_by(func.sum(ServiceOrder.total).desc())
    )

    if date_from:
        query = query.where(ServiceOrder.date >= date_from)
    if date_to:
        query = query.where(ServiceOrder.date <= date_to)

    result = await db.execute(query)
    return [
        ProductivityReport(
            service_type=row.service_type,
            code=row.code,
            unit=row.unit,
            total_quantity=row.total_quantity or Decimal("0"),
            total_amount=row.total_amount or Decimal("0"),
            order_count=row.order_count,
        )
        for row in result.all()
    ]
