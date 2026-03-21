"""Endpoints para dashboard, KPIs y reportes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.permissions import require_permission
from app.services.report_service import (
    get_dashboard_kpis,
    get_cashflow,
    get_profitability_by_project,
)

router = APIRouter()


@router.get("/dashboard")
async def dashboard_kpis(db: AsyncSession = Depends(get_db)):
    """KPIs principales del dashboard."""
    return await get_dashboard_kpis(db)


@router.get("/cashflow")
async def cashflow(
    months: int = Query(6, ge=1, le=24),
    db: AsyncSession = Depends(get_db),
):
    """Flujo de caja: ingresos vs egresos por mes."""
    return await get_cashflow(db, months)


@router.get(
    "/profitability",
    dependencies=[Depends(require_permission("reports", "read"))],
)
async def profitability(db: AsyncSession = Depends(get_db)):
    """Rentabilidad por proyecto."""
    return await get_profitability_by_project(db)
