"""Endpoints CRUD de proyectos, milestones y costos."""

from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.tenant import get_tenant_session
from app.core.permissions import Action, require_permission
from app.core.exceptions import NotFoundException, ConflictException
from app.models.project import Project, Milestone, ProjectCost
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse,
    MilestoneCreate, MilestoneUpdate, MilestoneResponse,
    ProjectCostCreate, ProjectCostResponse,
)
from app.services.project_service import recalculate_project_progress, get_project_cost_summary

router = APIRouter()


# ── CRUD Proyectos ────────────────────────────────────

@router.get("", response_model=list[ProjectListResponse])
async def list_projects(
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(require_permission("projects", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    query = select(Project).where(Project.is_active == True)
    if status:
        query = query.where(Project.status == status)
    if search:
        query = query.where(
            Project.name.ilike(f"%{search}%") | Project.code.ilike(f"%{search}%") | Project.client.ilike(f"%{search}%")
        )
    query = query.offset(skip).limit(limit).order_by(Project.start_date.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    data: ProjectCreate,
    current_user=Depends(require_permission("projects", Action.CREATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    existing = await db.execute(select(Project).where(Project.code == data.code))
    if existing.scalar_one_or_none():
        raise ConflictException(f"Ya existe un proyecto con el código {data.code}")

    project = Project(**data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    current_user=Depends(require_permission("projects", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise NotFoundException("Proyecto")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    current_user=Depends(require_permission("projects", Action.UPDATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise NotFoundException("Proyecto")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)
    return project


@router.get("/{project_id}/costs/summary")
async def get_cost_summary(
    project_id: UUID,
    current_user=Depends(require_permission("projects", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    """Resumen de costos por categoría del proyecto."""
    return await get_project_cost_summary(db, project_id)


# ── Milestones ────────────────────────────────────────

@router.get("/{project_id}/milestones", response_model=list[MilestoneResponse])
async def list_milestones(
    project_id: UUID,
    current_user=Depends(require_permission("projects", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    result = await db.execute(
        select(Milestone).where(Milestone.project_id == project_id).order_by(Milestone.planned_start)
    )
    return result.scalars().all()


@router.post("/{project_id}/milestones", response_model=MilestoneResponse, status_code=201)
async def create_milestone(
    project_id: UUID,
    data: MilestoneCreate,
    current_user=Depends(require_permission("projects", Action.CREATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    # Verificar que existe el proyecto
    proj = await db.execute(select(Project).where(Project.id == project_id))
    if not proj.scalar_one_or_none():
        raise NotFoundException("Proyecto")

    milestone = Milestone(project_id=project_id, **data.model_dump())
    db.add(milestone)
    await db.commit()
    await db.refresh(milestone)
    return milestone


@router.put("/{project_id}/milestones/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    project_id: UUID,
    milestone_id: UUID,
    data: MilestoneUpdate,
    current_user=Depends(require_permission("projects", Action.UPDATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    result = await db.execute(
        select(Milestone).where(Milestone.id == milestone_id, Milestone.project_id == project_id)
    )
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise NotFoundException("Milestone")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(milestone, field, value)

    # Recalcular avance del proyecto
    await recalculate_project_progress(db, project_id)

    await db.commit()
    await db.refresh(milestone)
    return milestone


# ── Costos ────────────────────────────────────────────

@router.get("/{project_id}/costs", response_model=list[ProjectCostResponse])
async def list_costs(
    project_id: UUID,
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(require_permission("projects", Action.READ)),
    db: AsyncSession = Depends(get_tenant_session),
):
    query = select(ProjectCost).where(ProjectCost.project_id == project_id)
    if category:
        query = query.where(ProjectCost.category == category)
    query = query.order_by(ProjectCost.date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{project_id}/costs", response_model=ProjectCostResponse, status_code=201)
async def add_cost(
    project_id: UUID,
    data: ProjectCostCreate,
    current_user=Depends(require_permission("projects", Action.CREATE)),
    db: AsyncSession = Depends(get_tenant_session),
):
    proj = await db.execute(select(Project).where(Project.id == project_id))
    if not proj.scalar_one_or_none():
        raise NotFoundException("Proyecto")

    cost = ProjectCost(project_id=project_id, **data.model_dump())
    db.add(cost)
    await db.commit()
    await db.refresh(cost)
    return cost
