"""Endpoints CRUD para facturas."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.permissions import require_permission
from app.models.finance import Invoice
from app.schemas.finance import InvoiceCreate, InvoiceUpdate, InvoiceResponse, AgingBucket
from app.services.finance_service import get_receivables_aging

router = APIRouter(
    dependencies=[Depends(require_permission("invoices", "read"))],
)


@router.get("", response_model=list[InvoiceResponse])
async def list_invoices(
    status: str | None = Query(None),
    client: str | None = Query(None),
    project_id: UUID | None = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Invoice).order_by(Invoice.issue_date.desc())
    if status:
        q = q.where(Invoice.status == status)
    if client:
        q = q.where(Invoice.client.ilike(f"%{client}%"))
    if project_id:
        q = q.where(Invoice.project_id == project_id)
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/receivables", response_model=list[AgingBucket])
async def receivables_aging(db: AsyncSession = Depends(get_db)):
    return await get_receivables_aging(db)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Factura")
    return invoice


@router.post("", response_model=InvoiceResponse, status_code=201,
             dependencies=[Depends(require_permission("invoices", "create"))])
async def create_invoice(data: InvoiceCreate, db: AsyncSession = Depends(get_db)):
    tax_amount = data.subtotal * data.tax_rate
    total = data.subtotal + tax_amount
    invoice = Invoice(
        **data.model_dump(),
        tax_amount=tax_amount,
        total=total,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return invoice


@router.patch("/{invoice_id}", response_model=InvoiceResponse,
              dependencies=[Depends(require_permission("invoices", "update"))])
async def update_invoice(invoice_id: UUID, data: InvoiceUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Factura")

    updates = data.model_dump(exclude_unset=True)

    for key, value in updates.items():
        setattr(invoice, key, value)

    # Recalcular totales si cambia subtotal o tax_rate
    if "subtotal" in updates or "tax_rate" in updates:
        invoice.tax_amount = invoice.subtotal * invoice.tax_rate
        invoice.total = invoice.subtotal + invoice.tax_amount

    await db.commit()
    await db.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}", status_code=204,
               dependencies=[Depends(require_permission("invoices", "delete"))])
async def delete_invoice(invoice_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Factura")
    await db.delete(invoice)
    await db.commit()
