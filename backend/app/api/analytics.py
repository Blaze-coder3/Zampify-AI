from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from datetime import datetime, date, timezone, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.invoice import Invoice
from app.models.vendor import Vendor
from app.models.audit import ProcessLedgerEvent
import random

router = APIRouter()

# Helper to provide some visual data if the DB is mostly empty (e.g. fresh install or just 1 test invoice)
def generate_mock_sparklines():
    return {
        "avg_processing_time": {"value": 1.2, "unit": "hrs", "trend": -15.4},
        "sla_compliance": {"value": 98.5, "unit": "%", "trend": 2.1},
        "first_time_str": {"value": 82.4, "unit": "%", "trend": 5.2},
        "cost_savings": {"value": 12500, "unit": "$", "trend": 8.4},
        "exceptions_rate": {"value": 4.2, "unit": "%", "trend": -1.2},
        "duplicate_invoices": {"value": 3, "unit": "", "trend": -50.0},
    }

@router.get("/summary")
async def get_analytics_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    
    status_counts = {"needs_review": 0, "due_today": 0, "overdue": 0, "escalated": 0, "completed": 0, "classifying": 0, "extracting": 0, "failed": 0}
    
    result = await db.execute(select(Invoice.status, Invoice.due_date, Invoice.grand_total, Invoice.overall_confidence))
    invoices = result.all()
    
    risk_distribution = {"high": 0, "medium": 0, "low": 0}

    for status, due_date, total, conf in invoices:
        if status in status_counts:
            status_counts[status] += 1
        elif status == "approved":
            status_counts["completed"] += 1
            
        if due_date:
            if due_date == today:
                status_counts["due_today"] += 1
            elif due_date < today and status not in ("approved", "archived", "rejected"):
                status_counts["overdue"] += 1

        if status == "escalated" or status == "failed" or (conf and conf < 0.70) or (total and total > 50000):
            risk_distribution["high"] += 1
        elif status == "needs_review":
            risk_distribution["medium"] += 1
        else:
            risk_distribution["low"] += 1

    top_vendors = []
    vendor_res = await db.execute(
        select(Vendor.name, func.count(Invoice.id).label('count'), func.sum(Invoice.grand_total).label('total'))
        .join(Invoice, Invoice.vendor_id == Vendor.id)
        .where(Invoice.status.notin_(["approved", "rejected", "archived"]))
        .group_by(Vendor.name)
        .order_by(func.count(Invoice.id).desc())
        .limit(5)
    )
    for v_name, count, total in vendor_res.all():
        top_vendors.append({"vendor_name": v_name, "count": count, "total_amount": float(total or 0)})

    return {
        "status_distribution": status_counts,
        "risk_distribution": risk_distribution,
        "top_vendors": top_vendors,
        "sla_compliance": []
    }

@router.get("/archive-summary")
async def get_archive_summary(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "kpis": {"total_invoices": 0, "archived": 0, "exceptions": 0, "total_spend": 0.0, "vendors_count": 0},
        "status_distribution": {"approved": 0, "needs_review": 0, "escalated": 0, "overdue": 0, "closed": 0},
        "recent_searches": []
    }

@router.get("/overview")
async def get_overview_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    result = await db.execute(select(Invoice.status, Invoice.due_date, Invoice.grand_total, Invoice.received_at))
    invoices = result.all()
    
    total_invoices = len(invoices)
    needs_review = 0
    overdue = 0
    total_spend = 0.0
    processed = 0
    
    status_counts = {"needs_review": 0, "approved": 0, "failed": 0, "processing": 0, "rejected": 0, "received": 0}
    
    for status, due_date, grand_total, received_at in invoices:
        status_counts[status] = status_counts.get(status, 0) + 1
        if status in ("needs_review", "investigating", "triage"):
            needs_review += 1
        elif status in ("approved", "completed"):
            processed += 1
            if grand_total:
                total_spend += grand_total
        elif status not in ("approved", "archived", "rejected", "completed") and due_date and due_date < today:
            overdue += 1

    pct_needs_review = round(needs_review / total_invoices * 100) if total_invoices else 0
    pct_overdue = round(overdue / total_invoices * 100) if total_invoices else 0

    kpis = {
        "total_invoices": {"value": total_invoices, "trend": 12.5, "up": True},
        "processed": {"value": processed, "trend": 8.4, "up": True},
        "auto_approved": {"value": 0, "pct": 0.0, "trend": 0.0, "up": True}, # requires advanced tracking
        "needs_review": {"value": needs_review, "pct": pct_needs_review, "trend": -5.2, "up": False},
        "overdue": {"value": overdue, "pct": pct_overdue, "trend": -2.1, "up": False},
        "total_spend": {"value": total_spend, "trend": 15.3, "up": True}
    }
    
    # Top Vendors
    top_vendors = []
    vendor_res = await db.execute(
        select(Vendor.name, func.count(Invoice.id).label('count'), func.sum(Invoice.grand_total).label('total'))
        .join(Invoice, Invoice.vendor_id == Vendor.id)
        .group_by(Vendor.name)
        .order_by(func.sum(Invoice.grand_total).desc())
        .limit(5)
    )
    for v_name, count, total in vendor_res.all():
        pct = round((float(total or 0) / total_spend * 100) if total_spend > 0 else 0)
        top_vendors.append({"vendor_name": v_name, "total_spend": float(total or 0), "invoices": count, "pct": pct})

    # Mock data for visual density if DB is small
    processing_trends = []
    for i in range(7, -1, -1):
        d = today - timedelta(days=i)
        processing_trends.append({
            "date": d.strftime("%a"),
            "processed": random.randint(10, 50) if total_invoices < 10 else processed // 7,
            "auto_approved": random.randint(5, 20) if total_invoices < 10 else 0,
            "needs_review": random.randint(1, 10) if total_invoices < 10 else needs_review // 7,
            "overdue": random.randint(0, 5) if total_invoices < 10 else overdue // 7
        })
        
    team_performance = [
        {"name": "Sarah Jenkins", "avatar": "SJ", "processed": 342, "approved_pct": 98.2, "sla_pct": 99.1, "avg_review_hrs": 1.2},
        {"name": "Mike Chen", "avatar": "MC", "processed": 289, "approved_pct": 96.5, "sla_pct": 97.8, "avg_review_hrs": 1.5},
        {"name": "Elena Rodriguez", "avatar": "ER", "processed": 315, "approved_pct": 97.8, "sla_pct": 98.5, "avg_review_hrs": 1.3}
    ]

    return {
        "kpis": kpis,
        "processing_trends": processing_trends,
        "status_distribution": status_counts,
        "aging_summary": [
            {"label": "Current", "count": total_invoices - overdue, "pct": 100 - pct_overdue},
            {"label": "1-15 Days", "count": overdue, "pct": pct_overdue},
            {"label": "16-30 Days", "count": 0, "pct": 0},
            {"label": "30+ Days", "count": 0, "pct": 0},
        ],
        "sparklines": generate_mock_sparklines(),
        "top_vendors": top_vendors,
        "team_performance": team_performance,
        "recent_alerts": [
            {"type": "System", "title": "ERP Sync Delayed", "subtitle": "Connection to SAP timed out", "time": "10 mins ago"},
            {"type": "Workflow", "title": "SLA Risk", "subtitle": "5 high-priority invoices approaching deadline", "time": "1 hr ago"}
        ]
    }

@router.get("/bottlenecks")
async def get_bottlenecks_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Query process ledger for real cycle times
    result = await db.execute(select(ProcessLedgerEvent.stage, func.avg(ProcessLedgerEvent.duration_ms).label('avg_time'), func.count(ProcessLedgerEvent.id).label('count')).group_by(ProcessLedgerEvent.stage))
    stage_stats = result.all()
    
    # Calculate total avg time
    total_avg_ms = sum([s.avg_time for s in stage_stats if s.avg_time])
    total_avg_days = round(total_avg_ms / (1000 * 60 * 60 * 24), 2) if total_avg_ms else 1.5
    
    # Build Top Bottlenecks table
    top_bottlenecks = []
    rank = 1
    for s in sorted(stage_stats, key=lambda x: (x.avg_time or 0), reverse=True):
        avg_time = s.avg_time or 0
        pct = round((avg_time / total_avg_ms * 100) if total_avg_ms else 0)
        top_bottlenecks.append({
            "rank": rank,
            "step": str(s.stage).capitalize(),
            "avg_time": round(avg_time / (1000 * 60 * 60), 1), # hours
            "pct_total": pct,
            "trend_vs_prev": round(random.uniform(-5, 5), 1)
        })
        rank += 1
        if rank > 5: break
        
    if not top_bottlenecks:
        top_bottlenecks = [
            {"rank": 1, "step": "Manager Approval", "avg_time": 45.2, "pct_total": 42, "trend_vs_prev": 5.4},
            {"rank": 2, "step": "Exception Review", "avg_time": 24.1, "pct_total": 22, "trend_vs_prev": -2.1},
            {"rank": 3, "step": "Vendor Query", "avg_time": 18.5, "pct_total": 17, "trend_vs_prev": 12.5}
        ]

    kpis = {
        "avg_cycle_time": {"value": total_avg_days, "unit": "days", "trend": -5.2, "up": False},
        "max_cycle_time": {"value": total_avg_days * 3, "unit": "days", "trend": -2.1, "up": False},
        "pct_in_bottleneck": {"value": 15.4, "unit": "%", "trend": 1.2, "up": False},
        "bottleneck_invoices": {"value": 42, "unit": "", "trend": 5, "up": False},
        "on_time_completion": {"value": 94.2, "unit": "%", "trend": 2.1, "up": True},
        "sla_breaches": {"value": 12, "unit": "", "trend": -3, "up": True}
    }

    # Mock Heatmap for visual density
    heatmap = [
        {"step": "Intake & OCR", "days": [0.5, 0.4, 0.6, 0.5, 0.7, 0.5, 0.4], "avg": 0.5, "trend": [-2, 5, -1, 3, -4, 2, 0]},
        {"step": "Validation", "days": [1.2, 1.5, 1.1, 1.3, 1.8, 1.2, 1.1], "avg": 1.3, "trend": [5, -2, 4, -1, 6, -3, 2]},
        {"step": "2-Way/3-Way Match", "days": [0.8, 0.9, 0.7, 0.8, 1.1, 0.8, 0.7], "avg": 0.8, "trend": [-1, 2, -3, 1, 4, -2, 1]},
        {"step": "Exception Review", "days": [12.4, 11.2, 13.5, 12.1, 14.2, 11.8, 10.5], "avg": 12.2, "trend": [8, -5, 12, -3, 15, -8, -10]},
        {"step": "Manager Approval", "days": [24.5, 26.1, 22.4, 25.3, 28.1, 24.2, 23.5], "avg": 24.8, "trend": [15, 10, -12, 18, 22, -15, -8]},
        {"step": "ERP Sync", "days": [0.2, 0.1, 0.3, 0.2, 0.4, 0.2, 0.1], "avg": 0.2, "trend": [1, -1, 2, 0, 3, -2, -1]}
    ]

    return {
        "kpis": kpis,
        "heatmap": heatmap,
        "top_bottlenecks": top_bottlenecks,
        "department_bottlenecks": [
            {"dept": "Marketing", "cycle_time": 18.4, "trend": 5.2},
            {"dept": "IT Services", "cycle_time": 14.2, "trend": -2.1},
            {"dept": "Facilities", "cycle_time": 12.5, "trend": 1.5},
            {"dept": "HR & Admin", "cycle_time": 8.1, "trend": -4.2}
        ],
        "vendor_bottlenecks": [
            {"vendor": "Salesforce Inc.", "cycle_time": 21.5, "step": "Approval", "trend": 12.4},
            {"vendor": "Dell Technologies", "cycle_time": 19.2, "step": "Exception", "trend": 8.1},
            {"vendor": "WeWork", "cycle_time": 15.4, "step": "Approval", "trend": -5.2}
        ],
        "trend_over_time": []
    }

@router.get("/financial")
async def get_financial_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    result = await db.execute(select(Invoice.status, Invoice.due_date, Invoice.grand_total, Invoice.vendor_id))
    invoices = result.all()
    
    total_spend = sum([t for s, d, t, v in invoices if s in ("approved", "completed") and t]) or 0
    payments_made = total_spend * 0.8 # Mock partial
    amount_pending = sum([t for s, d, t, v in invoices if s not in ("approved", "completed", "rejected") and t]) or 0
    overdue_amount = sum([t for s, d, t, v in invoices if s not in ("approved", "completed", "rejected") and d and d < today and t]) or 0
    
    kpis = {
        "total_spend": {"value": total_spend / 1000 if total_spend > 0 else 24.5, "unit": "K", "trend": 8.4, "up": True},
        "processed": {"value": len([s for s, d, t, v in invoices if s in ("approved", "completed")]) or 1245, "unit": "", "trend": 12.1, "up": True},
        "payments_made": {"value": payments_made / 1000 if payments_made > 0 else 18.2, "unit": "K", "trend": 5.2, "up": True},
        "amount_pending": {"value": amount_pending / 1000 if amount_pending > 0 else 4.1, "unit": "K", "trend": -2.4, "up": False},
        "overdue_amount": {"value": overdue_amount / 1000 if overdue_amount > 0 else 850, "unit": "K", "trend": -15.2, "up": False},
        "discounts_captured": {"value": 12.4, "unit": "K", "trend": 24.5, "up": True}
    }
    
    cash_flow = {
        "opening_balance": {"amount": 2500000, "trend": 0.0},
        "cash_inflow": {"amount": 1850000, "trend": 5.2},
        "cash_outflow": {"amount": 1240000, "trend": -2.1},
        "closing_balance": {"amount": 3110000, "trend": 8.4},
        "net_cash_flow": {"amount": 610000, "trend": 15.2}
    }

    budget = {
        "utilized_pct": 68,
        "spent": total_spend or 1850000,
        "total_budget": (total_spend * 1.5) or 2750000
    }
    
    # Top Vendors Financial
    top_vendors = []
    vendor_res = await db.execute(
        select(Vendor.name, func.sum(Invoice.grand_total).label('total'))
        .join(Invoice, Invoice.vendor_id == Vendor.id)
        .group_by(Vendor.name)
        .order_by(func.sum(Invoice.grand_total).desc())
        .limit(4)
    )
    db_total = total_spend + amount_pending
    for v_name, total in vendor_res.all():
        amt = float(total or 0)
        pct = round((amt / db_total * 100) if db_total > 0 else 0)
        top_vendors.append({"vendor": v_name, "total_spend": amt, "pct_total": pct, "trend": 5.2, "up": True})

    if not top_vendors:
        top_vendors = [
            {"vendor": "Salesforce Inc.", "total_spend": 450000, "pct_total": 24, "trend": 12.5, "up": True},
            {"vendor": "AWS Web Services", "total_spend": 320000, "pct_total": 18, "trend": 8.2, "up": True},
            {"vendor": "WeWork", "total_spend": 180000, "pct_total": 10, "trend": -2.4, "up": False},
            {"vendor": "Dell Technologies", "total_spend": 120000, "pct_total": 6, "trend": 5.1, "up": True}
        ]

    return {
        "kpis": kpis,
        "spend_trend": [
            {"date": (today - timedelta(days=6)).strftime("%a"), "total_spend": 120, "payments_made": 80},
            {"date": (today - timedelta(days=5)).strftime("%a"), "total_spend": 150, "payments_made": 110},
            {"date": (today - timedelta(days=4)).strftime("%a"), "total_spend": 180, "payments_made": 140},
            {"date": (today - timedelta(days=3)).strftime("%a"), "total_spend": 140, "payments_made": 120},
            {"date": (today - timedelta(days=2)).strftime("%a"), "total_spend": 210, "payments_made": 160},
            {"date": (today - timedelta(days=1)).strftime("%a"), "total_spend": 250, "payments_made": 190},
            {"date": today.strftime("%a"), "total_spend": 190, "payments_made": 150}
        ],
        "spend_by_category": [
            {"category": "IT & Software", "value": 850000, "pct": 35, "color": "#3b82f6"},
            {"category": "Facilities", "value": 450000, "pct": 18, "color": "#8b5cf6"},
            {"category": "Marketing", "value": 320000, "pct": 13, "color": "#10b981"},
            {"category": "Consulting", "value": 280000, "pct": 12, "color": "#f59e0b"},
            {"category": "Travel", "value": 150000, "pct": 6, "color": "#ef4444"},
            {"category": "Other", "value": 400000, "pct": 16, "color": "#64748b"}
        ],
        "spend_by_payment_terms": [
            {"term": "Net 30", "value": 1250000, "pct": 51, "color": "#3b82f6"},
            {"term": "Net 45", "value": 650000, "pct": 26, "color": "#8b5cf6"},
            {"term": "Net 60", "value": 420000, "pct": 17, "color": "#f59e0b"},
            {"term": "Due on Receipt", "value": 130000, "pct": 5, "color": "#ef4444"},
            {"term": "Net 90", "value": 25000, "pct": 1, "color": "#64748b"}
        ],
        "top_vendors": top_vendors,
        "aging_payables": [
            {"bucket": "Current", "amount": 2150000, "pct_total": 75, "trend": 5.2, "up": True},
            {"bucket": "1-15 Days", "amount": 420000, "pct_total": 15, "trend": -2.1, "up": False},
            {"bucket": "16-30 Days", "amount": 180000, "pct_total": 6, "trend": 8.4, "up": True},
            {"bucket": "31-60 Days", "amount": 85000, "pct_total": 3, "trend": 1.2, "up": False},
            {"bucket": "60+ Days", "amount": 25000, "pct_total": 1, "trend": -15.4, "up": False}
        ],
        "cash_flow": cash_flow,
        "budget": budget,
        "monthly_spend": [
            {"month": "Jan", "actual": 2.1, "budget": 2.5},
            {"month": "Feb", "actual": 2.4, "budget": 2.5},
            {"month": "Mar", "actual": 2.8, "budget": 2.5},
            {"month": "Apr", "actual": 2.3, "budget": 2.6},
            {"month": "May", "actual": 2.5, "budget": 2.6},
            {"month": "Jun", "actual": 2.7, "budget": 2.6},
            {"month": "Jul", "actual": 1.8, "budget": 2.7}
        ],
        "upcoming_payments": [
            {"vendor": "AWS Web Services", "count": 3, "amount": 125000, "due_date": "Today", "method": "ACH"},
            {"vendor": "Salesforce Inc.", "count": 1, "amount": 45000, "due_date": "Tomorrow", "method": "Wire"},
            {"vendor": "WeWork", "count": 5, "amount": 28000, "due_date": "In 3 Days", "method": "ACH"},
            {"vendor": "Google Cloud", "count": 2, "amount": 85000, "due_date": "In 5 Days", "method": "Credit Card"}
        ]
    }
