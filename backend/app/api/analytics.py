from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    status_counts = {"needs_review": 0, "due_today": 0, "overdue": 0, "escalated": 0, "completed": 0, "classifying": 0, "extracting": 0, "failed": 0}
    risk_distribution = {"high": 0, "medium": 0, "low": 0}
    
    return {
        "status_distribution": status_counts,
        "risk_distribution": risk_distribution,
        "top_vendors": [],
        "sla_compliance": []
    }

@router.get("/archive-summary")
async def get_archive_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "kpis": {
            "total_invoices": 0,
            "archived": 0,
            "exceptions": 0,
            "total_spend": 0.0,
            "vendors_count": 0
        },
        "status_distribution": {"approved": 0, "needs_review": 0, "escalated": 0, "overdue": 0, "closed": 0},
        "recent_searches": []
    }

@router.get("/overview")
async def get_overview_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    kpis = {
        "total_invoices": {"value": 0, "trend": 0.0, "up": True},
        "processed": {"value": 0, "trend": 0.0, "up": True},
        "auto_approved": {"value": 0, "pct": 0.0, "trend": 0.0, "up": True},
        "needs_review": {"value": 0, "pct": 0.0, "trend": 0.0, "up": False},
        "overdue": {"value": 0, "pct": 0.0, "trend": 0.0, "up": True},
        "total_spend": {"value": 0, "trend": 0.0, "up": True}
    }
    
    sparklines = {
        "avg_processing_time": {"value": 0.0, "unit": "hrs", "trend": 0.0},
        "sla_compliance": {"value": 0, "unit": "%", "trend": 0.0},
        "first_time_str": {"value": 0, "unit": "%", "trend": 0.0},
        "cost_savings": {"value": 0, "unit": "$", "trend": 0.0},
        "exceptions_rate": {"value": 0.0, "unit": "%", "trend": 0.0},
        "duplicate_invoices": {"value": 0, "unit": "", "trend": 0.0},
    }

    return {
        "kpis": kpis,
        "processing_trends": [],
        "status_distribution": {},
        "aging_summary": [],
        "sparklines": sparklines,
        "top_vendors": [],
        "team_performance": [],
        "recent_alerts": []
    }

@router.get("/bottlenecks")
async def get_bottlenecks_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    kpis = {
        "avg_cycle_time": {"value": 0.0, "unit": "days", "trend": 0.0, "up": False},
        "max_cycle_time": {"value": 0.0, "unit": "days", "trend": 0.0, "up": False},
        "pct_in_bottleneck": {"value": 0.0, "unit": "%", "trend": 0.0, "up": False},
        "bottleneck_invoices": {"value": 0, "unit": "", "trend": 0.0, "up": False},
        "on_time_completion": {"value": 0.0, "unit": "%", "trend": 0.0, "up": True},
        "sla_breaches": {"value": 0, "unit": "", "trend": 0.0, "up": False}
    }

    return {
        "kpis": kpis,
        "heatmap": [],
        "top_bottlenecks": [],
        "department_bottlenecks": [],
        "vendor_bottlenecks": [],
        "trend_over_time": []
    }

@router.get("/financial")
async def get_financial_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    kpis = {
        "total_spend": {"value": 0.0, "unit": "M", "trend": 0.0, "up": True},
        "processed": {"value": 0, "unit": "", "trend": 0.0, "up": True},
        "payments_made": {"value": 0.0, "unit": "M", "trend": 0.0, "up": True},
        "amount_pending": {"value": 0.0, "unit": "M", "trend": 0.0, "up": False},
        "overdue_amount": {"value": 0, "unit": "K", "trend": 0.0, "up": True},
        "discounts_captured": {"value": 0.0, "unit": "K", "trend": 0.0, "up": True}
    }
    
    cash_flow = {
        "opening_balance": {"amount": 0, "trend": 0.0},
        "cash_inflow": {"amount": 0, "trend": 0.0},
        "cash_outflow": {"amount": 0, "trend": 0.0},
        "closing_balance": {"amount": 0, "trend": 0.0},
        "net_cash_flow": {"amount": 0, "trend": 0.0}
    }

    budget = {
        "utilized_pct": 0,
        "spent": 0.0,
        "total_budget": 0.0
    }

    return {
        "kpis": kpis,
        "spend_trend": [],
        "spend_by_category": [],
        "spend_by_payment_terms": [],
        "top_vendors": [],
        "aging_payables": [],
        "cash_flow": cash_flow,
        "budget": budget,
        "monthly_spend": [],
        "upcoming_payments": []
    }
