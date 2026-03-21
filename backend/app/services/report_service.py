"""Lógica de negocio para dashboard y reportes."""

from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select, func, and_, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.machinery import Machine
from app.models.project import Project
from app.models.finance import Invoice, Expense


async def get_dashboard_kpis(db: AsyncSession) -> dict:
    """KPIs principales del dashboard."""
    # Máquinas por estado
    machine_result = await db.execute(
        select(Machine.status, func.count(Machine.id))
        .where(Machine.is_active == True)
        .group_by(Machine.status)
    )
    machine_counts = {row[0]: row[1] for row in machine_result.all()}
    total_machines = sum(machine_counts.values())

    # Facturación del mes
    today = date.today()
    month_start = today.replace(day=1)
    invoice_result = await db.execute(
        select(func.sum(Invoice.total))
        .where(
            and_(
                Invoice.status.in_(["emitida", "pagada"]),
                Invoice.issue_date >= month_start,
            )
        )
    )
    month_revenue = float(invoice_result.scalar() or 0)

    # Gastos del mes
    expense_result = await db.execute(
        select(func.sum(Expense.total))
        .where(Expense.date >= month_start)
    )
    month_expenses = float(expense_result.scalar() or 0)

    # Margen
    margin = ((month_revenue - month_expenses) / month_revenue * 100) if month_revenue > 0 else 0

    # Proyectos activos
    proj_result = await db.execute(
        select(func.count(Project.id))
        .where(Project.status == "en_curso", Project.is_active == True)
    )
    active_projects = proj_result.scalar() or 0

    return {
        "machines": {
            "total": total_machines,
            "by_status": machine_counts,
        },
        "month_revenue": month_revenue,
        "month_expenses": month_expenses,
        "margin_percentage": round(margin, 1),
        "active_projects": active_projects,
    }


async def get_cashflow(db: AsyncSession, months: int = 6) -> list[dict]:
    """Flujo de caja: ingresos vs egresos por mes."""
    today = date.today()
    start = (today.replace(day=1) - timedelta(days=months * 30)).replace(day=1)

    # Ingresos por mes
    income_result = await db.execute(
        select(
            extract("year", Invoice.issue_date).label("year"),
            extract("month", Invoice.issue_date).label("month"),
            func.sum(Invoice.total).label("total"),
        )
        .where(
            and_(
                Invoice.status.in_(["emitida", "pagada"]),
                Invoice.issue_date >= start,
            )
        )
        .group_by("year", "month")
        .order_by("year", "month")
    )
    income_map = {}
    for row in income_result.all():
        key = f"{int(row.year)}-{int(row.month):02d}"
        income_map[key] = float(row.total or 0)

    # Egresos por mes
    expense_result = await db.execute(
        select(
            extract("year", Expense.date).label("year"),
            extract("month", Expense.date).label("month"),
            func.sum(Expense.total).label("total"),
        )
        .where(Expense.date >= start)
        .group_by("year", "month")
        .order_by("year", "month")
    )
    expense_map = {}
    for row in expense_result.all():
        key = f"{int(row.year)}-{int(row.month):02d}"
        expense_map[key] = float(row.total or 0)

    # Combinar
    all_months = sorted(set(list(income_map.keys()) + list(expense_map.keys())))
    return [
        {
            "month": m,
            "income": income_map.get(m, 0),
            "expenses": expense_map.get(m, 0),
        }
        for m in all_months
    ]


async def get_profitability_by_project(db: AsyncSession) -> list[dict]:
    """Rentabilidad por proyecto activo."""
    result = await db.execute(
        select(Project)
        .where(Project.is_active == True, Project.status.in_(["en_curso", "completado"]))
        .order_by(Project.contract_amount.desc())
    )
    projects = result.scalars().all()

    report = []
    for p in projects:
        # Sumar ingresos (facturas) del proyecto
        inv_result = await db.execute(
            select(func.sum(Invoice.total))
            .where(Invoice.project_id == p.id, Invoice.status.in_(["emitida", "pagada"]))
        )
        revenue = float(inv_result.scalar() or 0)

        # Sumar egresos del proyecto
        exp_result = await db.execute(
            select(func.sum(Expense.total))
            .where(Expense.project_id == p.id)
        )
        expenses = float(exp_result.scalar() or 0)

        margin = ((revenue - expenses) / revenue * 100) if revenue > 0 else 0

        report.append({
            "project_code": p.code,
            "project_name": p.name,
            "contract_amount": float(p.contract_amount),
            "revenue": revenue,
            "expenses": expenses,
            "profit": revenue - expenses,
            "margin": round(margin, 1),
            "progress": float(p.progress_percentage),
        })

    return report
