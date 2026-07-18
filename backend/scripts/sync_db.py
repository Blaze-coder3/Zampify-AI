import asyncio
from sqlalchemy import text
from app.core.database import engine, Base
# Import all models to ensure they are registered
from app.models import *

async def init_db():
    async with engine.begin() as conn:
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created.")
        
        # Alter existing tables
        try:
            print("Altering invoices...")
            await conn.execute(text("ALTER TABLE invoices ADD COLUMN tracking_id VARCHAR UNIQUE;"))
        except Exception as e:
            print(f"Tracking ID column might already exist: {e}")
            
        try:
            print("Altering vendors...")
            await conn.execute(text("ALTER TABLE vendors ADD COLUMN bank_account_number VARCHAR;"))
            await conn.execute(text("ALTER TABLE vendors ADD COLUMN routing_number VARCHAR;"))
        except Exception as e:
            print(f"Bank details columns might already exist: {e}")
            
        print("Database sync complete.")

if __name__ == "__main__":
    asyncio.run(init_db())
