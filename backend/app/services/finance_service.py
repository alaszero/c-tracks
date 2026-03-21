"""Lógica de negocio para finanzas."""

from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select, func, and_, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finance import Invoice, Expense


async def get_receivables_aging(db: AsyncSession) -> list[dict]:
    """Aging de cuentas por cobrar agrupado por cliente."""
    today = date.today()
    d30 = today - timedelta(days=30)
    d60 = today - timedelta(days=60)
    d90 = today - timedelta(days=90)

    result = await db.execute(
        select(
            Invoice.client,
            func.sum(
                case((Invoice.due_date >= d30, Invoice.total), else_=Decimal("0"))
            ).label("current"),
            func.sum(
                case(
                    (and_(Invoice.due_date < d30, Invoice.due_date >= d60), Invoice.total),
                    else_=Decimal("0"),
                )
            ).label("days_31_60"),
            func.sum(
                case(
                    (and_(Invoice.due_date < d60, Invoice.due_date >= d90), Invoice.total),
                    else_=Decimal("0"),
                )
            ).label("days_61_90"),
            func.sum(
                case((Invoice.due_date < d90, Invoice.total), else_=Decimal("0"))
            ).label("over_90"),
            func.sum(Invoice.total).label("total"),
        )
        .where(Invoice.status.in_(["emitida", "vencida"]))
        .group_by(Invoice.client)
        .order_by(func.sum(Invoice.total).desc())
    )

    return [
        {
            "client": row.client,
            "current": float(row.current or 0),
            "days_31_60": float(row.days_31_60 or 0),
            "days_61_90": float(row.days_61_90 or 0),
            "over_90": float(row.over_90 or 0),
            "total": float(row.total or 0),
        }
        for row in result.all()
    ]
