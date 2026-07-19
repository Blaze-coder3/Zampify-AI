import asyncio
from sqlalchemy import text
from app.core.database import engine

async def reset_db():
    async with engine.begin() as conn:
        print("Dropping public schema...")
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        print("Schema reset successful.")

if __name__ == "__main__":
    asyncio.run(reset_db())
