"""Modelos de Servicios: ServiceType, ServiceOrder."""

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import String, Text, Date, Numeric, ForeignKey, Enum as SAEnum, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base
from app.models.common import TimestampMixin


class ServiceType(TimestampMixin, Base):
    __tablename__ = "service_types"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))  # "Riego de impregnación"
    code: Mapped[str] = mapped_column(String(20), unique=True)  # "RI"
    unit_of_measure: Mapped[str] = mapped_column(String(20))  # "m²", "m³", "km"
    default_rate: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relaciones
    orders: Mapped[list["ServiceOrder"]] = relationship(back_populates="service_type")

    def __repr__(self):
        return f"<ServiceType {self.code} — {self.name}>"


class ServiceOrder(TimestampMixin, Base):
    __tablename__ = "service_orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True
    )
    service_type_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("service_types.id")
    )
    order_number: Mapped[str] = mapped_column(String(50), unique=True)  # "OT-2026-0042"
    date: Mapped[date] = mapped_column(Date)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2))  # Cantidad ejecutada
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    total: Mapped[Decimal] = mapped_column(Numeric(14, 2))  # quantity * unit_price
    machines_used: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # [{"machine_id": "...", "hours": 8}]
    status: Mapped[str] = mapped_column(
        SAEnum(
            "programada", "en_ejecucion", "completada", "facturada",
            name="service_order_status", create_constraint=True,
        ),
        default="programada",
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relaciones
    service_type: Mapped["ServiceType"] = relationship(back_populates="orders")

    def __repr__(self):
        return f"<ServiceOrder {self.order_number}>"
