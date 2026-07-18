"""Vendors API."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Vendor

router = APIRouter()


@router.get("")
async def list_vendors(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Vendor).where(Vendor.status == "active"))
    vendors = result.scalars().all()
    return {
        "data": [
            {"id": v.id, "name": v.name, "tax_id": v.tax_id, "email": v.email, "status": v.status}
            for v in vendors
        ]
    }
