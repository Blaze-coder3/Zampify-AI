from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/system")
async def get_system_graph(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "kpis": {
            "status": {"value": "Healthy", "subtext": "", "is_healthy": True},
            "services": {"total": 0, "healthy": 0, "degraded": 0, "down": 0},
            "response_time": {"value": 0, "unit": "ms", "trend": 0.0, "up": False},
            "throughput": {"value": 0, "unit": "req/s", "trend": 0.0, "up": True},
            "error_rate": {"value": 0.0, "unit": "%", "trend": 0.0, "up": False},
            "active_users": {"value": 0, "unit": "", "trend": 0.0, "up": True}
        },
        "resource_utilization": {
            "times": [],
            "cpu": [],
            "memory": [],
            "disk": [],
            "current": {
                "cpu": {"value": 0, "trend": 0.0},
                "memory": {"value": 0, "trend": 0.0},
                "disk": {"value": 0, "trend": 0.0}
            }
        },
        "top_services": [],
        "recent_alerts": [],
        "system_health_charts": {
            "times": [],
            "request_rate": {"data": [], "current": 0, "peak": 0, "average": 0},
            "error_rate": {"data": [], "current": 0, "peak": 0, "average": 0},
            "db_connections": {"data": [], "current": 0, "max": 0, "idle": 0}
        }
    }

@router.get("/logs")
async def get_logs_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "kpis": {
            "total_logs": {"value": "0", "trend": 0.0, "up": True, "sparkline": []},
            "error_logs": {"value": "0", "trend": 0.0, "up": True, "sparkline": []},
            "warn_logs": {"value": "0", "trend": 0.0, "up": False, "sparkline": []},
            "info_logs": {"value": "0", "trend": 0.0, "up": True, "sparkline": []},
            "critical_logs": {"value": "0", "trend": 0.0, "up": False}
        },
        "logs_over_time": [],
        "logs_by_service": [],
        "top_errors": [],
        "active_alerts": [],
        "logs_table": []
    }

@router.get("/policies")
async def get_policy_center(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "kpis": {
            "total_policies": {"value": 0, "subtext": ""},
            "active_policies": {"value": 0, "subtext": ""},
            "in_review": {"value": 0, "subtext": ""},
            "policy_violations": {"value": 0, "trend": 0.0, "up": False, "label": ""},
            "compliance_coverage": {"value": 0.0, "unit": "%", "trend": 0.0, "up": True, "label": ""},
            "exceptions_granted": {"value": 0, "trend": 0.0, "up": False, "label": ""},
        },
        "policy_list": [],
        "categories_donut": [],
        "status_donut": [],
        "recent_changes": [],
        "effectiveness": {
            "violations_prevented": {"value": 0, "trend": 0.0, "up": True},
            "false_positives": {"value": 0, "trend": 0.0, "up": False},
            "exceptions_granted": {"value": 0, "trend": 0.0, "up": False},
            "auto_approvals": {"value": 0, "trend": 0.0, "up": True},
        },
        "compliance_frameworks": [],
    }

@router.get("/users")
async def get_user_management(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "kpis": {
            "total_users": {"value": 0, "trend": 0.0, "up": True, "label": ""},
            "active_users": {"value": 0, "subtext": ""},
            "inactive_users": {"value": 0, "trend": 0.0, "up": False, "label": ""},
            "locked_users": {"value": 0, "trend": 0.0, "up": False, "label": ""},
            "new_users": {"value": 0, "trend": 0.0, "up": True, "label": ""},
            "mfa_enabled": {"value": 0.0, "unit": "%", "trend": 0.0, "up": True, "label": ""},
        },
        "user_list": [],
        "roles_donut": [],
        "departments_donut": [],
        "status_distribution": [],
        "recent_activities": [],
        "mfa_adoption": {
            "enabled": 0,
            "not_enabled": 0,
            "pct": 0.0,
        },
        "access_summary": [],
        "quick_actions": [],
    }
