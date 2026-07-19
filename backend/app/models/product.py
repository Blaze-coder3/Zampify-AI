from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    sku: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    category: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hsn: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    gst_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    uom: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    unit_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
