import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import update
from app.core.security import hash_password

async def fix():
    async with AsyncSessionLocal() as db:
        await db.execute(update(User).where(User.email == 'priya@zampify.ai').values(password_hash=hash_password('demo123')))
        await db.commit()
        print("Updated password hash!")

asyncio.run(fix())
