"""Schemas Pydantic para tipos de servicio y órdenes de trabajo."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── ServiceType ───────────────────────────────────────

class ServiceTypeCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    code: str = Field(min_length=1, max_length=20)
    unit_of_measure: str = Field(max_length=20)
    default_rate: Decimal = Decimal("0")


class ServiceTypeResponse(BaseModel):
    id: UUID
    name: str
    code: str
    unit_of_measure: str
    default_rate: Decimal
    is_active: bool

    model_config = {"from_attributes": True}


# ── ServiceOrder ──────────────────────────────────────

class ServiceOrderCreate(BaseModel):
    project_id: Optional[UUID] = None
    service_type_id: UUID
    order_number: str = Field(min_length=1, max_length=50)
    date: date
    location: Optional[str] = None
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    machines_used: Optional[list[dict]] = None
    status: str = "programada"
    notes: Optional[str] = None


class ServiceOrderUpdate(BaseModel):
    project_id: Optional[UUID] = None
    date: Optional[date] = None
    location: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit_price: Optional[Decimal] = None
    machines_used: Optional[list[dict]] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ServiceOrderResponse(BaseModel):
    id: UUID
    project_id: Optional[UUID] = None
    service_type_id: UUID
    order_number: str
    date: date
    location: Optional[str] = None
    quantity: Decimal
    unit_price: Decimal
    total: Decimal
    machines_used: Optional[list[dict]] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime

    # Campos del join
    service_type_name: Optional[str] = None
    service_type_code: Optional[str] = None
    service_type_unit: Optional[str] = None
    project_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ServiceOrderListResponse(BaseModel):
    id: UUID
    order_number: str
    date: date
    quantity: Decimal
    unit_price: Decimal
    total: Decimal
    status: str
    location: Optional[str] = None
    service_type_name: Optional[str] = None
    service_type_code: Optional[str] = None
    service_type_unit: Optional[str] = None
    project_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Productividad ─────────────────────────────────────

class ProductivityReport(BaseModel):
    service_type: str
    code: str
    unit: str
    total_quantity: Decimal
    total_amount: Decimal
    order_count: int
