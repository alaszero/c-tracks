"""Modelos financieros: Invoice, Expense, Supplier."""

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import String, Text, Date, Numeric, ForeignKey, Enum as SAEnum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base
from app.models.common import TimestampMixin


class Supplier(TimestampMixin, Base):
    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    rfc: Mapped[Optional[str]] = mapped_column(String(13), nullable=True)
    contact_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    payment_terms: Mapped[int] = mapped_column(default=30)  # Días de crédito
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    expenses: Mapped[list["Expense"]] = relationship(back_populates="supplier")

    def __repr__(self):
        return f"<Supplier {self.name}>"


class Invoice(TimestampMixin, Base):
    __tablename__ = "invoices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True)
    cfdi_uuid: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    client: Mapped[str] = mapped_column(String(255))
    issue_date: Mapped[date] = mapped_column(Date)
    due_date: Mapped[date] = mapped_column(Date)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 4), default=Decimal("0.16"))
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    total: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    status: Mapped[str] = mapped_column(
        SAEnum(
            "borrador", "emitida", "pagada", "vencida", "cancelada",
            name="invoice_status", create_constraint=True,
        ),
        default="borrador",
    )
    payment_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    pdf_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    xml_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    def __repr__(self):
        return f"<Invoice {self.invoice_number} — {self.total}>"


class Expense(TimestampMixin, Base):
    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=True
    )
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    category: Mapped[str] = mapped_column(
        SAEnum(
            "combustible", "refacciones", "materiales", "renta",
            "nomina", "subcontrato", "servicios", "otro",
            name="expense_category", create_constraint=True,
        )
    )
    description: Mapped[str] = mapped_column(String(500))
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    date: Mapped[date] = mapped_column(Date)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum(
            "pendiente", "programada", "pagada",
            name="expense_status", create_constraint=True,
        ),
        default="pendiente",
    )
    payment_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    invoice_ref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    supplier: Mapped[Optional["Supplier"]] = relationship(back_populates="expenses")

    def __repr__(self):
        return f"<Expense {self.category} — {self.total}>"
