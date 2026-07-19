import asyncio
import pandas as pd
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models import User, Vendor, Product, PurchaseOrder, POLineItem, GoodsReceipt

DATASET_DIR = r"C:\Users\A Syed Khwaja\Downloads\Zampify_Dataset"

async def create_default_user(db):
    user_email = "priya@zampify.ai"
    result = await db.execute(select(User).filter(User.email == user_email))
    user = result.scalars().first()
    if not user:
        print(f"Creating default user: {user_email}")
        user = User(
            email=user_email,
            name="Sarah Jenkins",
            password_hash=hash_password("admin123"),
            role="admin",
            is_active=True
        )
        db.add(user)
        await db.commit()

async def load_vendors(db):
    df = pd.read_excel(f"{DATASET_DIR}\\vendors_v2.xlsx")
    vendors_added = 0
    for _, row in df.iterrows():
        vid = str(row['VendorID'])
        result = await db.execute(select(Vendor).filter(Vendor.id == vid))
        if not result.scalars().first():
            vendor = Vendor(
                id=vid,
                name=str(row['VendorName']),
                category=str(row['Category']) if pd.notna(row['Category']) else None,
                gstin=str(row['GSTIN']) if pd.notna(row['GSTIN']) else None,
                pan=str(row['PAN']) if pd.notna(row['PAN']) else None,
                city=str(row['City']) if pd.notna(row['City']) else None,
                state=str(row['State']) if pd.notna(row['State']) else None,
                currency=str(row['Currency']) if pd.notna(row['Currency']) else None,
                payment_terms=str(row['PaymentTerms']) if pd.notna(row['PaymentTerms']) else None,
                risk=str(row['Risk']) if pd.notna(row['Risk']) else None,
                blocked=str(row['Blocked']) if pd.notna(row['Blocked']) else None
            )
            db.add(vendor)
            vendors_added += 1
    await db.commit()
    print(f"Loaded {vendors_added} vendors.")
    return df['VendorID'].tolist()

async def load_products(db):
    df = pd.read_excel(f"{DATASET_DIR}\\products.xlsx")
    products_added = 0
    for _, row in df.iterrows():
        sku = str(row['SKU'])
        result = await db.execute(select(Product).filter(Product.sku == sku))
        if not result.scalars().first():
            product = Product(
                sku=sku,
                name=str(row['ProductName']),
                category=str(row['Category']) if pd.notna(row['Category']) else None,
                hsn=str(row['HSN']) if pd.notna(row['HSN']) else None,
                gst_percent=float(row['GST%']) if pd.notna(row['GST%']) else None,
                uom=str(row['UOM']) if pd.notna(row['UOM']) else None,
                unit_price=float(row['UnitPrice']) if pd.notna(row['UnitPrice']) else None
            )
            db.add(product)
            products_added += 1
    await db.commit()
    print(f"Loaded {products_added} products.")
    return df['SKU'].tolist()

async def load_purchase_orders(db, valid_vendors):
    df = pd.read_excel(f"{DATASET_DIR}\\purchase_orders.xlsx")
    pos_added = 0
    skipped = 0
    for _, row in df.iterrows():
        po_num = str(row['PONumber'])
        vid = str(row['VendorID'])
        if vid not in valid_vendors:
            print(f"Warning: PO {po_num} references unknown VendorID {vid}. Skipping.")
            skipped += 1
            continue
            
        result = await db.execute(select(PurchaseOrder).filter(PurchaseOrder.id == po_num))
        if not result.scalars().first():
            po = PurchaseOrder(
                id=po_num,
                po_number=po_num,
                vendor_id=vid,
                buyer=str(row['Buyer']) if pd.notna(row['Buyer']) else None,
                department=str(row['Department']) if pd.notna(row['Department']) else None,
                warehouse=str(row['Warehouse']) if pd.notna(row['Warehouse']) else None,
                po_date=row['PODate'] if pd.notna(row['PODate']) else None,
                delivery_date=row['DeliveryDate'] if pd.notna(row['DeliveryDate']) else None,
                currency=str(row['Currency']) if pd.notna(row['Currency']) else "USD",
                status=str(row['Status']) if pd.notna(row['Status']) else "open",
                tolerance_percent=float(row['TolerancePercent']) if pd.notna(row['TolerancePercent']) else 0.0,
                total_amount=float(row['TotalAmount']) if pd.notna(row['TotalAmount']) else 0.0
            )
            db.add(po)
            pos_added += 1
    await db.commit()
    print(f"Loaded {pos_added} purchase orders (Skipped {skipped}).")
    return df['PONumber'].tolist()

async def load_po_line_items(db, valid_pos, valid_skus):
    df = pd.read_excel(f"{DATASET_DIR}\\po_line_items.xlsx")
    items_added = 0
    skipped = 0
    for _, row in df.iterrows():
        po_num = str(row['PONumber'])
        sku = str(row['SKU'])
        if po_num not in valid_pos or sku not in valid_skus:
            print(f"Warning: Line item references unknown PO {po_num} or SKU {sku}. Skipping.")
            skipped += 1
            continue
            
        item = POLineItem(
            po_number=po_num,
            line_number=int(row['LineNumber']),
            sku=sku,
            product_name=str(row['ProductName']) if pd.notna(row['ProductName']) else None,
            quantity=float(row['Quantity']) if pd.notna(row['Quantity']) else 0,
            unit_price=float(row['UnitPrice']) if pd.notna(row['UnitPrice']) else 0,
            gst_percent=float(row['GST%']) if pd.notna(row['GST%']) else 0,
            discount=float(row['Discount']) if pd.notna(row['Discount']) else 0,
            line_total=float(row['LineTotal']) if pd.notna(row['LineTotal']) else 0
        )
        db.add(item)
        items_added += 1
    await db.commit()
    print(f"Loaded {items_added} PO line items (Skipped {skipped}).")

async def load_goods_receipts(db, valid_pos):
    df = pd.read_excel(f"{DATASET_DIR}\\goods_receipts.xlsx")
    grns_added = 0
    skipped = 0
    for _, row in df.iterrows():
        grn_num = str(row['GRNNumber'])
        po_num = str(row['PONumber'])
        if po_num not in valid_pos:
            print(f"Warning: GRN {grn_num} references unknown PO {po_num}. Skipping.")
            skipped += 1
            continue
            
        result = await db.execute(select(GoodsReceipt).filter(GoodsReceipt.id == grn_num))
        if not result.scalars().first():
            grn = GoodsReceipt(
                id=grn_num,
                gr_number=grn_num,
                po_number=po_num,
                line_number=int(row['LineNumber']) if pd.notna(row['LineNumber']) else None,
                received_qty=float(row['ReceivedQty']) if pd.notna(row['ReceivedQty']) else None,
                received_date=row['ReceivedDate'] if pd.notna(row['ReceivedDate']) else None,
                warehouse=str(row['Warehouse']) if pd.notna(row['Warehouse']) else None,
                status=str(row['Status']) if pd.notna(row['Status']) else "Received"
            )
            db.add(grn)
            grns_added += 1
    await db.commit()
    print(f"Loaded {grns_added} goods receipts (Skipped {skipped}).")

async def main():
    async with AsyncSessionLocal() as db:
        await create_default_user(db)
        
        valid_vendors = await load_vendors(db)
        valid_skus = await load_products(db)
        valid_pos = await load_purchase_orders(db, valid_vendors)
        
        await load_po_line_items(db, valid_pos, valid_skus)
        await load_goods_receipts(db, valid_pos)

if __name__ == "__main__":
    asyncio.run(main())
