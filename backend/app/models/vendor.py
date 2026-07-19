from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, Text, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Vendor(Base):
    __tablename__ = "vendors"

    # Use VendorID from dataset as primary key (e.g. "V001")
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    category: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    gstin: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    pan: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    currency: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    payment_terms: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    risk: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    blocked: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Keeping old fields as nullable for backward compatibility
    tax_id: Mapped[str] = mapped_column(String, unique=True, nullable=True, index=True)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    email: Mapped[str] = mapped_column(String, nullable=True)
    bank_account_number: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    routing_number: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="active")
    # Status: active | inactive | blacklisted
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
