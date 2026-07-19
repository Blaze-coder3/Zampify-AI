import asyncio
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import AsyncSessionLocal
from app.models import Invoice, ValidationResult
from datetime import datetime, timezone, timedelta

async def test_queries():
    async with AsyncSessionLocal() as db:
        time_threshold = datetime.now(timezone.utc) - timedelta(hours=22)
        due_within_2h = await db.scalar(
            select(func.count(Invoice.id)).where(
                Invoice.received_at < time_threshold,
                ~Invoice.status.in_(["approved", "rejected", "archived", "failed"])
            )
        )
        print(f"due_within_2h: {due_within_2h}")
        
        duplicates_detected = await db.scalar(
            select(func.count(ValidationResult.invoice_id.distinct())).where(
                ValidationResult.rule_id == "duplicate_invoice",
                ValidationResult.status == "fail"
            )
        )
        print(f"duplicates_detected: {duplicates_detected}")
        
        ready_to_approve = await db.scalar(
            select(func.count(Invoice.id)).where(Invoice.status == "validated")
        )
        print(f"ready_to_approve: {ready_to_approve}")
        
        waiting_on_vendor = await db.scalar(
            select(func.count(Invoice.id)).where(Invoice.status == "triage")
        )
        print(f"waiting_on_vendor: {waiting_on_vendor}")

if __name__ == "__main__":
    asyncio.run(test_queries())
