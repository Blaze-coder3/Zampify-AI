"""Purchase Orders API."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import PurchaseOrder

router = APIRouter()


@router.get("")
async def list_purchase_orders(
    status: str = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = select(PurchaseOrder)
    if status:
        query = query.where(PurchaseOrder.status == status)
    result = await db.execute(query)
    pos = result.scalars().all()
    return {
        "data": [
            {
                "id": po.id,
                "po_number": po.po_number,
                "vendor_id": po.vendor_id,
                "total_amount": po.total_amount,
                "fulfilled_amount": po.fulfilled_amount,
                "currency": po.currency,
                "status": po.status,
            }
            for po in pos
        ]
    }


@router.get("/{po_number}")
async def get_purchase_order(
    po_number: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(PurchaseOrder).where(PurchaseOrder.po_number == po_number)
    )
    po = result.scalar_one_or_none()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return {
        "data": {
            "id": po.id,
            "po_number": po.po_number,
            "vendor_id": po.vendor_id,
            "total_amount": po.total_amount,
            "fulfilled_amount": po.fulfilled_amount,
            "currency": po.currency,
            "status": po.status,
            "line_items": po.line_items,
            "issue_date": po.issue_date.isoformat() if po.issue_date else None,
        }
    }
