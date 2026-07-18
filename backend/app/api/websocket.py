"""WebSocket endpoint for real-time invoice status updates."""

import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models import Invoice
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()

# Simple connection manager
class ConnectionManager:
    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, invoice_id: str):
        await ws.accept()
        if invoice_id not in self.active:
            self.active[invoice_id] = []
        self.active[invoice_id].append(ws)

    def disconnect(self, ws: WebSocket, invoice_id: str):
        if invoice_id in self.active:
            self.active[invoice_id].remove(ws)

    async def broadcast(self, invoice_id: str, message: dict):
        if invoice_id in self.active:
            for ws in self.active[invoice_id]:
                try:
                    await ws.send_text(json.dumps(message))
                except Exception:
                    pass


manager = ConnectionManager()


@router.websocket("/ws/invoices/{invoice_id}")
async def invoice_status_ws(websocket: WebSocket, invoice_id: str):
    """WebSocket that streams live processing updates for a specific invoice."""
    await manager.connect(websocket, invoice_id)
    logger.info("ws_connected", invoice_id=invoice_id)

    try:
        # Poll the invoice status every second and push updates
        last_status = None
        while True:
            async with AsyncSessionLocal() as db:
                result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
                invoice = result.scalar_one_or_none()

            if invoice and invoice.status != last_status:
                last_status = invoice.status
                await websocket.send_text(json.dumps({
                    "type": "status_update",
                    "invoice_id": invoice_id,
                    "status": invoice.status,
                    "decision": invoice.decision,
                    "confidence": invoice.overall_confidence,
                    "explanation": invoice.decision_explanation,
                }))

                # Terminal states — stop streaming
                if invoice.status in ("approved", "rejected", "failed", "archived"):
                    break

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        logger.info("ws_disconnected", invoice_id=invoice_id)
    finally:
        manager.disconnect(websocket, invoice_id)
