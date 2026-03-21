"""Endpoints CRUD para gastos y proveedores."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.permissions import require_permission
from app.models.finance import Expense, Supplier
from app.schemas.finance import (
    ExpenseCreate, ExpenseUpdate, ExpenseResponse,
    SupplierCreate, SupplierResponse,
)

router = APIRouter(
    dependencies=[Depends(require_permission("expenses", "read"))],
)


# ── Expenses ─────────────────────────────────────────────

@router.get("", response_model=list[ExpenseResponse])
async def list_expenses(
    category: str | None = Query(None),
    status: str | None = Query(None),
    project_id: UUID | None = Query(None),
    supplier_id: UUID | None = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Expense).order_by(Expense.date.desc())
    if category:
        q = q.where(Expense.category == category)
    if status:
        q = q.where(Expense.status == status)
    if project_id:
        q = q.where(Expense.project_id == project_id)
    if supplier_id:
        q = q.where(Expense.supplier_id == supplier_id)
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    expenses = result.scalars().all()

    # Enrich with supplier name
    response = []
    for e in expenses:
        data = ExpenseResponse.model_validate(e)
        if e.supplier:
            data.supplier_name = e.supplier.name
        response.append(data)
    return response


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Gasto")
    data = ExpenseResponse.model_validate(expense)
    if expense.supplier:
        data.supplier_name = expense.supplier.name
    return data


@router.post("", response_model=ExpenseResponse, status_code=201,
             dependencies=[Depends(require_permission("expenses", "create"))])
async def create_expense(data: ExpenseCreate, db: AsyncSession = Depends(get_db)):
    total = data.amount + data.tax_amount
    expense = Expense(**data.model_dump(), total=total)
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense


@router.patch("/{expense_id}", response_model=ExpenseResponse,
              dependencies=[Depends(require_permission("expenses", "update"))])
async def update_expense(expense_id: UUID, data: ExpenseUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Gasto")

    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(expense, key, value)

    if "amount" in updates or "tax_amount" in updates:
        expense.total = expense.amount + expense.tax_amount

    await db.commit()
    await db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204,
               dependencies=[Depends(require_permission("expenses", "delete"))])
async def delete_expense(expense_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Gasto")
    await db.delete(expense)
    await db.commit()


# ── Suppliers ────────────────────────────────────────────

@router.get("/suppliers", response_model=list[SupplierResponse])
async def list_suppliers(
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Supplier).where(Supplier.is_active == True).order_by(Supplier.name)
    if search:
        q = q.where(Supplier.name.ilike(f"%{search}%"))
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/suppliers", response_model=SupplierResponse, status_code=201,
             dependencies=[Depends(require_permission("expenses", "create"))])
async def create_supplier(data: SupplierCreate, db: AsyncSession = Depends(get_db)):
    supplier = Supplier(**data.model_dump())
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier


@router.patch("/suppliers/{supplier_id}", response_model=SupplierResponse,
              dependencies=[Depends(require_permission("expenses", "update"))])
async def update_supplier(supplier_id: UUID, data: SupplierCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Proveedor")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(supplier, key, value)
    await db.commit()
    await db.refresh(supplier)
    return supplier
