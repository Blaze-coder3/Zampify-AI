import json
import logging
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.models.invoice import Invoice
from app.models.purchase_order import PurchaseOrder
from app.models.goods_receipt import GoodsReceipt
from app.models.vendor import Vendor
from app.services.three_way_matching import execute_three_way_match

logger = logging.getLogger(__name__)

async def ingest_bpi_2019(db: AsyncSession, filepath: Path):
    """
    Ingests Purchase Orders and Goods Receipts from BPI 2019 event log.
    Expects JSON array of events: case_id, event, vendor, etc.
    """
    if not filepath.exists():
        logger.warning(f"BPI 2019 file not found at {filepath}")
        return

    with open(filepath, "r") as f:
        events = json.load(f)

    for ev in events:
        case_id = ev.get("case_id")
        event_type = ev.get("event")
        vendor_name = ev.get("vendor")

        # Ensure Vendor exists
        vendor_result = await db.execute(select(Vendor).where(Vendor.name == vendor_name))
        vendor = vendor_result.scalar_one_or_none()
        if not vendor and vendor_name:
            vendor = Vendor(name=vendor_name, status="active")
            db.add(vendor)
            await db.flush()

        if event_type == "Create Purchase Order Item":
            po_result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.po_number == case_id))
            po = po_result.scalar_one_or_none()
            if not po:
                po = PurchaseOrder(
                    po_number=case_id,
                    vendor_id=vendor.id if vendor else None,
                    total_amount=ev.get("total_amount", 0),
                    line_items=ev.get("items", []),
                    status="issued"
                )
                db.add(po)

        elif event_type == "Record Goods Receipt":
            po_result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.po_number == case_id))
            po = po_result.scalar_one_or_none()
            if po:
                grn_num = ev.get("grn_number")
                grn_result = await db.execute(select(GoodsReceipt).where(GoodsReceipt.gr_number == grn_num))
                if not grn_result.scalar_one_or_none():
                    gr = GoodsReceipt(
                        gr_number=grn_num,
                        po_id=po.id,
                        vendor_id=po.vendor_id,
                        status="received"
                    )
                    db.add(gr)
                    
    await db.commit()
    logger.info("Successfully ingested BPI 2019 events.")


async def ingest_docile_sroie(db: AsyncSession, filepath: Path):
    """
    Ingests Invoices with OCR and line items from DocILE/SROIE sample.
    """
    if not filepath.exists():
        logger.warning(f"DocILE/SROIE file not found at {filepath}")
        return

    with open(filepath, "r") as f:
        docs = json.load(f)

    for doc in docs:
        inv_num = doc.get("invoice_number")
        
        # Check if exists
        result = await db.execute(select(Invoice).where(Invoice.invoice_number == inv_num))
        if result.scalar_one_or_none():
            continue
            
        # Attempt to link PO
        po_num = doc.get("po_number")
        matched_po_id = None
        if po_num:
            po_result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.po_number == po_num))
            po = po_result.scalar_one_or_none()
            if po:
                matched_po_id = po.id

        inv = Invoice(
            invoice_number=inv_num,
            matched_po_id=matched_po_id,
            grand_total=doc.get("total"),
            status="extracted",
            source="docile_sroie",
            ocr_bounding_boxes=doc.get("ocr_bounding_boxes", []),
            line_items=doc.get("line_items", []),
            overall_confidence=0.92,
            extraction_method="docile_ground_truth"
        )
        db.add(inv)
        await db.flush() # get ID
        
        # Run three way matching
        await execute_three_way_match(db, inv.id)

    await db.commit()
    logger.info("Successfully ingested DocILE/SROIE invoices.")
