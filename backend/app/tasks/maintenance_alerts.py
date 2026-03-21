"""Tarea Celery: verificar alertas de mantenimiento."""

import asyncio
from app.tasks import celery_app
from app.database import AsyncSessionLocal


@celery_app.task(name="app.tasks.maintenance_alerts.check_maintenance_alerts")
def check_maintenance_alerts():
    """Revisar máquinas que necesitan mantenimiento y generar alertas."""
    return asyncio.get_event_loop().run_until_complete(_check_maintenance())


async def _check_maintenance():
    from app.services.notification_service import get_maintenance_alerts

    async with AsyncSessionLocal() as db:
        alerts = await get_maintenance_alerts(db)
        critical = [a for a in alerts if a["severity"] == "critical"]
        warning = [a for a in alerts if a["severity"] == "warning"]

        # Aquí se integraría con email/Slack/webhook
        # Por ahora solo retornamos el resumen
        return {
            "total_alerts": len(alerts),
            "critical": len(critical),
            "warning": len(warning),
            "details": critical[:10],  # Top 10 críticas
        }
