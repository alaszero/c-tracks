"""Configuración de Celery para tareas asíncronas."""

from celery import Celery

from app.config import settings

celery_app = Celery(
    "ctracks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Mexico_City",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    beat_schedule={
        "check-maintenance-alerts": {
            "task": "app.tasks.maintenance_alerts.check_maintenance_alerts",
            "schedule": 3600.0,  # Cada hora
        },
        "check-overdue-invoices": {
            "task": "app.tasks.scheduled_reports.check_overdue_invoices",
            "schedule": 86400.0,  # Cada 24 horas
        },
    },
)

celery_app.autodiscover_tasks(["app.tasks"])
