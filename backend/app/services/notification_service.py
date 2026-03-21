"""Servicio de notificaciones internas."""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.machinery import Machine
from app.services.machinery_service import get_machines_needing_maintenance


async def get_maintenance_alerts(db: AsyncSession) -> list[dict]:
    """Generar alertas de mantenimiento pendiente."""
    machines = await get_machines_needing_maintenance(db)
    alerts = []
    for m in machines:
        hours_left = m.hours_until_service
        if hours_left <= 0:
            severity = "critical"
            message = f"Servicio VENCIDO — {abs(hours_left):.0f} horas de retraso"
        elif hours_left <= 25:
            severity = "warning"
            message = f"Servicio próximo en {hours_left:.0f} horas"
        else:
            severity = "info"
            message = f"Servicio programado en {hours_left:.0f} horas"

        alerts.append({
            "machine_id": str(m.id),
            "machine_code": m.code,
            "machine_name": m.name,
            "severity": severity,
            "message": message,
            "hours_until_service": hours_left,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        })

    return sorted(alerts, key=lambda a: a["hours_until_service"])


async def get_overdue_invoice_alerts(db: AsyncSession) -> list[dict]:
    """Generar alertas de facturas vencidas."""
    from app.models.finance import Invoice
    from datetime import date

    today = date.today()
    result = await db.execute(
        select(Invoice)
        .where(Invoice.status == "emitida", Invoice.due_date < today)
        .order_by(Invoice.due_date)
    )
    invoices = result.scalars().all()

    alerts = []
    for inv in invoices:
        days_overdue = (today - inv.due_date).days
        alerts.append({
            "invoice_id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "client": inv.client,
            "total": float(inv.total),
            "due_date": inv.due_date.isoformat(),
            "days_overdue": days_overdue,
            "severity": "critical" if days_overdue > 60 else "warning",
            "message": f"Factura vencida hace {days_overdue} días — ${inv.total:,.2f}",
        })

    return alerts
