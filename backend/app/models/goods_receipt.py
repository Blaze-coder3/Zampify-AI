import uuid
from datetime import datetime, timezone, date
from typing import Optional
from sqlalchemy import String, Float, DateTime, Date, ForeignKey, JSON, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class GoodsReceipt(Base):
    __tablename__ = "goods_receipts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    gr_number: Mapped[str] = mapped_column(String, unique=True, index=True)
    po_number: Mapped[str] = mapped_column(String, ForeignKey("purchase_orders.id"), nullable=False, index=True)
    line_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    received_qty: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    received_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    warehouse: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="Received")
    
    # Old fields for compatibility
    invoice_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("invoices.id"), nullable=True)
    received_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    items: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
