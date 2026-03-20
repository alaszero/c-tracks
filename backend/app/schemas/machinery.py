"""Schemas Pydantic para maquinaria, mantenimiento y uso."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── Machine ───────────────────────────────────────────

class MachineCreate(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=2, max_length=255)
    type: str
    brand: str = Field(max_length=100)
    model: str = Field(max_length=100)
    year: int = Field(ge=1970, le=2100)
    serial_number: str = Field(max_length=100)
    capacity: Optional[str] = None
    current_location: Optional[str] = None
    status: str = "disponible"
    hourometer_current: Decimal = Decimal("0")
    hourometer_next_service: Decimal = Decimal("500")
    daily_cost: Decimal = Decimal("0")
    acquisition_cost: Decimal = Decimal("0")
    image_url: Optional[str] = None
    notes: Optional[str] = None


class MachineUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    serial_number: Optional[str] = None
    capacity: Optional[str] = None
    current_location: Optional[str] = None
    status: Optional[str] = None
    hourometer_current: Optional[Decimal] = None
    hourometer_next_service: Optional[Decimal] = None
    daily_cost: Optional[Decimal] = None
    acquisition_cost: Optional[Decimal] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None


class MachineResponse(BaseModel):
    id: UUID
    code: str
    name: str
    type: str
    brand: str
    model: str
    year: int
    serial_number: str
    capacity: Optional[str] = None
    current_location: Optional[str] = None
    status: str
    hourometer_current: Decimal
    hourometer_next_service: Decimal
    hours_until_service: Decimal
    daily_cost: Decimal
    acquisition_cost: Decimal
    image_url: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MachineListResponse(BaseModel):
    id: UUID
    code: str
    name: str
    type: str
    brand: str
    status: str
    hourometer_current: Decimal
    hourometer_next_service: Decimal
    hours_until_service: Decimal
    current_location: Optional[str] = None
    daily_cost: Decimal

    model_config = {"from_attributes": True}


# ── MaintenanceLog ────────────────────────────────────

class MaintenanceLogCreate(BaseModel):
    type: str  # preventivo, correctivo, emergencia
    description: str = Field(min_length=5)
    cost: Decimal = Decimal("0")
    parts_used: Optional[list[dict]] = None  # [{"part": "Filtro", "qty": 2, "cost": 350}]
    performed_by: str = Field(min_length=2)
    performed_at: datetime
    hourometer_at_service: Decimal
    downtime_hours: Decimal = Decimal("0")
    next_maintenance_hours: Optional[Decimal] = None


class MaintenanceLogResponse(BaseModel):
    id: UUID
    machine_id: UUID
    type: str
    description: str
    cost: Decimal
    parts_used: Optional[list[dict]] = None
    performed_by: str
    performed_at: datetime
    hourometer_at_service: Decimal
    downtime_hours: Decimal
    next_maintenance_hours: Optional[Decimal] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── UsageLog ──────────────────────────────────────────

class UsageLogCreate(BaseModel):
    project_id: Optional[UUID] = None
    date: date
    hours_worked: Decimal = Field(gt=0)
    hourometer_start: Decimal
    hourometer_end: Decimal
    operator: str = Field(min_length=2)
    fuel_liters: Optional[Decimal] = None
    notes: Optional[str] = None


class UsageLogResponse(BaseModel):
    id: UUID
    machine_id: UUID
    project_id: Optional[UUID] = None
    date: date
    hours_worked: Decimal
    hourometer_start: Decimal
    hourometer_end: Decimal
    operator: str
    fuel_liters: Optional[Decimal] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
