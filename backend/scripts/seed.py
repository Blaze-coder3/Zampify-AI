"""
Database Seed Script — populates sample vendors and POs for demo.
Run once after starting the backend.

Usage: python seed.py
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import hash_password
from app.models import User, Vendor, PurchaseOrder


USERS = [
    {"email": "sarah@zampify.ai", "name": "Sarah Chen", "role": "ap_clerk", "password": "demo123"},
    {"email": "david@zampify.ai", "name": "David Kumar", "role": "ap_manager", "password": "demo123"},
    {"email": "admin@zampify.ai", "name": "Admin User", "role": "admin", "password": "demo123"},
]

VENDORS = [
    {"name": "Acme Corp", "tax_id": "12-3456789", "email": "billing@acmecorp.com", "status": "active"},
    {"name": "GlobalTech Solutions", "tax_id": "98-7654321", "email": "ar@globaltech.io", "status": "active"},
    {"name": "CloudServ Inc", "tax_id": "55-1234567", "email": "invoices@cloudserv.com", "status": "active"},
    {"name": "MegaSupply Ltd", "tax_id": "33-9876543", "email": "billing@megasupply.net", "status": "active"},
    {"name": "TechParts Inc", "tax_id": "77-4567890", "email": "finance@techparts.com", "status": "active"},
    {"name": "ShadyCo LLC", "tax_id": "11-0000001", "email": "invoices@shadyco.xyz", "status": "active"},
    {"name": "Office Depot Business", "tax_id": "44-2345678", "email": "billing@officedepot.com", "status": "active"},
    {"name": "AWS (Amazon Web Services)", "tax_id": "91-1542583", "email": "aws-billing@amazon.com", "status": "active"},
]

PURCHASE_ORDERS = [
    {
        "po_number": "PO-2024-0089",
        "vendor_name": "Acme Corp",
        "currency": "USD",
        "total_amount": 4750.00,
        "status": "open",
        "description": "Cloud Hosting + SSL Certificate for March 2024",
        "line_items": [
            {"description": "Cloud Hosting - March 2024", "quantity": 1, "unit_price": 4500.00, "total": 4500.00},
            {"description": "SSL Certificate Renewal", "quantity": 1, "unit_price": 250.00, "total": 250.00},
        ],
    },
    {
        "po_number": "PO-2024-0102",
        "vendor_name": "GlobalTech Solutions",
        "currency": "USD",
        "total_amount": 12300.00,
        "status": "open",
        "description": "Software development services Q1",
        "line_items": [
            {"description": "Software Development - 82 hours", "quantity": 82, "unit_price": 150.00, "total": 12300.00},
        ],
    },
    {
        "po_number": "PO-2024-0050",
        "vendor_name": "CloudServ Inc",
        "currency": "USD",
        "total_amount": 10000.00,
        "status": "open",
        "description": "Infrastructure services — split delivery",
        "line_items": [
            {"description": "Infrastructure Setup", "quantity": 1, "unit_price": 6000.00, "total": 6000.00},
            {"description": "Configuration & Deployment", "quantity": 1, "unit_price": 4000.00, "total": 4000.00},
        ],
    },
    {
        "po_number": "PO-2024-0075",
        "vendor_name": "MegaSupply Ltd",
        "currency": "USD",
        "total_amount": 8500.00,
        "status": "open",
        "description": "Office supplies and equipment",
        "line_items": [
            {"description": "Widget A", "quantity": 100, "unit_price": 50.00, "total": 5000.00},
            {"description": "Widget B", "quantity": 30, "unit_price": 100.00, "total": 3000.00},
            {"description": "Shipping", "quantity": 1, "unit_price": 500.00, "total": 500.00},
        ],
    },
    {
        "po_number": "PO-2024-0090",
        "vendor_name": "TechParts Inc",
        "currency": "USD",
        "total_amount": 5000.00,
        "status": "open",
        "description": "Hardware components",
        "line_items": [
            {"description": "Server Components Kit", "quantity": 5, "unit_price": 1000.00, "total": 5000.00},
        ],
    },
    {
        "po_number": "PO-2024-0099",
        "vendor_name": "ShadyCo LLC",
        "currency": "USD",
        "total_amount": 25000.00,
        "status": "open",
        "description": "Consulting services",
        "line_items": [
            {"description": "Consulting Services", "quantity": 100, "unit_price": 250.00, "total": 25000.00},
        ],
    },
]


async def seed():
    print("Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Seed users
        print("Seeding users...")
        for u in USERS:
            existing = await db.execute(
                __import__("sqlalchemy", fromlist=["select"]).select(User).where(User.email == u["email"])
            )
            if not existing.scalar_one_or_none():
                user = User(
                    email=u["email"],
                    name=u["name"],
                    role=u["role"],
                    password_hash=hash_password(u["password"]),
                )
                db.add(user)
        await db.commit()
        print(f"  [OK] {len(USERS)} users seeded")

        # Seed vendors
        print("Seeding vendors...")
        vendor_map = {}
        for v in VENDORS:
            from sqlalchemy import select as sa_select
            existing = await db.execute(sa_select(Vendor).where(Vendor.name == v["name"]))
            vendor_obj = existing.scalar_one_or_none()
            if not vendor_obj:
                vendor_obj = Vendor(**{k: val for k, val in v.items()})
                db.add(vendor_obj)
                await db.flush()
            vendor_map[v["name"]] = vendor_obj
        await db.commit()
        print(f"  [OK] {len(VENDORS)} vendors seeded")

        # Seed purchase orders
        print("Seeding purchase orders...")
        for po_data in PURCHASE_ORDERS:
            from sqlalchemy import select as sa_select
            existing = await db.execute(
                sa_select(PurchaseOrder).where(PurchaseOrder.po_number == po_data["po_number"])
            )
            if not existing.scalar_one_or_none():
                vendor_name = po_data.pop("vendor_name")
                vendor = vendor_map.get(vendor_name)
                po = PurchaseOrder(
                    vendor_id=vendor.id if vendor else None,
                    **po_data,
                )
                db.add(po)
        await db.commit()
        print(f"  [OK] {len(PURCHASE_ORDERS)} purchase orders seeded")

    print("\nDatabase seed complete!")
    print("Demo credentials:")
    print("  AP Clerk:   sarah@zampify.ai / demo123")
    print("  AP Manager: david@zampify.ai / demo123")
    print("  Admin:      admin@zampify.ai / demo123")


if __name__ == "__main__":
    asyncio.run(seed())
