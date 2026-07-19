from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.product import Product
from typing import Optional

class ProductRepository(BaseRepository[Product]):
    def __init__(self, db: AsyncSession):
        super().__init__(Product, db)
        
    async def get(self, sku: str) -> Optional[Product]:
        # Product uses sku as pk
        result = await self.db.execute(select(Product).filter(Product.sku == sku))
        return result.scalars().first()
