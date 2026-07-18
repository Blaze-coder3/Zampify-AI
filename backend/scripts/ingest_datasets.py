import asyncio
import logging
from pathlib import Path
from sqlalchemy import text
from app.core.database import AsyncSessionLocal, engine, Base
from app.services.dataset_ingestion import ingest_bpi_2019, ingest_docile_sroie
from app.models import *  # Ensure all models are loaded

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "raw"
BPI_FILE = DATA_DIR / "bpi_2019" / "bpi_2019_sample.json"
OCR_FILE = DATA_DIR / "ocr_samples" / "docile_sroie_sample.json"

async def run_ingestion():
    logger.info("Initializing database...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Starting dataset ingestion pipeline...")
    async with AsyncSessionLocal() as db:
        logger.info("Clearing existing data...")
        await db.execute(text("TRUNCATE TABLE invoices, purchase_orders, goods_receipts, vendors CASCADE"))
        await db.commit()
        
        await ingest_bpi_2019(db, BPI_FILE)
        await ingest_docile_sroie(db, OCR_FILE)
        
    logger.info("Dataset ingestion complete.")

if __name__ == "__main__":
    asyncio.run(run_ingestion())
