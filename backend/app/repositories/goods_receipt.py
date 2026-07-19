from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.goods_receipt import GoodsReceipt

class GoodsReceiptRepository(BaseRepository[GoodsReceipt]):
    def __init__(self, db: AsyncSession):
        super().__init__(GoodsReceipt, db)
