import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime, Text, ForeignKey, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class ProcessLedgerEvent(Base):
    """Immutable record of every processing stage for an invoice."""
    __tablename__ = "process_ledger_events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id: Mapped[str] = mapped_column(String, ForeignKey("invoices.id"), nullable=False, index=True)
    stage: Mapped[str] = mapped_column(String, nullable=False)
    # Stages: received | classifying | extracting | validating | deciding | notifying
    status: Mapped[str] = mapped_column(String, nullable=False)
    # Statuses: started | completed | failed
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    stage_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ValidationResult(Base):
    """Individual rule evaluation result for an invoice."""
    __tablename__ = "validation_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id: Mapped[str] = mapped_column(String, ForeignKey("invoices.id"), nullable=False, index=True)
    rule_id: Mapped[str] = mapped_column(String, nullable=False)  # e.g. BR-001
    rule_name: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)   # pass | warning | fail
    severity: Mapped[str] = mapped_column(String, nullable=False)  # info | warning | critical
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class PolicyVersion(Base):
    """Append-only store of every policy configuration snapshot."""
    __tablename__ = "policy_versions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    version: Mapped[str] = mapped_column(String, nullable=False, index=True)  # e.g. "1.2.0"
    effective_date: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    approved_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    changelog: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    policy_snapshot: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AuditLog(Base):
    """Append-only audit trail for all human and system actions."""
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("invoices.id"), nullable=True, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    action_type: Mapped[str] = mapped_column(String, nullable=False)
    # Actions: CREATE | UPDATE | APPROVE | REJECT | OVERRIDE | LOGIN | CONFIG_CHANGE
    justification: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    before_state: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    after_state: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
