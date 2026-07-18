import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.invoice import Invoice
from app.models.purchase_order import PurchaseOrder
from app.models.goods_receipt import GoodsReceipt
from app.models.audit import ValidationResult

logger = logging.getLogger(__name__)

async def execute_three_way_match(db: AsyncSession, invoice_id: str) -> dict:
    """
    Executes a real Three-Way Match against the database models.
    Compares: Invoice vs PO vs GRN.
    Returns a dict containing matched status and validation results.
    """
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise ValueError(f"Invoice {invoice_id} not found")

    validations = []
    decision = "needs_review"
    explanation = []
    
    if not invoice.matched_po_id:
        validations.append({
            "rule_id": "M-001",
            "rule_name": "PO Matching",
            "status": "fail",
            "severity": "high",
            "reason": "No Purchase Order linked to this invoice",
            "details": {}
        })
        explanation.append("Failed 3-Way Match: No PO linked.")
    else:
        # Load PO
        po_result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == invoice.matched_po_id))
        po = po_result.scalar_one_or_none()
        
        if po:
            validations.append({
                "rule_id": "M-001",
                "rule_name": "PO Matching",
                "status": "pass",
                "severity": "low",
                "reason": f"Linked to PO {po.po_number}",
                "details": {"po_number": po.po_number}
            })
            
            # Price Tolerance Check
            inv_total = invoice.grand_total or 0.0
            po_total = po.total_amount or 0.0
            diff = abs(inv_total - po_total)
            
            if diff > 10.0:  # $10 tolerance
                validations.append({
                    "rule_id": "M-002",
                    "rule_name": "Price Matching",
                    "status": "fail",
                    "severity": "high",
                    "reason": f"Invoice total ({inv_total}) does not match PO total ({po_total})",
                    "details": {"diff": diff}
                })
                explanation.append(f"Price mismatch: Inv=${inv_total}, PO=${po_total}.")
            else:
                validations.append({
                    "rule_id": "M-002",
                    "rule_name": "Price Matching",
                    "status": "pass",
                    "severity": "low",
                    "reason": "Totals match within tolerance.",
                    "details": {}
                })
                
            # Check for GRN
            gr_result = await db.execute(select(GoodsReceipt).where(GoodsReceipt.po_id == po.id))
            grs = gr_result.scalars().all()
            
            if not grs:
                validations.append({
                    "rule_id": "M-003",
                    "rule_name": "Goods Receipt Matching",
                    "status": "fail",
                    "severity": "high",
                    "reason": "No Goods Receipt found for this PO.",
                    "details": {}
                })
                explanation.append("Missing GRN.")
            else:
                validations.append({
                    "rule_id": "M-003",
                    "rule_name": "Goods Receipt Matching",
                    "status": "pass",
                    "severity": "low",
                    "reason": f"Found {len(grs)} Goods Receipt(s).",
                    "details": {"gr_count": len(grs)}
                })
        else:
            validations.append({
                "rule_id": "M-001",
                "rule_name": "PO Matching",
                "status": "fail",
                "severity": "high",
                "reason": "Linked PO ID does not exist.",
                "details": {}
            })
            explanation.append("Invalid PO linked.")

    # Determine final decision
    failed_validations = [v for v in validations if v["status"] == "fail"]
    
    if len(failed_validations) == 0:
        decision = "approved"
        status = "validated"
        explanation_text = "Passed Three-Way Match seamlessly."
    else:
        decision = "needs_review"
        status = "triage"
        explanation_text = " | ".join(explanation)

    # Update Invoice in DB
    invoice.decision = decision
    invoice.status = status
    invoice.decision_explanation = explanation_text
    invoice.decision_evidence = {"evidence": validations}
    
    await db.commit()
    return {
        "invoice_id": invoice_id,
        "decision": decision,
        "status": status,
        "validations": validations
    }
