"""Tareas Celery: reportes programados y alertas financieras."""

import asyncio
from app.tasks import celery_app
from app.database import AsyncSessionLocal


@celery_app.task(name="app.tasks.scheduled_reports.check_overdue_invoices")
def check_overdue_invoices():
    """Verificar facturas vencidas y generar alertas."""
    return asyncio.get_event_loop().run_until_complete(_check_overdue())


async def _check_overdue():
    from app.services.notification_service import get_overdue_invoice_alerts

    async with AsyncSessionLocal() as db:
        alerts = await get_overdue_invoice_alerts(db)

        # Aquí se integraría con email/Slack/webhook
        return {
            "overdue_invoices": len(alerts),
            "total_amount": sum(a["total"] for a in alerts),
            "details": alerts[:20],
        }


@celery_app.task(name="app.tasks.scheduled_reports.generate_monthly_report")
def generate_monthly_report():
    """Generar reporte mensual de KPIs."""
    return asyncio.get_event_loop().run_until_complete(_monthly_report())


async def _monthly_report():
    from app.services.report_service import get_dashboard_kpis, get_cashflow

    async with AsyncSessionLocal() as db:
        kpis = await get_dashboard_kpis(db)
        cashflow = await get_cashflow(db, months=1)

        return {
            "kpis": kpis,
            "cashflow": cashflow,
            "generated": True,
        }
