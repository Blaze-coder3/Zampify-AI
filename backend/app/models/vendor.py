import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    tax_id: Mapped[str] = mapped_column(String, unique=True, nullable=True, index=True)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    email: Mapped[str] = mapped_column(String, nullable=True)
    bank_account_number: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    routing_number: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="active")
    # Status: active | inactive | blacklisted
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
