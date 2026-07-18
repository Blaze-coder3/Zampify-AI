import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Communication(Base):
    __tablename__ = "communications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    vendor_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("vendors.id"), nullable=True, index=True)
    email_subject: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email_body: Mapped[str] = mapped_column(Text, nullable=False)
    
    classification: Mapped[str] = mapped_column(String, index=True)
    # Classifications: "spam", "vendor_query", "sent_reply"
    
    response_body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
