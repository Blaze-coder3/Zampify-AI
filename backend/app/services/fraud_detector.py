"""
Fraud Detection Service — Deterministic pattern detection, zero AI.

Implements BR-008 (Velocity Check) and BR-013 (Threshold Skirting).
"""

from dataclasses import dataclass, field
from app.services.validation_engine import RuleResult
from app.core.logging import get_logger

logger = get_logger(__name__)


def validate_fraud_velocity(
    recent_vendor_invoices: list,
    vendor_name: str,
    velocity_max: int = 3,
    window_hours: int = 24,
) -> RuleResult:
    """
    BR-008: Check if vendor has submitted too many invoices in a time window.
    recent_vendor_invoices: Invoice ORM objects within the time window.
    """
    count = len(recent_vendor_invoices)

    if count > velocity_max:
        return RuleResult(
            rule_id="BR-008",
            rule_name="Velocity Check",
            status="fail",
            severity="critical",
            reason=f"Fraud alert: {count} invoices from vendor '{vendor_name}' in {window_hours}h window (max: {velocity_max})",
            details={
                "vendor_name": vendor_name,
                "invoice_count": count,
                "window_hours": window_hours,
                "max_allowed": velocity_max,
                "invoice_ids": [inv.id for inv in recent_vendor_invoices],
            },
            confidence_contribution=0.0,
        )

    return RuleResult(
        rule_id="BR-008",
        rule_name="Velocity Check",
        status="pass",
        severity="critical",
        reason=f"Velocity normal: {count} invoice(s) from '{vendor_name}' in {window_hours}h window",
        details={"invoice_count": count, "window_hours": window_hours},
        confidence_contribution=100.0,
    )


def validate_threshold_skirting(
    invoice_total: float,
    auto_approval_limit: float = 5000.0,
    skirting_range_pct: float = 5.0,
) -> RuleResult:
    """
    BR-013: Detect invoices clustered just below the auto-approval threshold.
    This is a common fraud pattern — submitting amounts like $4,980, $4,990 repeatedly.
    """
    if invoice_total is None:
        return RuleResult(
            rule_id="BR-013", rule_name="Threshold Skirting",
            status="pass", severity="warning",
            reason="No invoice total to check for threshold skirting",
            details={},
            confidence_contribution=100.0,
        )

    lower_bound = auto_approval_limit * (1 - skirting_range_pct / 100)

    if lower_bound <= invoice_total < auto_approval_limit:
        return RuleResult(
            rule_id="BR-013",
            rule_name="Threshold Skirting",
            status="warning",
            severity="warning",
            reason=f"Invoice amount ${invoice_total:,.2f} is within {skirting_range_pct}% below auto-approval limit ${auto_approval_limit:,.2f} — potential threshold skirting",
            details={
                "invoice_amount": invoice_total,
                "auto_approval_limit": auto_approval_limit,
                "lower_bound": lower_bound,
                "gap_to_threshold": round(auto_approval_limit - invoice_total, 2),
            },
            confidence_contribution=70.0,
        )

    return RuleResult(
        rule_id="BR-013",
        rule_name="Threshold Skirting",
        status="pass",
        severity="warning",
        reason=f"Invoice amount ${invoice_total:,.2f} shows no threshold skirting pattern",
        details={"invoice_amount": invoice_total},
        confidence_contribution=100.0,
    )
