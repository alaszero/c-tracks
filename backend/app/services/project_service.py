"""Lógica de negocio para proyectos."""

from decimal import Decimal
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project, Milestone, ProjectCost


async def recalculate_project_progress(db: AsyncSession, project_id: UUID):
    """Recalcular avance del proyecto basado en milestones ponderados."""
    result = await db.execute(
        select(
            func.sum(Milestone.progress * Milestone.weight / 100).label("weighted_progress"),
            func.sum(Milestone.weight).label("total_weight"),
        ).where(Milestone.project_id == project_id)
    )
    row = result.one()

    if row.total_weight and row.total_weight > 0:
        progress = (row.weighted_progress / row.total_weight) * 100
    else:
        progress = Decimal("0")

    proj_result = await db.execute(select(Project).where(Project.id == project_id))
    project = proj_result.scalar_one_or_none()
    if project:
        project.progress_percentage = min(progress, Decimal("100"))


async def get_project_cost_summary(db: AsyncSession, project_id: UUID) -> dict:
    """Resumen de costos por categoría."""
    result = await db.execute(
        select(
            ProjectCost.category,
            func.count(ProjectCost.id).label("count"),
            func.sum(ProjectCost.amount).label("total"),
        )
        .where(ProjectCost.project_id == project_id)
        .group_by(ProjectCost.category)
    )

    by_category = {}
    total = Decimal("0")
    for row in result.all():
        amount = row.total or Decimal("0")
        by_category[row.category] = {"count": row.count, "total": float(amount)}
        total += amount

    return {"by_category": by_category, "total_cost": float(total)}
