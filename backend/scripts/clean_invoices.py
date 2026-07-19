import asyncio
import os
import shutil
import sys
from pathlib import Path

# Add the parent directory to sys.path to allow importing app modules
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.database import AsyncSessionLocal
from sqlalchemy import text
from app.config import settings

async def clean_invoices():
    print("Connecting to database...")
    async with AsyncSessionLocal() as session:
        try:
            print("Deleting from process_ledger_events...")
            await session.execute(text("DELETE FROM process_ledger_events"))
            
            print("Deleting from validation_results...")
            await session.execute(text("DELETE FROM validation_results"))
            
            print("Deleting from audit_logs...")
            await session.execute(text("DELETE FROM audit_logs"))
            
            print("Deleting from communications...")
            await session.execute(text("DELETE FROM communications"))
            
            print("Deleting from invoices...")
            await session.execute(text("DELETE FROM invoices"))
            
            await session.commit()
            print("Database cleanup completed successfully.")
        except Exception as e:
            await session.rollback()
            print(f"Error during database cleanup: {e}")
            raise
            
    print(f"Clearing uploads directory: {settings.UPLOAD_DIR}")
    if os.path.exists(settings.UPLOAD_DIR):
        for filename in os.listdir(settings.UPLOAD_DIR):
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Failed to delete {file_path}. Reason: {e}")
    else:
        print("Upload directory does not exist, skipping.")

if __name__ == "__main__":
    asyncio.run(clean_invoices())
