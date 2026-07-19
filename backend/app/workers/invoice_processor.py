"""
Main Invoice Processing Worker (ARQ Task).

This is the orchestrator of the full processing pipeline:
1. Classify PDF (digital or scanned)
2. Extract raw text (OCR)
3. AI structured extraction (FeatherlessAI)
4. Financial validation (deterministic rules)
5. Fraud detection
6. Decision engine + explanation
7. Update database + process ledger
8. Notify relevant users

Runs as an ARQ background worker — async, retriable, idempotent.
"""

import time
import json
import yaml
import os
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.logging import get_logger
from app.config import settings
from app.models import Invoice, Vendor, PurchaseOrder, ProcessLedgerEvent, ValidationResult, AuditLog
from app.services.document_classifier import classify_pdf
from app.services.text_extractor import extract_text
from app.services.ai_extractor import extract_invoice_data
from app.services.validation_engine import run_all_validations
from app.services.fraud_detector import validate_fraud_velocity, validate_threshold_skirting
from app.services.decision_engine import run_decision_pipeline

logger = get_logger(__name__)


def load_policy() -> dict:
    """Load the active policy configuration from YAML."""
    policy_path = os.path.join(os.path.dirname(__file__), "..", "policies", "policies.yaml")
    with open(policy_path, "r") as f:
        return yaml.safe_load(f)


async def _log_ledger_event(
    db: AsyncSession,
    invoice_id: str,
    stage: str,
    status: str,
    details: str = "",
    confidence: float = None,
    duration_ms: int = None,
):
    """Append an immutable event to the process ledger."""
    event = ProcessLedgerEvent(
        invoice_id=invoice_id,
        stage=stage,
        status=status,
        details=details,
        stage_confidence=confidence,
        duration_ms=duration_ms,
    )
    db.add(event)
    await db.commit()


async def _update_invoice_status(
    db: AsyncSession,
    invoice_id: str,
    status: str,
    **kwargs
):
    """Update invoice status and any additional fields."""
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if invoice:
        invoice.status = status
        invoice.updated_at = datetime.now(timezone.utc)
        for k, v in kwargs.items():
            setattr(invoice, k, v)
        await db.commit()
    return invoice


async def process_invoice(ctx, invoice_id: str):
    """
    Main ARQ task: full invoice processing pipeline.
    This task is idempotent — safe to retry on failure.
    """
    logger.info("pipeline_started", invoice_id=invoice_id)
    start_time = time.time()

    async with AsyncSessionLocal() as db:
        try:
            # Load invoice record
            result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
            invoice = result.scalar_one_or_none()
            if not invoice:
                logger.error("invoice_not_found", invoice_id=invoice_id)
                return

            pdf_path = invoice.pdf_storage_path
            policy = load_policy()
            policy_version = policy.get("policy_metadata", {}).get("version", "unknown")

            # ─────────────────────────────────────────
            # STAGE 1: Document Classification
            # ─────────────────────────────────────────
            await _update_invoice_status(db, invoice_id, "classifying")
            await _log_ledger_event(db, invoice_id, "classifying", "started")
            stage_start = time.time()

            try:
                classification = classify_pdf(pdf_path)
                duration = int((time.time() - stage_start) * 1000)
                await _log_ledger_event(
                    db, invoice_id, "classifying", "completed",
                    details=f"PDF type: {classification.pdf_type}, Pages: {classification.page_count}",
                    confidence=classification.confidence,
                    duration_ms=duration,
                )
                logger.info("stage_classification_done", invoice_id=invoice_id, pdf_type=classification.pdf_type)
            except Exception as e:
                await _update_invoice_status(db, invoice_id, "failed")
                await _log_ledger_event(db, invoice_id, "classifying", "failed", details=str(e))
                logger.error("classification_failed", invoice_id=invoice_id, error=str(e))
                raise

            # ─────────────────────────────────────────
            # STAGE 2: Text Extraction (OCR)
            # ─────────────────────────────────────────
            await _update_invoice_status(db, invoice_id, "extracting")
            await _log_ledger_event(db, invoice_id, "extracting", "started")
            stage_start = time.time()

            try:
                extraction = extract_text(pdf_path, classification.pdf_type)
                duration = int((time.time() - stage_start) * 1000)
                await _log_ledger_event(
                    db, invoice_id, "extracting", "completed",
                    details=f"Method: {extraction.method}, Confidence: {extraction.ocr_confidence:.1f}%",
                    confidence=extraction.ocr_confidence,
                    duration_ms=duration,
                )

                # Check OCR confidence threshold
                ocr_threshold = policy.get("company_policy", {}).get("ocr_confidence_threshold", 80.0)
                if extraction.ocr_confidence < ocr_threshold:
                    logger.warning(
                        "low_ocr_confidence",
                        invoice_id=invoice_id,
                        confidence=extraction.ocr_confidence,
                        threshold=ocr_threshold,
                    )
                    await _update_invoice_status(
                        db, invoice_id, "needs_review",
                        ocr_confidence=extraction.ocr_confidence,
                        extraction_method=extraction.method,
                        decision="needs_review",
                        decision_explanation=f"OCR confidence {extraction.ocr_confidence:.1f}% is below threshold {ocr_threshold}%. Manual review required.",
                    )
                    return  # Route to human review — pipeline complete

            except Exception as e:
                await _update_invoice_status(db, invoice_id, "failed")
                await _log_ledger_event(db, invoice_id, "extracting", "failed", details=str(e))
                raise

            # ─────────────────────────────────────────
            # STAGE 3: AI Structured Extraction (LLM #1)
            # ─────────────────────────────────────────
            stage_start = time.time()
            try:
                ai_result = await extract_invoice_data(extraction.raw_text, invoice_id)
                duration = int((time.time() - stage_start) * 1000)

                # Update invoice with extracted data
                extracted = ai_result.extracted_data
                grand_total_data = extracted.get("grand_total", {})
                invoice_number_data = extracted.get("invoice_number", {})
                currency_data = extracted.get("currency", {})
                payment_terms_data = extracted.get("payment_terms", {})
                subtotal_data = extracted.get("subtotal", {})
                tax_data = extracted.get("tax_amount", {})

                await _update_invoice_status(
                    db, invoice_id, "extracted",
                    invoice_number=invoice_number_data.get("value") if isinstance(invoice_number_data, dict) else None,
                    grand_total=grand_total_data.get("value") if isinstance(grand_total_data, dict) else None,
                    currency=currency_data.get("value") if isinstance(currency_data, dict) else None,
                    payment_terms=payment_terms_data.get("value") if isinstance(payment_terms_data, dict) else None,
                    subtotal=subtotal_data.get("value") if isinstance(subtotal_data, dict) else None,
                    tax_amount=tax_data.get("value") if isinstance(tax_data, dict) else None,
                    ocr_confidence=extraction.ocr_confidence,
                    extraction_confidence=ai_result.extraction_confidence,
                    extraction_method=extraction.method,
                    raw_extracted_data=ai_result.extracted_data,
                    field_confidences=ai_result.field_confidences,
                    ocr_bounding_boxes={
                        "fields": ai_result.bounding_boxes,
                        "layout_regions": getattr(extraction, "layout_regions", [])
                    },
                )

                await _log_ledger_event(
                    db, invoice_id, "extracting", "ai_completed",
                    details=f"Fields extracted with {ai_result.extraction_confidence:.1f}% mean confidence. Bundled: {ai_result.line_items_bundled}",
                    confidence=ai_result.extraction_confidence,
                    duration_ms=duration,
                )

            except Exception as e:
                await _update_invoice_status(db, invoice_id, "failed")
                await _log_ledger_event(db, invoice_id, "extracting", "failed", details=str(e))
                raise

            # ─────────────────────────────────────────
            # STAGE 4: Vendor & PO Lookup
            # ─────────────────────────────────────────
            vendor_name_extracted = extracted.get("vendor_name", {})
            vendor_name = vendor_name_extracted.get("value") if isinstance(vendor_name_extracted, dict) else None

            po_number_data = extracted.get("po_number", {})
            po_number = po_number_data.get("value") if isinstance(po_number_data, dict) else None

            # Vendor lookup (fuzzy match done in validation engine)
            vendor_record = None
            if vendor_name:
                # Try exact match first
                res = await db.execute(
                    select(Vendor).where(Vendor.name.ilike(f"%{vendor_name}%"))
                )
                vendor_record = res.scalar_one_or_none()
                if vendor_record:
                    await _update_invoice_status(db, invoice_id, "extracted", vendor_id=vendor_record.id)

            # PO lookup
            po_record = None
            if po_number:
                res = await db.execute(
                    select(PurchaseOrder).where(PurchaseOrder.po_number == po_number)
                )
                po_record = res.scalar_one_or_none()
                if po_record:
                    await _update_invoice_status(db, invoice_id, "extracted", matched_po_id=po_record.id)

            # ─────────────────────────────────────────
            # STAGE 5: Validation
            # ─────────────────────────────────────────
            await _update_invoice_status(db, invoice_id, "validating")
            await _log_ledger_event(db, invoice_id, "validating", "started")
            stage_start = time.time()

            # Get recent invoices for duplicate detection
            window_days = policy.get("company_policy", {}).get("duplicate_window_days", 90)
            cutoff = datetime.now(timezone.utc) - timedelta(days=window_days)
            dup_query = select(Invoice).where(
                Invoice.vendor_id == (vendor_record.id if vendor_record else None),
                Invoice.received_at >= cutoff,
                Invoice.id != invoice_id,
            )
            dup_result = await db.execute(dup_query)
            recent_invoices = dup_result.scalars().all()

            # Get recent invoices for velocity check
            velocity_hours = policy.get("fraud_detection", {}).get("velocity_window_hours", 24)
            velocity_cutoff = datetime.now(timezone.utc) - timedelta(hours=velocity_hours)
            vel_query = select(Invoice).where(
                Invoice.vendor_id == (vendor_record.id if vendor_record else None),
                Invoice.received_at >= velocity_cutoff,
                Invoice.id != invoice_id,
            )
            vel_result = await db.execute(vel_query)
            recent_velocity_invoices = vel_result.scalars().all()

            # Run all business rules
            validation_summary = run_all_validations(
                extracted_data=ai_result.extracted_data,
                ocr_confidence=extraction.ocr_confidence,
                vendor_record=vendor_record,
                po_record=po_record,
                recent_invoices=list(recent_invoices),
                policy=policy,
            )

            # Fraud rules
            velocity_max = policy.get("fraud_detection", {}).get("velocity_max_invoices", 3)
            fraud_velocity = validate_fraud_velocity(
                list(recent_velocity_invoices),
                vendor_name or "Unknown",
                velocity_max,
                velocity_hours,
            )

            invoice_total = grand_total_data.get("value") if isinstance(grand_total_data, dict) else None
            auto_limit = policy.get("company_policy", {}).get("max_auto_approval_amount", 5000.0)
            fraud_skirting = validate_threshold_skirting(invoice_total, auto_limit)

            # Merge fraud rules into validation summary
            validation_summary.results.extend([fraud_velocity, fraud_skirting])
            if fraud_velocity.status == "fail":
                validation_summary.has_critical_failures = True
            if fraud_skirting.status == "warning":
                validation_summary.has_warnings = True

            # Persist validation results
            for rule_result in validation_summary.results:
                
                details_data = rule_result.details if rule_result.details else rule_result.reason
                if isinstance(details_data, (dict, list)):
                    details_data = json.dumps(details_data)
                elif details_data is not None:
                    details_data = str(details_data)

                vr = ValidationResult(
                    invoice_id=invoice_id,
                    rule_id=rule_result.rule_id,
                    status=rule_result.status,
                    details=details_data,
                )
                db.add(vr)
            await db.commit()

            duration = int((time.time() - stage_start) * 1000)
            await _log_ledger_event(
                db, invoice_id, "validating", "completed",
                details=f"{len(validation_summary.results)} rules evaluated. Critical failures: {validation_summary.has_critical_failures}. Warnings: {validation_summary.has_warnings}",
                confidence=validation_summary.rules_confidence,
                duration_ms=duration,
            )

            # ─────────────────────────────────────────
            # STAGE 6: Decision + Explanation (LLM #2)
            # ─────────────────────────────────────────
            await _log_ledger_event(db, invoice_id, "deciding", "started")
            stage_start = time.time()

            decision_result = await run_decision_pipeline(
                validation_summary=validation_summary,
                extracted_data=ai_result.extracted_data,
                ocr_confidence=extraction.ocr_confidence,
                extraction_confidence=ai_result.extraction_confidence,
                policy=policy,
                policy_version=policy_version,
            )

            duration = int((time.time() - stage_start) * 1000)

            # Update invoice with final decision
            now = datetime.now(timezone.utc)
            await _update_invoice_status(
                db, invoice_id, decision_result.decision,
                decision=decision_result.decision,
                decision_confidence=decision_result.confidence,
                decision_explanation=decision_result.explanation,
                decision_evidence={"evidence": decision_result.evidence},
                triggered_rules=decision_result.triggered_rules,
                policy_version=decision_result.policy_version,
                overall_confidence=decision_result.confidence,
                matching_confidence=decision_result.confidence_breakdown.get("po_match"),
                processed_at=now,
                decided_at=now,
            )

            await _log_ledger_event(
                db, invoice_id, "deciding", "completed",
                details=f"Decision: {decision_result.decision.upper()} | Confidence: {decision_result.confidence:.1f}%",
                confidence=decision_result.confidence,
                duration_ms=duration,
            )

            total_duration = int((time.time() - start_time) * 1000)
            logger.info(
                "pipeline_complete",
                invoice_id=invoice_id,
                decision=decision_result.decision,
                confidence=decision_result.confidence,
                total_duration_ms=total_duration,
            )

        except Exception as e:
            logger.error("pipeline_failed", invoice_id=invoice_id, error=str(e))
            async with AsyncSessionLocal() as err_db:
                await _update_invoice_status(err_db, invoice_id, "failed")
                await _log_ledger_event(err_db, invoice_id, "pipeline", "failed", details=str(e))
            raise  # Re-raise so ARQ can retry
