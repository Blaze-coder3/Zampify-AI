import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime, Date, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


import random
import string

def utcnow():
    return datetime.now(timezone.utc)

def generate_invoice_id():
    now = utcnow()
    yymm = now.strftime("%y%m")
    random_chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"INV-{yymm}-{random_chars}"

class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_invoice_id)
    invoice_number: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)
    tracking_id: Mapped[Optional[str]] = mapped_column(String, nullable=True, unique=True, index=True)
    vendor_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("vendors.id"), nullable=True, index=True)
    matched_po_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("purchase_orders.id"), nullable=True)
    assignee_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    tags: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True)

    # Processing Status (State Machine)
    status: Mapped[str] = mapped_column(String, default="received", index=True)
    # States: received | classifying | extracting | extracted | validating | validated
    #         approved | needs_review | rejected | failed | triage | archived

    # Invoice Financial Fields
    invoice_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    currency: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    subtotal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    tax_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    shipping: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    grand_total: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    payment_terms: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Storage
    pdf_storage_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    file_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)
    source: Mapped[str] = mapped_column(String, default="portal")
    # Sources: email | portal | manual
    document_type: Mapped[str] = mapped_column(String, default="invoice")
    email_message_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sender_email: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # OCR & Extraction Confidence (Propagated, not LLM-invented)
    ocr_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    extraction_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    matching_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    overall_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    extraction_method: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    # Methods: docling | tesseract | vlm

    # Raw Data (JSONB-equivalent)
    raw_extracted_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    field_confidences: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Dataset Support Fields (DocILE & SROIE)
    line_items: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ocr_bounding_boxes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Decision
    decision: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)
    # Decisions: approved | needs_review | rejected
    decision_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    decision_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    decision_evidence: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    decided_by_user_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    triggered_rules: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    policy_version: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Timestamps
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    decided_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
