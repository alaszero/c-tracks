"""Modelos de Maquinaria: Machine, MaintenanceLog, UsageLog."""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    String, Text, Date, DateTime, Numeric, Integer, Boolean,
    ForeignKey, Enum as SAEnum, JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base
from app.models.common import TimestampMixin


class Machine(TimestampMixin, Base):
    __tablename__ = "machines"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(50), unique=True)  # "EXC-001"
    name: Mapped[str] = mapped_column(String(255))  # "Excavadora CAT 320"
    type: Mapped[str] = mapped_column(
        SAEnum(
            "excavadora", "retroexcavadora", "pipa", "motoconformadora",
            "compactador", "camion_volteo", "planta_asfalto", "otro",
            name="machine_type", create_constraint=True,
        )
    )
    brand: Mapped[str] = mapped_column(String(100))
    model: Mapped[str] = mapped_column(String(100))
    year: Mapped[int] = mapped_column(Integer)
    serial_number: Mapped[str] = mapped_column(String(100))
    capacity: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # "20 ton"
    current_location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum(
            "operando", "disponible", "en_mantenimiento", "fuera_de_servicio",
            name="machine_status", create_constraint=True,
        ),
        default="disponible",
    )
    hourometer_current: Mapped[Decimal] = mapped_column(Numeric(10, 1), default=0)
    hourometer_next_service: Mapped[Decimal] = mapped_column(Numeric(10, 1), default=500)
    daily_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    acquisition_cost: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relaciones
    maintenance_logs: Mapped[list["MaintenanceLog"]] = relationship(
        back_populates="machine", order_by="desc(MaintenanceLog.performed_at)"
    )
    usage_logs: Mapped[list["UsageLog"]] = relationship(
        back_populates="machine", order_by="desc(UsageLog.date)"
    )

    @property
    def hours_until_service(self) -> Decimal:
        return self.hourometer_next_service - self.hourometer_current

    def __repr__(self):
        return f"<Machine {self.code} — {self.name}>"


class MaintenanceLog(TimestampMixin, Base):
    __tablename__ = "maintenance_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    machine_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("machines.id"))
    type: Mapped[str] = mapped_column(
        SAEnum("preventivo", "correctivo", "emergencia", name="maintenance_type", create_constraint=True)
    )
    description: Mapped[str] = mapped_column(Text)
    cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    parts_used: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    performed_by: Mapped[str] = mapped_column(String(255))
    performed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    hourometer_at_service: Mapped[Decimal] = mapped_column(Numeric(10, 1))
    downtime_hours: Mapped[Decimal] = mapped_column(Numeric(8, 1), default=0)
    next_maintenance_hours: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 1), nullable=True)

    # Relaciones
    machine: Mapped["Machine"] = relationship(back_populates="maintenance_logs")

    def __repr__(self):
        return f"<MaintenanceLog {self.type} — {self.machine_id}>"


class UsageLog(TimestampMixin, Base):
    __tablename__ = "usage_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    machine_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("machines.id"))
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)  # FK en Fase 4
    date: Mapped[date] = mapped_column(Date)
    hours_worked: Mapped[Decimal] = mapped_column(Numeric(6, 1))
    hourometer_start: Mapped[Decimal] = mapped_column(Numeric(10, 1))
    hourometer_end: Mapped[Decimal] = mapped_column(Numeric(10, 1))
    operator: Mapped[str] = mapped_column(String(255))
    fuel_liters: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 1), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relaciones
    machine: Mapped["Machine"] = relationship(back_populates="usage_logs")

    def __repr__(self):
        return f"<UsageLog {self.date} — {self.machine_id}>"
