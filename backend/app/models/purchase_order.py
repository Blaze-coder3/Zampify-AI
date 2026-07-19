import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime, Date, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    # Use PONumber from dataset as primary key (e.g. "PO-100001")
    id: Mapped[str] = mapped_column(String, primary_key=True)
    po_number: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    vendor_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("vendors.id"), nullable=True, index=True)
    
    buyer: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    warehouse: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    po_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    tolerance_percent: Mapped[Optional[float]] = mapped_column(Float, default=0.0)

    currency: Mapped[str] = mapped_column(String(3), default="USD")
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    fulfilled_amount: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String, default="open")
    
    # Remove JSON line_items in favor of a relational mapping to po_line_items
    
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    issue_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    expected_delivery: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
