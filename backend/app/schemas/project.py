"""Schemas Pydantic para proyectos, milestones y costos."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── Project ───────────────────────────────────────────

class ProjectCreate(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=2, max_length=255)
    client: str = Field(min_length=2, max_length=255)
    location: Optional[str] = None
    status: str = "planeacion"
    start_date: date
    estimated_end_date: date
    budget: Decimal = Decimal("0")
    contract_amount: Decimal = Decimal("0")
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    client: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    estimated_end_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    budget: Optional[Decimal] = None
    contract_amount: Optional[Decimal] = None
    progress_percentage: Optional[Decimal] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: UUID
    code: str
    name: str
    client: str
    location: Optional[str] = None
    status: str
    start_date: date
    estimated_end_date: date
    actual_end_date: Optional[date] = None
    budget: Decimal
    contract_amount: Decimal
    progress_percentage: Decimal
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    id: UUID
    code: str
    name: str
    client: str
    status: str
    start_date: date
    estimated_end_date: date
    budget: Decimal
    contract_amount: Decimal
    progress_percentage: Decimal

    model_config = {"from_attributes": True}


# ── Milestone ─────────────────────────────────────────

class MilestoneCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    planned_start: date
    planned_end: date
    weight: Decimal = Decimal("0")


class MilestoneUpdate(BaseModel):
    name: Optional[str] = None
    planned_start: Optional[date] = None
    planned_end: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    progress: Optional[Decimal] = None
    weight: Optional[Decimal] = None


class MilestoneResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    planned_start: date
    planned_end: date
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    progress: Decimal
    weight: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


# ── ProjectCost ───────────────────────────────────────

class ProjectCostCreate(BaseModel):
    category: str
    description: str = Field(min_length=2, max_length=500)
    amount: Decimal = Field(gt=0)
    date: date
    invoice_ref: Optional[str] = None


class ProjectCostResponse(BaseModel):
    id: UUID
    project_id: UUID
    category: str
    description: str
    amount: Decimal
    date: date
    invoice_ref: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
