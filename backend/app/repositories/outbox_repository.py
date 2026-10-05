import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.models.domain_models import OutboxEvent

class OutboxRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_event(self, event_type: str, aggregate_id: str, payload: Dict[str, Any]) -> OutboxEvent:
        event = OutboxEvent(
            event_type=event_type,
            aggregate_id=aggregate_id,
            payload=json.dumps(payload),
            status="PENDING",
            retry_count=0
        )
        self.db.add(event)
        await self.db.flush()
        return event

    async def get_pending_events(self, limit: int = 20) -> List[OutboxEvent]:
        result = await self.db.execute(
            select(OutboxEvent)
            .where(OutboxEvent.status == "PENDING")
            .order_by(OutboxEvent.created_at.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def mark_processed(self, event_id: str) -> bool:
        stmt = (
            update(OutboxEvent)
            .where(OutboxEvent.event_id == event_id)
            .values(status="PROCESSED", processed_at=datetime.now(timezone.utc))
        )
        result = await self.db.execute(stmt)
        return result.rowcount == 1

    async def mark_failed(self, event_id: str) -> bool:
        stmt = (
            update(OutboxEvent)
            .where(OutboxEvent.event_id == event_id)
            .values(status="FAILED", retry_count=OutboxEvent.retry_count + 1)
        )
        result = await self.db.execute(stmt)
        return result.rowcount == 1
