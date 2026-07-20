"""Invoice API routes — upload, list, detail, human override, reprocess."""

import os
import uuid
import shutil
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from arq import create_pool
from arq.connections import RedisSettings
from app.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.exceptions import InvalidFileType, FileTooLarge
from app.models import Invoice, ValidationResult, ProcessLedgerEvent, AuditLog, Vendor, PurchaseOrder
from app.models.invoice import generate_invoice_id
from pydantic import BaseModel
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


async def get_redis_pool():
    return await create_pool(RedisSettings.from_dsn(settings.REDIS_URL))


@router.post("/intake/document", status_code=202)
async def intake_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Attachment Security Gateway & Intake API.
    Validates documents before they enter the processing queue.
    """
    import hashlib
    import yaml
    import fitz  # PyMuPDF
    
    try:
        with open(settings.POLICY_FILE, "r") as f:
            policies = yaml.safe_load(f)
    except Exception:
        policies = {}
        
    att_policy = policies.get("attachment_policy", {})
    max_file_size_mb = att_policy.get("max_file_size_mb", 25)
    warning_threshold_mb = att_policy.get("warning_threshold_mb", 10)
    max_pages = att_policy.get("max_pages", 20)
    
    # 1. Extension Validation
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail={"error": "Invalid file type", "message": f"File '{file.filename}' is not a PDF. Please upload PDF files only."})

    # 2. MIME Type Validation
    if file.content_type not in ["application/pdf", "application/x-pdf"]:
        raise HTTPException(status_code=400, detail={"error": "Invalid MIME type", "message": "Must be application/pdf."})

    # 3. File Size Check
    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > max_file_size_mb:
        raise HTTPException(status_code=400, detail={"error": "File too large", "message": f"File '{file.filename}' ({file_size_mb:.1f} MB) exceeds maximum allowed size of {max_file_size_mb} MB. Try compressing the PDF."})
    
    is_warning_size = file_size_mb > warning_threshold_mb

    # 4. Check PDF Magic Bytes
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail={"error": "Invalid PDF", "message": "The uploaded file is not a valid PDF document."})

    # 5. Duplicate Hash Check
    file_hash = hashlib.sha256(content).hexdigest()
    # Ensure Invoice model supports file_hash, check if duplicate exists
    existing_invoice = (await db.execute(select(Invoice).where(Invoice.file_hash == file_hash))).scalar_one_or_none()
    is_exact_duplicate = existing_invoice is not None

    # 6. PyMuPDF Inspections (Password, JS, Pages)
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        if doc.is_encrypted:
            raise HTTPException(status_code=400, detail={"error": "Password Protected", "message": f"File '{file.filename}' is encrypted or password-protected. Please remove the password and try again."})
        
        if doc.page_count > max_pages:
            raise HTTPException(status_code=400, detail={"error": "Too many pages", "message": f"File '{file.filename}' has {doc.page_count} pages, which exceeds the limit of {max_pages}."})
            
        # Basic JS detection in PDF (heuristic)
        if b"/JS" in content or b"/JavaScript" in content:
            # We don't necessarily reject, but we could. For now, log it.
            logger.warning(f"Potential JavaScript found in {file.filename}")
            
    except fitz.FileDataError:
        raise HTTPException(status_code=400, detail={"error": "Corrupt PDF", "message": "The PDF file appears to be corrupt or unreadable."})
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error inspecting PDF {file.filename}: {e}")
        
    try:
        # Save file to storage
        invoice_id = generate_invoice_id()
        file_path = os.path.join(settings.UPLOAD_DIR, f"{invoice_id}.pdf")
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(content)

        import random
        import string
        tracking_id = "TRK-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

        # Create invoice record
        status = "received"
        decision = None
        decision_explanation = None
        triggered_rules = []

        if is_exact_duplicate:
            status = "failed"
            decision = "rejected"
            decision_explanation = f"Exact duplicate file of {existing_invoice.id[:8].upper()}."
            triggered_rules = [{"rule_id": "BR-004", "status": "fail", "details": "Exact duplicate file"}]

        invoice = Invoice(
            id=invoice_id,
            tracking_id=tracking_id,
            pdf_storage_path=file_path,
            source="portal",
            status=status,
            decision=decision,
            decision_explanation=decision_explanation,
            triggered_rules=triggered_rules,
            received_at=datetime.now(timezone.utc),
            file_hash=file_hash
        )
        db.add(invoice)
        await db.flush()

        # Audit log
        audit = AuditLog(
            invoice_id=invoice_id,
            user_id=current_user.id,
            action="CREATE",
            reason=f"Status: {status}, Filename: {file.filename}" + (f" (Warning: {file_size_mb:.1f}MB)" if is_warning_size else ""),
        )
        db.add(audit)
        await db.commit()

        if not is_exact_duplicate:
            # Enqueue processing job
            try:
                pool = await get_redis_pool()
                await pool.enqueue_job("process_invoice", invoice_id=invoice_id)
                await pool.close()
            except Exception as e:
                logger.error("failed_to_enqueue", invoice_id=invoice_id, error=str(e))

        logger.info("invoice_uploaded", invoice_id=invoice_id, filename=file.filename)
    except Exception as exc:
        import traceback; tb = traceback.format_exc()
        from fastapi import Response
        return Response(content=tb, status_code=500)

    return {
        "data": {
            "invoice_id": invoice_id,
            "tracking_id": tracking_id,
            "status": "received",
            "message": "Invoice queued for processing",
        },
        "meta": {"estimated_processing_time_seconds": 30, "file_size_mb": round(file_size_mb, 2), "warning": is_warning_size},
    }


@router.get("")
async def list_invoices(
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List invoices with optional status filter."""
    query = select(Invoice, Vendor).outerjoin(Vendor, Invoice.vendor_id == Vendor.id).order_by(desc(Invoice.received_at)).limit(limit).offset(offset)
    if status:
        query = query.where(Invoice.status == status)

    result = await db.execute(query)
    rows = result.all()

    return {
        "data": [_invoice_summary(inv, vendor_name=ven.name if ven else None) for inv, ven in rows],
        "meta": {"count": len(rows), "limit": limit, "offset": offset},
    }

class BulkAction(BaseModel):
    invoice_ids: list[str]
    action: str

@router.post("/bulk-approve")
async def bulk_approve(
    payload: BulkAction,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from sqlalchemy import update
    await db.execute(
        update(Invoice)
        .where(Invoice.id.in_(payload.invoice_ids))
        .values(decision="approved", status="approved", decided_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return {"status": "success", "count": len(payload.invoice_ids)}

class BulkAssignAction(BaseModel):
    invoice_ids: list[str]
    assignee_id: str

class BulkTagAction(BaseModel):
    invoice_ids: list[str]
    tag: str

@router.post("/bulk-assign")
async def bulk_assign(
    payload: BulkAssignAction,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from sqlalchemy import update
    await db.execute(
        update(Invoice)
        .where(Invoice.id.in_(payload.invoice_ids))
        .values(assignee_id=payload.assignee_id)
    )
    await db.commit()
    return {"status": "success", "count": len(payload.invoice_ids)}

@router.post("/bulk-tag")
async def bulk_tag(
    payload: BulkTagAction,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from sqlalchemy import update
    
    # SQLite/Postgres json arrays can be appended, but simplest is to fetch, append, save, or use JSON functions.
    # Since we use SQLAlchemy AsyncSession, we can fetch them and update.
    result = await db.execute(select(Invoice).where(Invoice.id.in_(payload.invoice_ids)))
    invoices = result.scalars().all()
    for inv in invoices:
        current_tags = inv.tags or []
        if payload.tag not in current_tags:
            current_tags.append(payload.tag)
        inv.tags = current_tags
        
    await db.commit()
    return {"status": "success", "count": len(payload.invoice_ids)}

class DecisionPayload(BaseModel):
    decision: str
    justification: str = ""

@router.patch("/{invoice_id}/decision")
async def override_decision(
    invoice_id: str,
    payload: DecisionPayload,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    new_status = payload.decision
    if payload.decision in ("investigating", "escalated"):
        new_status = "needs_review"
        
    invoice.decision = payload.decision
    invoice.status = new_status
    invoice.decision_explanation = payload.justification
    invoice.decided_at = datetime.now(timezone.utc)
    invoice.decided_by_user_id = current_user.id
    
    await db.commit()
    return {
        "status": "success", 
        "invoice_id": invoice_id, 
        "decision": payload.decision,
        "decided_by_name": current_user.name
    }

class NotifyPayload(BaseModel):
    action: str
    reason: str = ""
    notes: str = ""

from app.services.email_sender import send_notification_email

@router.post("/{invoice_id}/notify")
async def notify_invoice_action(
    invoice_id: str,
    payload: NotifyPayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    recipient = invoice.sender_email
    if not recipient:
        return {"status": "skipped", "message": "No sender email associated with this invoice (e.g., uploaded via portal)."}

    # Dispatch email sending to background task
    logger.info(f"Queuing {payload.action} email to {recipient} for invoice {invoice.invoice_number or invoice_id}")
    background_tasks.add_task(
        send_notification_email, 
        recipient=recipient, 
        invoice_number=invoice.invoice_number or invoice_id, 
        action=payload.action, 
        reason=payload.reason, 
        notes=payload.notes
    )
    
    # Audit log
    audit = AuditLog(
        invoice_id=invoice_id,
        user_id=current_user.id,
        action="EMAIL_SENT",
        reason=f"Action: {payload.action} | To: {recipient}",
    )
    db.add(audit)
    await db.commit()
    
    return {"status": "success", "recipient": recipient, "action": payload.action}

@router.get("/communication-cases")
async def get_communication_cases(
    folder: str = "VendorInvoices",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Returns invoices formatted as Email Intake Communication Cases for the UI."""
    query = select(Invoice, Vendor, PurchaseOrder).outerjoin(
        Vendor, Invoice.vendor_id == Vendor.id
    ).outerjoin(
        PurchaseOrder, Invoice.matched_po_id == PurchaseOrder.id
    ).order_by(desc(Invoice.received_at))
    
    # Filter by folder/status
    if folder == "Exceptions":
        query = query.where(Invoice.status == "failed")
    elif folder == "VendorInvoices":
        query = query.where(Invoice.decision == "needs_review")

    result = await db.execute(query)
    rows = result.all()

    cases = []
    for inv, ven, po in rows:
        vendor_info = {"id": ven.id, "name": ven.name} if ven else {"id": "unknown", "name": "Unknown Vendor"}
        
        case_status = "NeedsReview"
        if inv.decision == "approved":
            case_status = "Closed"
        elif inv.status == "received":
            case_status = "Open"
            
        cases.append({
            "id": f"CASE-{inv.id}",
            "threadId": f"THR-{inv.id}",
            "folder": folder,
            "intent": "Invoice",
            "vendor": vendor_info,
            "subject": f"Invoice {inv.invoice_number or 'attached'}",
            "invoiceId": inv.invoice_number,
            "poNumber": po.po_number if po else None,
            "assignedTeam": "Accounts Payable",
            "createdBy": "Email Intake AI",
            "lastUpdatedBy": "System",
            "priority": "High" if not po else "Medium",
            "status": case_status,
            "aiConfidence": inv.overall_confidence or 85.0,
            "createdAt": inv.received_at.isoformat() if inv.received_at else datetime.now(timezone.utc).isoformat(),
            "updatedAt": inv.updated_at.isoformat() if inv.updated_at else datetime.now(timezone.utc).isoformat(),
        })

    return {"data": cases}


@router.get("/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get full invoice details including extraction, validations, and timeline."""
    result = await db.execute(
        select(Invoice, Vendor)
        .outerjoin(Vendor, Invoice.vendor_id == Vendor.id)
        .where(Invoice.id == invoice_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice, vendor = row
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Load validations
    val_result = await db.execute(
        select(ValidationResult).where(ValidationResult.invoice_id == invoice_id)
    )
    validations = val_result.scalars().all()

    # Load timeline
    timeline_result = await db.execute(
        select(ProcessLedgerEvent)
        .where(ProcessLedgerEvent.invoice_id == invoice_id)
        .order_by(ProcessLedgerEvent.created_at)
    )
    timeline = timeline_result.scalars().all()

    return {
        "data": {
            **_invoice_detail(invoice, vendor_name=vendor.name if vendor else None),
            "validations": [_validation_detail(v) for v in validations],
            "timeline": [_timeline_event(e) for e in timeline],
        }
    }


@router.get("/{invoice_id}/timeline")
async def get_invoice_timeline(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get processing timeline for an invoice."""
    result = await db.execute(
        select(ProcessLedgerEvent)
        .where(ProcessLedgerEvent.invoice_id == invoice_id)
        .order_by(ProcessLedgerEvent.created_at)
    )
    events = result.scalars().all()
    return {"data": [_timeline_event(e) for e in events]}


@router.post("/{invoice_id}/reprocess")
async def reprocess_invoice(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Re-submit a failed or triaged invoice back to the processing pipeline."""
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.status = "received"
    invoice.decision = None
    invoice.decision_explanation = None
    invoice.updated_at = datetime.now(timezone.utc)
    await db.commit()

    try:
        pool = await get_redis_pool()
        await pool.enqueue_job("process_invoice", invoice_id=invoice_id)
        await pool.close()
    except Exception as e:
        logger.error("failed_to_requeue", invoice_id=invoice_id, error=str(e))

    return {"data": {"invoice_id": invoice_id, "status": "requeued"}}


# ── Serialization helpers ──────────────────────────────────────

def _invoice_summary(inv: Invoice, vendor_name: str = None) -> dict:
    from datetime import timedelta
    sla_remaining = None
    if inv.received_at and inv.status not in ["approved", "completed", "failed", "archived"]:
        time_elapsed = datetime.now(timezone.utc) - inv.received_at
        remaining = timedelta(hours=24) - time_elapsed
        if remaining.total_seconds() < 0:
            sla_remaining = "Overdue"
        else:
            hours, remainder = divmod(remaining.seconds, 3600)
            minutes, _ = divmod(remainder, 60)
            sla_remaining = f"{int(hours)}h {int(minutes)}m"
            
    ai_recommendation = "Processing"
    if inv.status == "validated":
        ai_recommendation = "Ready for Approval"
    elif inv.status == "needs_review":
        ai_recommendation = "Review Required"
    elif inv.status == "failed":
        if not inv.matched_po_id:
            ai_recommendation = "Missing PO"
        else:
            ai_recommendation = "Duplicate Suspected"
    elif inv.status == "triage":
        ai_recommendation = "Needs Vendor Reply"
    elif inv.status == "approved":
        ai_recommendation = "Approved"
    elif inv.status == "rejected":
        ai_recommendation = "Rejected"
        
    priority = "Medium"
    if sla_remaining == "Overdue" or (sla_remaining and "h" in sla_remaining and int(sla_remaining.split("h")[0]) < 2):
        priority = "High"
    elif inv.grand_total and inv.grand_total > 5000:
        priority = "High"

    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "status": inv.status,
        "decision": inv.decision,
        "grand_total": inv.grand_total,
        "currency": inv.currency,
        "overall_confidence": inv.overall_confidence,
        "source": inv.source,
        "received_at": inv.received_at.isoformat() if inv.received_at else None,
        "decided_at": inv.decided_at.isoformat() if inv.decided_at else None,
        "vendor_name": vendor_name,
        "ai_recommendation": ai_recommendation,
        "priority": priority,
        "sla_remaining": sla_remaining,
        "assignee_id": inv.assignee_id,
        "assigned_to_name": "Priya Sharma",
        "tags": inv.tags or [],
        "triggered_rules": inv.triggered_rules,
        "document_type": getattr(inv, "document_type", "invoice"),
    }


def _invoice_detail(inv: Invoice, vendor_name: str = None) -> dict:
    return {
        **_invoice_summary(inv, vendor_name=vendor_name),
        "pdf_storage_path": inv.pdf_storage_path,
        "vendor_id": inv.vendor_id,
        "matched_po_id": inv.matched_po_id,
        "invoice_date": inv.invoice_date.isoformat() if inv.invoice_date else None,
        "due_date": inv.due_date.isoformat() if inv.due_date else None,
        "subtotal": inv.subtotal,
        "tax_amount": inv.tax_amount,
        "shipping": inv.shipping,
        "payment_terms": inv.payment_terms,
        "ocr_confidence": inv.ocr_confidence,
        "extraction_confidence": inv.extraction_confidence,
        "matching_confidence": inv.matching_confidence,
        "confidence_breakdown": None,
        "extraction_method": inv.extraction_method,
        "raw_extracted_data": inv.raw_extracted_data,
        "ocr_bounding_boxes": inv.ocr_bounding_boxes,
        "field_confidences": inv.field_confidences,
        "decision_explanation": inv.decision_explanation,
        "decision_evidence": inv.decision_evidence,
        "triggered_rules": inv.triggered_rules,
        "policy_version": inv.policy_version,
    }


def _validation_detail(v: ValidationResult) -> dict:
    return {
        "rule_id": v.rule_id,
        "status": v.status,
        "details": v.details,
        "evaluated_at": v.executed_at.isoformat() if v.executed_at else None,
    }


def _timeline_event(e: ProcessLedgerEvent) -> dict:
    return {
        "id": e.id,
        "stage": e.stage,
        "status": e.status,
        "details": e.details,
        "confidence": e.stage_confidence,
        "duration_ms": e.duration_ms,
        "timestamp": e.created_at.isoformat() if e.created_at else None,
    }
