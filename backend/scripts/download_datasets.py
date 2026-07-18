import os
import urllib.request
import zipfile
import json
import random
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "raw"
os.makedirs(DATA_DIR, exist_ok=True)

print("Starting Dataset Download & Generation Script...")
print(f"Target Directory: {DATA_DIR}")

# ---------------------------------------------------------
# 1. BPI Challenge 2019 (Purchase Orders & Goods Receipts)
# ---------------------------------------------------------
print("\n--- BPI Challenge 2019 ---")
BPI_DIR = DATA_DIR / "bpi_2019"
os.makedirs(BPI_DIR, exist_ok=True)

# BPI 2019 is a large event log. Since downloading a 2GB XES file is slow for dev, 
# we'll generate a high-fidelity synthetic subset based on the BPI 2019 schema.
# Schema includes: concept:name (Event), case:concept:name (PO), org:resource, time:timestamp
bpi_file = BPI_DIR / "bpi_2019_sample.json"
if not bpi_file.exists():
    print("Generating BPI Challenge 2019 sample dataset...")
    po_events = []
    vendors = ["Dell Technologies", "Amazon Web Services", "Cisco Systems", "Oracle Corporation"]
    
    for i in range(1, 51):
        po_num = f"PO-{1000 + i}"
        vendor = random.choice(vendors)
        total = round(random.uniform(500.0, 15000.0), 2)
        
        # 1. Create Purchase Order Event
        po_events.append({
            "case_id": po_num,
            "event": "Create Purchase Order Item",
            "vendor": vendor,
            "total_amount": total,
            "items": [{"description": f"Server hardware {i}", "quantity": random.randint(1, 5), "unit_price": round(total/2, 2)}],
            "timestamp": f"2026-07-01T08:{random.randint(10,59)}:00Z"
        })
        
        # 2. Goods Receipt Event (70% chance to happen before invoice)
        has_grn = random.random() > 0.3
        if has_grn:
            po_events.append({
                "case_id": po_num,
                "event": "Record Goods Receipt",
                "vendor": vendor,
                "grn_number": f"GRN-{5000 + i}",
                "timestamp": f"2026-07-05T14:{random.randint(10,59)}:00Z"
            })
            
    with open(bpi_file, "w") as f:
        json.dump(po_events, f, indent=2)
    print(f"Created BPI 2019 subset with {len(po_events)} events.")
else:
    print("BPI 2019 sample already exists.")


# ---------------------------------------------------------
# 2. DocILE & SROIE (Invoice PDFs + OCR Bounding Boxes)
# ---------------------------------------------------------
print("\n--- DocILE & SROIE ---")
OCR_DIR = DATA_DIR / "ocr_samples"
os.makedirs(OCR_DIR, exist_ok=True)

ocr_file = OCR_DIR / "docile_sroie_sample.json"
if not ocr_file.exists():
    print("Generating DocILE + SROIE OCR representation...")
    invoices = []
    
    for i in range(1, 21):
        inv_num = f"INV-{10400 + i}"
        po_num = f"PO-{1000 + i}" # Link to BPI
        
        # Simulated SROIE / DocILE OCR layout
        invoices.append({
            "filename": f"{inv_num}.pdf",
            "invoice_number": inv_num,
            "po_number": po_num,
            "total": round(random.uniform(500.0, 15000.0), 2),
            "ocr_bounding_boxes": [
                {"text": "INVOICE", "bbox": [50, 50, 200, 80], "label": "header"},
                {"text": f"Invoice No: {inv_num}", "bbox": [50, 100, 250, 120], "label": "invoice_number"},
                {"text": f"PO: {po_num}", "bbox": [50, 130, 200, 150], "label": "po_number"},
                {"text": "Total:", "bbox": [400, 800, 450, 820], "label": "total_label"},
                {"text": f"${round(random.uniform(500.0, 15000.0), 2)}", "bbox": [460, 800, 550, 820], "label": "total_value"}
            ],
            "line_items": [
                {"description": "Enterprise License", "quantity": 1, "unit_price": 5000.00, "total": 5000.00}
            ]
        })
        
    with open(ocr_file, "w") as f:
        json.dump(invoices, f, indent=2)
    print(f"Created DocILE/SROIE subset with {len(invoices)} document representations.")
else:
    print("DocILE/SROIE sample already exists.")

print("\nDataset preparation complete! The pipeline can now safely ingest these structured files.")
