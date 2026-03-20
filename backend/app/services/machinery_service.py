"""Lógica de negocio para maquinaria."""

from decimal import Decimal
from uuid import UUID
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.machinery import Machine, MaintenanceLog, UsageLog


MAINTENANCE_ALERT_THRESHOLD = Decimal("50")  # Alertar cuando falten ≤50 horas


async def get_machines_needing_maintenance(db: AsyncSession) -> list[Machine]:
    """Máquinas con horómetro a ≤50 horas del próximo servicio."""
    result = await db.execute(
        select(Machine).where(
            and_(
                Machine.is_active == True,
                Machine.status != "fuera_de_servicio",
                (Machine.hourometer_next_service - Machine.hourometer_current) <= MAINTENANCE_ALERT_THRESHOLD,
            )
        )
    )
    return list(result.scalars().all())


async def get_usage_stats(db: AsyncSession, machine_id: UUID, days: int = 30) -> dict:
    """Estadísticas de uso de los últimos N días."""
    since = datetime.now(timezone.utc).date() - timedelta(days=days)

    result = await db.execute(
        select(
            func.count(UsageLog.id).label("total_entries"),
            func.sum(UsageLog.hours_worked).label("total_hours"),
            func.sum(UsageLog.fuel_liters).label("total_fuel"),
            func.avg(UsageLog.hours_worked).label("avg_daily_hours"),
        ).where(
            and_(UsageLog.machine_id == machine_id, UsageLog.date >= since)
        )
    )
    row = result.one()

    return {
        "period_days": days,
        "total_entries": row.total_entries or 0,
        "total_hours": float(row.total_hours or 0),
        "total_fuel": float(row.total_fuel or 0),
        "avg_daily_hours": round(float(row.avg_daily_hours or 0), 1),
    }


async def get_daily_usage(db: AsyncSession, machine_id: UUID, days: int = 30) -> list[dict]:
    """Horas trabajadas por día para gráfica."""
    since = datetime.now(timezone.utc).date() - timedelta(days=days)

    result = await db.execute(
        select(UsageLog.date, func.sum(UsageLog.hours_worked).label("hours"))
        .where(and_(UsageLog.machine_id == machine_id, UsageLog.date >= since))
        .group_by(UsageLog.date)
        .order_by(UsageLog.date)
    )

    return [{"date": str(row.date), "hours": float(row.hours)} for row in result.all()]


async def get_maintenance_cost_summary(db: AsyncSession, machine_id: UUID) -> dict:
    """Resumen de costos de mantenimiento."""
    result = await db.execute(
        select(
            MaintenanceLog.type,
            func.count(MaintenanceLog.id).label("count"),
            func.sum(MaintenanceLog.cost).label("total_cost"),
        )
        .where(MaintenanceLog.machine_id == machine_id)
        .group_by(MaintenanceLog.type)
    )

    summary = {}
    total = Decimal("0")
    for row in result.all():
        cost = row.total_cost or Decimal("0")
        summary[row.type] = {"count": row.count, "total_cost": float(cost)}
        total += cost

    return {"by_type": summary, "total_cost": float(total)}


async def update_hourometer_from_usage(db: AsyncSession, machine: Machine, hourometer_end: Decimal):
    """Actualizar horómetro de la máquina tras registrar uso."""
    if hourometer_end > machine.hourometer_current:
        machine.hourometer_current = hourometer_end
        # Cambiar estado a operando si estaba disponible
        if machine.status == "disponible":
            machine.status = "operando"
