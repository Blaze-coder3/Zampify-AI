import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def clear_invoices():
    async with AsyncSessionLocal() as session:
        # Delete dependent tables first if cascades are not fully set up
        await session.execute(text("DELETE FROM communications"))
        await session.execute(text("DELETE FROM validation_results"))
        await session.execute(text("DELETE FROM process_ledger_events"))
        await session.execute(text("DELETE FROM audit_logs"))
        await session.execute(text("DELETE FROM invoices"))
        await session.commit()
        print("Successfully cleared all invoice-related records.")

if __name__ == "__main__":
    asyncio.run(clear_invoices())
