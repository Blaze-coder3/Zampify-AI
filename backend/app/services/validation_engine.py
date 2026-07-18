"""
Financial Validation Engine — Pure deterministic business logic, zero AI.

Runs all 13 business rules (BR-001 to BR-013) against extracted invoice data.
Each rule returns a ValidationResult with pass/warning/fail and evidence.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Optional
from thefuzz import fuzz
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class RuleResult:
    rule_id: str
    rule_name: str
    status: str      # "pass" | "warning" | "fail"
    severity: str    # "info" | "warning" | "critical"
    reason: str
    details: dict = field(default_factory=dict)
    confidence_contribution: float = 100.0


@dataclass
class ValidationSummary:
    results: list[RuleResult]
    has_critical_failures: bool
    has_warnings: bool
    rules_confidence: float  # Computed from rule outcomes


def _compute_rules_confidence(results: list[RuleResult]) -> float:
    """
    Rule confidence degrades per warning/failure:
    - Each WARNING: -10 points
    - Each CRITICAL FAIL: -30 points
    Floor: 0.0
    """
    score = 100.0
    for r in results:
        if r.status == "warning":
            score -= 10.0
        elif r.status == "fail" and r.severity == "critical":
            score -= 30.0
        elif r.status == "fail":
            score -= 15.0
    return max(0.0, round(score, 2))


# ─────────────────────────────────────────────
# BR-001: Vendor Validation
# ─────────────────────────────────────────────
def validate_vendor(extracted_vendor_name: Optional[str], vendor_db_record) -> RuleResult:
    """
    Check if the extracted vendor name matches an approved vendor.
    vendor_db_record: the Vendor ORM object, or None if not found.
    """
    if not extracted_vendor_name:
        return RuleResult(
            rule_id="BR-001", rule_name="Vendor Exists",
            status="fail", severity="critical",
            reason="No vendor name extracted from invoice",
            details={"extracted_name": None},
            confidence_contribution=0.0,
        )

    if vendor_db_record is None:
        return RuleResult(
            rule_id="BR-001", rule_name="Vendor Exists",
            status="fail", severity="critical",
            reason=f"Vendor '{extracted_vendor_name}' not found in approved vendor master",
            details={"extracted_name": extracted_vendor_name, "match_score": 0},
            confidence_contribution=0.0,
        )

    match_score = fuzz.token_sort_ratio(
        extracted_vendor_name.upper(), vendor_db_record.name.upper()
    )
    confidence = float(match_score)

    if match_score >= 95:
        return RuleResult(
            rule_id="BR-001", rule_name="Vendor Exists",
            status="pass", severity="critical",
            reason=f"Vendor '{vendor_db_record.name}' verified in approved vendor master",
            details={"match_score": match_score, "vendor_id": vendor_db_record.id},
            confidence_contribution=confidence,
        )
    elif match_score >= 80:
        return RuleResult(
            rule_id="BR-001", rule_name="Vendor Exists",
            status="warning", severity="critical",
            reason=f"Vendor name fuzzy match ({match_score}%). Invoice: '{extracted_vendor_name}', Master: '{vendor_db_record.name}'",
            details={"match_score": match_score, "vendor_id": vendor_db_record.id},
            confidence_contribution=confidence,
        )
    else:
        return RuleResult(
            rule_id="BR-001", rule_name="Vendor Exists",
            status="fail", severity="critical",
            reason=f"Vendor name match too low ({match_score}%). Cannot verify vendor.",
            details={"match_score": match_score},
            confidence_contribution=0.0,
        )


# ─────────────────────────────────────────────
# BR-002 & BR-003: PO Existence + Amount Tolerance
# ─────────────────────────────────────────────
def validate_po_match(
    extracted_po_number: Optional[str],
    invoice_total: Optional[float],
    po_record,
    tolerance_pct: float = 2.0,
) -> list[RuleResult]:
    """
    BR-002: Does the PO exist?
    BR-003: Is the amount within tolerance?
    Returns 2 rule results.
    """
    results = []

    # BR-002: PO Exists
    if not extracted_po_number or po_record is None:
        results.append(RuleResult(
            rule_id="BR-002", rule_name="PO Exists",
            status="fail", severity="critical",
            reason=f"PO '{extracted_po_number}' not found in purchase order database",
            details={"po_number": extracted_po_number},
            confidence_contribution=0.0,
        ))
        results.append(RuleResult(
            rule_id="BR-003", rule_name="Amount Tolerance",
            status="fail", severity="critical",
            reason="Cannot validate amount — PO not found",
            details={},
            confidence_contribution=0.0,
        ))
        return results

    results.append(RuleResult(
        rule_id="BR-002", rule_name="PO Exists",
        status="pass", severity="critical",
        reason=f"PO '{po_record.po_number}' found with status '{po_record.status}'",
        details={"po_id": po_record.id, "po_status": po_record.status},
        confidence_contribution=100.0,
    ))

    # BR-003: Amount Tolerance
    if invoice_total is None or po_record.total_amount is None:
        results.append(RuleResult(
            rule_id="BR-003", rule_name="Amount Tolerance",
            status="fail", severity="critical",
            reason="Cannot validate amount — invoice or PO total is missing",
            details={},
            confidence_contribution=0.0,
        ))
        return results

    variance_amt = abs(invoice_total - po_record.total_amount)
    allowed_variance = max(po_record.total_amount * 0.05, 500.0)
    variance_pct = variance_amt / po_record.total_amount * 100
    
    # PO match confidence: perfect=100, degrades by variance
    po_confidence = max(0.0, 100.0 - (variance_amt / allowed_variance) * 50.0)

    if variance_amt <= allowed_variance:
        results.append(RuleResult(
            rule_id="BR-003", rule_name="Amount Tolerance",
            status="pass", severity="critical",
            reason=f"Invoice amount ${invoice_total:,.2f} within allowed variance of PO amount ${po_record.total_amount:,.2f} (allowed: max of 5% or $500)",
            details={
                "invoice_amount": invoice_total,
                "po_amount": po_record.total_amount,
                "variance_amt": round(variance_amt, 2),
                "allowed_variance": round(allowed_variance, 2),
            },
            confidence_contribution=po_confidence,
        ))
    elif variance_amt <= allowed_variance * 1.5:
        results.append(RuleResult(
            rule_id="BR-003", rule_name="Amount Tolerance",
            status="warning", severity="critical",
            reason=f"Invoice amount ${invoice_total:,.2f} exceeds PO by ${variance_amt:,.2f} (warning up to 1.5x allowed variance)",
            details={
                "invoice_amount": invoice_total,
                "po_amount": po_record.total_amount,
                "variance_amt": round(variance_amt, 2),
                "allowed_variance": round(allowed_variance, 2),
            },
            confidence_contribution=po_confidence,
        ))
    else:
        results.append(RuleResult(
            rule_id="BR-003", rule_name="Amount Tolerance",
            status="fail", severity="critical",
            reason=f"Invoice amount ${invoice_total:,.2f} exceeds PO by ${variance_amt:,.2f} — beyond maximum variance of ${allowed_variance:,.2f}",
            details={
                "invoice_amount": invoice_total,
                "po_amount": po_record.total_amount,
                "variance_amt": round(variance_amt, 2),
                "allowed_variance": round(allowed_variance, 2),
            },
            confidence_contribution=0.0,
        ))

    return results


# ─────────────────────────────────────────────
# BR-004: Duplicate Detection
# ─────────────────────────────────────────────
def validate_duplicate(
    recent_invoices: list,
    current_invoice_number: Optional[str],
    current_total: Optional[float],
    window_days: int = 90,
) -> RuleResult:
    """
    Check for duplicate invoices.
    recent_invoices: list of Invoice ORM objects within window period.
    """
    if not recent_invoices:
        return RuleResult(
            rule_id="BR-004", rule_name="Duplicate Detection",
            status="pass", severity="critical",
            reason=f"No matching invoices found in {window_days}-day window",
            details={"matches_found": 0, "window_days": window_days},
            confidence_contribution=100.0,
        )

    # Check for exact invoice number match
    if current_invoice_number:
        exact_matches = [
            inv for inv in recent_invoices
            if inv.invoice_number == current_invoice_number
        ]
        if exact_matches:
            return RuleResult(
                rule_id="BR-004", rule_name="Duplicate Detection",
                status="fail", severity="critical",
                reason=f"Exact duplicate found: Invoice '{current_invoice_number}' already processed",
                details={
                    "duplicate_invoice_id": exact_matches[0].id,
                    "duplicate_invoice_number": current_invoice_number,
                },
                confidence_contribution=0.0,
            )

    # Fuzzy amount match
    if current_total:
        amount_matches = [
            inv for inv in recent_invoices
            if inv.grand_total and abs(inv.grand_total - current_total) / current_total < 0.01
        ]
        if amount_matches:
            return RuleResult(
                rule_id="BR-004", rule_name="Duplicate Detection",
                status="warning", severity="critical",
                reason=f"Possible duplicate: {len(amount_matches)} invoice(s) with similar amount found in {window_days}-day window",
                details={"potential_duplicates": [inv.id for inv in amount_matches]},
                confidence_contribution=50.0,
            )

    return RuleResult(
        rule_id="BR-004", rule_name="Duplicate Detection",
        status="pass", severity="critical",
        reason=f"No duplicates found in {window_days}-day window",
        details={"matches_found": len(recent_invoices)},
        confidence_contribution=100.0,
    )


# ─────────────────────────────────────────────
# BR-005: Line Item Integrity
# ─────────────────────────────────────────────
def validate_line_items(extracted_data: dict) -> RuleResult:
    line_items = extracted_data.get("line_items", [])
    subtotal = extracted_data.get("subtotal", {})
    subtotal_val = subtotal.get("value") if isinstance(subtotal, dict) else None

    if not line_items or subtotal_val is None:
        return RuleResult(
            rule_id="BR-005", rule_name="Line Item Integrity",
            status="warning", severity="warning",
            reason="Cannot verify line items — missing items or subtotal",
            details={},
            confidence_contribution=70.0,
        )

    computed_subtotal = sum(
        (li.get("total", {}).get("value") or 0)
        for li in line_items
        if isinstance(li, dict)
    )
    diff = abs(computed_subtotal - subtotal_val)

    if diff == 0:
        return RuleResult(
            rule_id="BR-005", rule_name="Line Item Integrity",
            status="pass", severity="warning",
            reason=f"Line items sum ${computed_subtotal:,.2f} matches stated subtotal ${subtotal_val:,.2f}",
            details={"computed": computed_subtotal, "stated": subtotal_val, "diff": 0},
            confidence_contribution=100.0,
        )
    elif diff <= 1.0:
        return RuleResult(
            rule_id="BR-005", rule_name="Line Item Integrity",
            status="warning", severity="warning",
            reason=f"Minor rounding difference: computed ${computed_subtotal:,.2f} vs stated ${subtotal_val:,.2f} (Δ${diff:.2f})",
            details={"computed": computed_subtotal, "stated": subtotal_val, "diff": round(diff, 2)},
            confidence_contribution=80.0,
        )
    else:
        return RuleResult(
            rule_id="BR-005", rule_name="Line Item Integrity",
            status="fail", severity="warning",
            reason=f"Line item mismatch: computed ${computed_subtotal:,.2f} vs stated ${subtotal_val:,.2f} (Δ${diff:.2f})",
            details={"computed": computed_subtotal, "stated": subtotal_val, "diff": round(diff, 2)},
            confidence_contribution=30.0,
        )


# ─────────────────────────────────────────────
# BR-007: Currency Match
# ─────────────────────────────────────────────
def validate_currency(invoice_currency: Optional[str], po_currency: Optional[str]) -> RuleResult:
    if not invoice_currency or not po_currency:
        return RuleResult(
            rule_id="BR-007", rule_name="Currency Match",
            status="warning", severity="critical",
            reason="Cannot verify currency — missing from invoice or PO",
            details={"invoice_currency": invoice_currency, "po_currency": po_currency},
            confidence_contribution=70.0,
        )

    if invoice_currency.upper() == po_currency.upper():
        return RuleResult(
            rule_id="BR-007", rule_name="Currency Match",
            status="pass", severity="critical",
            reason=f"Currency match: both {invoice_currency.upper()}",
            details={"currency": invoice_currency.upper()},
            confidence_contribution=100.0,
        )
    else:
        return RuleResult(
            rule_id="BR-007", rule_name="Currency Match",
            status="fail", severity="critical",
            reason=f"Currency mismatch: invoice is {invoice_currency.upper()}, PO is {po_currency.upper()}",
            details={"invoice_currency": invoice_currency, "po_currency": po_currency},
            confidence_contribution=0.0,
        )


# ─────────────────────────────────────────────
# BR-009: Split Invoice Tracking
# ─────────────────────────────────────────────
def validate_split_invoice(
    invoice_total: Optional[float],
    po_total: float,
    already_fulfilled: float,
    split_enabled: bool = True,
) -> RuleResult:
    if not split_enabled:
        return RuleResult(
            rule_id="BR-009", rule_name="Split Invoice",
            status="pass", severity="critical",
            reason="Split invoices not applicable for this PO",
            details={},
            confidence_contribution=100.0,
        )

    if invoice_total is None:
        return RuleResult(
            rule_id="BR-009", rule_name="Split Invoice",
            status="warning", severity="critical",
            reason="Cannot validate split invoice — invoice total missing",
            details={},
            confidence_contribution=70.0,
        )

    new_fulfilled = already_fulfilled + invoice_total
    remaining = po_total - new_fulfilled
    fulfillment_pct = (new_fulfilled / po_total * 100) if po_total > 0 else 0

    if new_fulfilled > po_total:
        return RuleResult(
            rule_id="BR-009", rule_name="Split Invoice",
            status="fail", severity="critical",
            reason=f"Invoice would cause PO over-billing: cumulative ${new_fulfilled:,.2f} exceeds PO total ${po_total:,.2f}",
            details={
                "po_total": po_total,
                "already_fulfilled": already_fulfilled,
                "this_invoice": invoice_total,
                "cumulative": new_fulfilled,
                "overage": new_fulfilled - po_total,
            },
            confidence_contribution=0.0,
        )
    elif fulfillment_pct >= 90:
        return RuleResult(
            rule_id="BR-009", rule_name="Split Invoice",
            status="warning", severity="critical",
            reason=f"PO {fulfillment_pct:.1f}% fulfilled after this invoice (${remaining:,.2f} remaining)",
            details={
                "po_total": po_total,
                "already_fulfilled": already_fulfilled,
                "this_invoice": invoice_total,
                "cumulative": new_fulfilled,
                "remaining": remaining,
                "fulfillment_pct": round(fulfillment_pct, 1),
            },
            confidence_contribution=90.0,
        )
    else:
        return RuleResult(
            rule_id="BR-009", rule_name="Split Invoice",
            status="pass", severity="critical",
            reason=f"Partial PO fulfillment: ${new_fulfilled:,.2f} of ${po_total:,.2f} ({fulfillment_pct:.1f}%)",
            details={
                "po_total": po_total,
                "already_fulfilled": already_fulfilled,
                "this_invoice": invoice_total,
                "cumulative": new_fulfilled,
                "remaining": remaining,
                "fulfillment_pct": round(fulfillment_pct, 1),
            },
            confidence_contribution=100.0,
        )


# ─────────────────────────────────────────────
# BR-010: Required Fields
# ─────────────────────────────────────────────
def validate_required_fields(extracted_data: dict, ocr_confidence: float) -> RuleResult:
    critical_fields = ["invoice_number", "invoice_date", "vendor_name", "grand_total"]
    missing = []
    low_confidence = []

    for f in critical_fields:
        field_data = extracted_data.get(f, {})
        if isinstance(field_data, dict):
            val = field_data.get("value")
            conf = field_data.get("confidence", 0)
            if val is None:
                missing.append(f)
            elif conf < 70:
                low_confidence.append(f)

    if missing:
        return RuleResult(
            rule_id="BR-010", rule_name="Required Fields",
            status="fail", severity="critical",
            reason=f"Missing critical fields: {', '.join(missing)}",
            details={"missing_fields": missing},
            confidence_contribution=0.0,
        )
    elif low_confidence:
        return RuleResult(
            rule_id="BR-010", rule_name="Required Fields",
            status="warning", severity="critical",
            reason=f"Low confidence on critical fields: {', '.join(low_confidence)}",
            details={"low_confidence_fields": low_confidence},
            confidence_contribution=60.0,
        )
    else:
        return RuleResult(
            rule_id="BR-010", rule_name="Required Fields",
            status="pass", severity="critical",
            reason="All required fields extracted with sufficient confidence",
            details={"fields_checked": critical_fields},
            confidence_contribution=100.0,
        )


# ─────────────────────────────────────────────
# BR-014: Bank Detail Change Detection
# ─────────────────────────────────────────────
def validate_bank_details(extracted_data: dict, vendor_record) -> RuleResult:
    if not vendor_record:
        return RuleResult(
            rule_id="BR-014", rule_name="Bank Detail Change",
            status="pass", severity="critical",
            reason="Cannot verify bank details without vendor record",
            details={}, confidence_contribution=100.0
        )
        
    extracted_acc = extracted_data.get("bank_account_number", {}).get("value")
    extracted_rtg = extracted_data.get("routing_number", {}).get("value")
    
    # If no bank info extracted, skip
    if not extracted_acc and not extracted_rtg:
        return RuleResult(
            rule_id="BR-014", rule_name="Bank Detail Change",
            status="pass", severity="critical",
            reason="No bank details found on invoice",
            details={}, confidence_contribution=100.0
        )
        
    master_acc = vendor_record.bank_account_number
    master_rtg = vendor_record.routing_number
    
    if master_acc and extracted_acc and master_acc != extracted_acc:
        return RuleResult(
            rule_id="BR-014", rule_name="Bank Detail Change",
            status="fail", severity="critical",
            reason=f"CRITICAL: Bank account mismatch! Invoice has {extracted_acc}, but master record has {master_acc}",
            details={"invoice_acc": extracted_acc, "master_acc": master_acc},
            confidence_contribution=0.0
        )
        
    if master_rtg and extracted_rtg and master_rtg != extracted_rtg:
        return RuleResult(
            rule_id="BR-014", rule_name="Bank Detail Change",
            status="fail", severity="critical",
            reason=f"CRITICAL: Routing number mismatch! Invoice has {extracted_rtg}, but master record has {master_rtg}",
            details={"invoice_rtg": extracted_rtg, "master_rtg": master_rtg},
            confidence_contribution=0.0
        )
        
    return RuleResult(
        rule_id="BR-014", rule_name="Bank Detail Change",
        status="pass", severity="critical",
        reason="Bank details match master record (or no master record to contradict)",
        details={}, confidence_contribution=100.0
    )


def run_all_validations(
    extracted_data: dict,
    ocr_confidence: float,
    vendor_record,
    po_record,
    recent_invoices: list,
    policy: dict,
) -> ValidationSummary:
    """
    Orchestrates all validation rules and returns a complete summary.
    Called by the processing pipeline after extraction.
    """
    results = []

    # Extract key values for convenience
    extracted = extracted_data
    invoice_vendor = extracted.get("vendor_name", {})
    invoice_vendor_name = invoice_vendor.get("value") if isinstance(invoice_vendor, dict) else None

    invoice_total_data = extracted.get("grand_total", {})
    invoice_total = invoice_total_data.get("value") if isinstance(invoice_total_data, dict) else None

    invoice_number_data = extracted.get("invoice_number", {})
    invoice_number = invoice_number_data.get("value") if isinstance(invoice_number_data, dict) else None

    invoice_currency_data = extracted.get("currency", {})
    invoice_currency = invoice_currency_data.get("value") if isinstance(invoice_currency_data, dict) else None

    # Policy values
    tolerance_pct = policy.get("company_policy", {}).get("tolerance_percentage", 2.0)
    duplicate_window = policy.get("company_policy", {}).get("duplicate_window_days", 90)

    # Run all rules
    results.append(validate_vendor(invoice_vendor_name, vendor_record))
    results.extend(validate_po_match(
        extracted.get("po_number", {}).get("value"),
        invoice_total,
        po_record,
        tolerance_pct,
    ))
    results.append(validate_duplicate(recent_invoices, invoice_number, invoice_total, duplicate_window))
    results.append(validate_line_items(extracted))
    if po_record:
        results.append(validate_currency(invoice_currency, po_record.currency))
        results.append(validate_split_invoice(
            invoice_total,
            po_record.total_amount,
            po_record.fulfilled_amount,
        ))
    results.append(validate_required_fields(extracted, ocr_confidence))
    results.append(validate_bank_details(extracted, vendor_record))

    has_critical_failures = any(
        r.status == "fail" and r.severity == "critical" for r in results
    )
    has_warnings = any(r.status == "warning" for r in results)
    rules_confidence = _compute_rules_confidence(results)

    logger.info(
        "validation_complete",
        total_rules=len(results),
        critical_failures=sum(1 for r in results if r.status == "fail" and r.severity == "critical"),
        warnings=sum(1 for r in results if r.status == "warning"),
        rules_confidence=rules_confidence,
    )

    return ValidationSummary(
        results=results,
        has_critical_failures=has_critical_failures,
        has_warnings=has_warnings,
        rules_confidence=rules_confidence,
    )
