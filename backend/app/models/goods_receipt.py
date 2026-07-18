import uuid
from datetime import datetime, timezone, date
from typing import Optional
from sqlalchemy import String, Float, DateTime, Date, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class GoodsReceipt(Base):
    __tablename__ = "goods_receipts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    gr_number: Mapped[str] = mapped_column(String, index=True, unique=True)
    po_id: Mapped[str] = mapped_column(String, ForeignKey("purchase_orders.id"), index=True)
    vendor_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("vendors.id"), nullable=True, index=True)
    
    # Financials / Matching
    total_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    currency: Mapped[Optional[str]] = mapped_column(String(3), nullable=True, default="USD")
    
    # BPI 2019 Dataset fields
    status: Mapped[str] = mapped_column(String, default="received", index=True)
    items: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # List of received items
    
    receipt_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
