"""Modelos de Proyecto: Project, Milestone, ProjectCost."""

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import String, Text, Date, Numeric, ForeignKey, Enum as SAEnum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base
from app.models.common import TimestampMixin


class Project(TimestampMixin, Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(50), unique=True)  # "PRY-2026-001"
    name: Mapped[str] = mapped_column(String(255))  # "Carretera Guadalajara-Tepic Km 45-60"
    client: Mapped[str] = mapped_column(String(255))
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum(
            "planeacion", "en_curso", "pausado", "completado", "cancelado",
            name="project_status", create_constraint=True,
        ),
        default="planeacion",
    )
    start_date: Mapped[date] = mapped_column(Date)
    estimated_end_date: Mapped[date] = mapped_column(Date)
    actual_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    budget: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    contract_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    progress_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)  # 0-100
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relaciones
    milestones: Mapped[list["Milestone"]] = relationship(
        back_populates="project", order_by="Milestone.planned_start"
    )
    costs: Mapped[list["ProjectCost"]] = relationship(
        back_populates="project", order_by="desc(ProjectCost.date)"
    )

    def __repr__(self):
        return f"<Project {self.code} — {self.name}>"


class Milestone(TimestampMixin, Base):
    __tablename__ = "milestones"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"))
    name: Mapped[str] = mapped_column(String(255))  # "Terracería tramo 1"
    planned_start: Mapped[date] = mapped_column(Date)
    planned_end: Mapped[date] = mapped_column(Date)
    actual_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    actual_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    progress: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)  # 0-100
    weight: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)  # Peso % en proyecto

    # Relaciones
    project: Mapped["Project"] = relationship(back_populates="milestones")

    def __repr__(self):
        return f"<Milestone {self.name}>"


class ProjectCost(TimestampMixin, Base):
    __tablename__ = "project_costs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"))
    category: Mapped[str] = mapped_column(
        SAEnum(
            "materiales", "maquinaria", "mano_de_obra", "subcontrato", "otro",
            name="cost_category", create_constraint=True,
        )
    )
    description: Mapped[str] = mapped_column(String(500))
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    date: Mapped[date] = mapped_column(Date)
    invoice_ref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relaciones
    project: Mapped["Project"] = relationship(back_populates="costs")

    def __repr__(self):
        return f"<ProjectCost {self.category} — {self.amount}>"
