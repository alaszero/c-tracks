"""Schemas Pydantic para finanzas: facturas, gastos, proveedores."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── Supplier ──────────────────────────────────────────

class SupplierCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    rfc: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    payment_terms: int = 30
    notes: Optional[str] = None


class SupplierResponse(BaseModel):
    id: UUID
    name: str
    rfc: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    payment_terms: int
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Invoice ───────────────────────────────────────────

class InvoiceCreate(BaseModel):
    project_id: Optional[UUID] = None
    invoice_number: str = Field(min_length=1, max_length=50)
    cfdi_uuid: Optional[str] = None
    client: str = Field(min_length=2, max_length=255)
    issue_date: date
    due_date: date
    subtotal: Decimal = Field(ge=0)
    tax_rate: Decimal = Decimal("0.16")
    status: str = "borrador"


class InvoiceUpdate(BaseModel):
    client: Optional[str] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    subtotal: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = None
    status: Optional[str] = None
    payment_date: Optional[date] = None
    cfdi_uuid: Optional[str] = None
    pdf_url: Optional[str] = None
    xml_url: Optional[str] = None


class InvoiceResponse(BaseModel):
    id: UUID
    project_id: Optional[UUID] = None
    invoice_number: str
    cfdi_uuid: Optional[str] = None
    client: str
    issue_date: date
    due_date: date
    subtotal: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    total: Decimal
    status: str
    payment_date: Optional[date] = None
    pdf_url: Optional[str] = None
    xml_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Expense ───────────────────────────────────────────

class ExpenseCreate(BaseModel):
    supplier_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    category: str
    description: str = Field(min_length=2, max_length=500)
    amount: Decimal = Field(gt=0)
    tax_amount: Decimal = Decimal("0")
    date: date
    due_date: Optional[date] = None
    status: str = "pendiente"
    invoice_ref: Optional[str] = None


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    tax_amount: Optional[Decimal] = None
    date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    payment_date: Optional[date] = None
    invoice_ref: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: UUID
    supplier_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    category: str
    description: str
    amount: Decimal
    tax_amount: Decimal
    total: Decimal
    date: date
    due_date: Optional[date] = None
    status: str
    payment_date: Optional[date] = None
    invoice_ref: Optional[str] = None
    supplier_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Aging / Receivables ───────────────────────────────

class AgingBucket(BaseModel):
    client: str
    current: Decimal  # 0-30 días
    days_31_60: Decimal
    days_61_90: Decimal
    over_90: Decimal
    total: Decimal
