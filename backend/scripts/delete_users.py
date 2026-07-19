import asyncio
from sqlalchemy import text
from app.core.database import engine

async def update_users():
    async with engine.begin() as conn:
        # Update Sarah to Priya
        await conn.execute(text("UPDATE users SET email = 'priya@zampify.ai', name = 'Priya Sharma' WHERE email = 'sarah@zampify.ai';"))
        
        # We leave David and Admin in the DB so as not to break foreign keys on existing invoices/cases they might be assigned to.
        # But we can scramble their passwords if needed. For now, just leaving them is fine since the UI only shows Priya.
        print('Updated user to Priya.')

if __name__ == "__main__":
    asyncio.run(update_users())
