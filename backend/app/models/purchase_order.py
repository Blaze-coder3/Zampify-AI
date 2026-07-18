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

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    po_number: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    vendor_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("vendors.id"), nullable=True, index=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    fulfilled_amount: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String, default="open")
    # Status: open | partially_fulfilled | closed | cancelled
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    issue_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    expected_delivery: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    line_items: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
