"""Modelos de Usuario y Organización (schema public)."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base
from app.models.common import TimestampMixin


class Organization(TimestampMixin, Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255))  # "Constructora XYZ"
    slug: Mapped[str] = mapped_column(String(100), unique=True)  # "constructora-xyz"
    schema_name: Mapped[str] = mapped_column(String(100), unique=True)  # "tenant_constructora_xyz"
    plan: Mapped[str] = mapped_column(
        String(50), default="free"
    )  # "free", "pro", "enterprise"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    rfc: Mapped[Optional[str]] = mapped_column(String(13), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relaciones
    users: Mapped[list["User"]] = relationship(back_populates="organization")

    def __repr__(self):
        return f"<Organization {self.name}>"


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(
        SAEnum(
            "super_admin", "org_admin", "finance", "operations", "viewer",
            name="user_role",
            create_constraint=True,
        ),
        default="viewer",
    )
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=True,  # super_admin puede no tener org
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relaciones
    organization: Mapped[Optional["Organization"]] = relationship(back_populates="users")

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
