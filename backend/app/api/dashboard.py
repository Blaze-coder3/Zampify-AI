"""Dashboard API — KPI stats and pipeline metrics."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Invoice, ValidationResult
from datetime import datetime, timezone, timedelta

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """KPI summary: STP rate, counts by status, avg processing time."""

    total = await db.scalar(select(func.count(Invoice.id)))
    approved = await db.scalar(select(func.count(Invoice.id)).where(Invoice.decision == "approved"))
    rejected = await db.scalar(select(func.count(Invoice.id)).where(Invoice.decision == "rejected"))
    needs_review = await db.scalar(select(func.count(Invoice.id)).where(Invoice.status.in_(["needs_review", "failed"])))
    pending = await db.scalar(
        select(func.count(Invoice.id)).where(
            Invoice.status.in_(["received", "classifying", "extracting", "extracted", "validating", "validated"])
        )
    )
    failed = await db.scalar(select(func.count(Invoice.id)).where(Invoice.status == "failed"))

    time_threshold = datetime.now(timezone.utc) - timedelta(hours=22)
    due_within_2h = await db.scalar(
        select(func.count(Invoice.id)).where(
            Invoice.received_at < time_threshold,
            ~Invoice.status.in_(["approved", "rejected", "archived", "failed"])
        )
    )

    duplicates_detected = await db.scalar(
        select(func.count(ValidationResult.invoice_id.distinct())).where(
            ValidationResult.rule_id == "duplicate_invoice",
            ValidationResult.status == "fail"
        )
    )

    ready_to_approve = await db.scalar(
        select(func.count(Invoice.id)).where(Invoice.status == "validated", Invoice.decision != "approved")
    )
    
    waiting_on_vendor = await db.scalar(
        select(func.count(Invoice.id)).where(Invoice.status == "triage")
    )

    stp_rate = round((approved / total * 100), 1) if total and total > 0 else 0.0

    # Average processing time in seconds
    time_query = select(
        func.avg(
            func.extract("epoch", Invoice.decided_at) - func.extract("epoch", Invoice.received_at)
        )
    ).where(Invoice.decided_at.isnot(None))
    avg_time = await db.scalar(time_query)

    return {
        "data": {
            "total_invoices": total or 0,
            "approved": approved or 0,
            "rejected": rejected or 0,
            "needs_review": needs_review or 0,
            "pending": pending or 0,
            "failed": failed or 0,
            "due_within_2h": due_within_2h or 0,
            "duplicates_detected": duplicates_detected or 0,
            "ready_to_approve": ready_to_approve or 0,
            "waiting_on_vendor": waiting_on_vendor or 0,
            "stp_rate": stp_rate,
            "avg_processing_time_seconds": round(avg_time, 1) if avg_time else None,
        }
    }


@router.get("/pipeline")
async def get_pipeline_status(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Current pipeline counts by stage for the admin live view."""
    stages = [
        "received", "classifying", "extracting", "extracted",
        "validating", "validated", "approved", "needs_review",
        "rejected", "failed", "triage",
    ]

    result = {}
    for stage in stages:
        count = await db.scalar(
            select(func.count(Invoice.id)).where(Invoice.status == stage)
        )
        result[stage] = count or 0

    return {"data": result}
