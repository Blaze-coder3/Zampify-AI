import asyncio
from app.core.database import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        await conn.execute(text('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS line_items JSONB, ADD COLUMN IF NOT EXISTS ocr_bounding_boxes JSONB;'))
        print("Table altered successfully.")

if __name__ == "__main__":
    asyncio.run(main())
