from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone
from typing import Optional, List
from app.models.domain_models import InventoryReservation

class ReservationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_idempotency_key(self, idempotency_key: str) -> Optional[InventoryReservation]:
        result = await self.db.execute(
            select(InventoryReservation).where(InventoryReservation.idempotency_key == idempotency_key)
        )
        return result.scalars().first()

    async def get_by_id(self, reservation_id: str) -> Optional[InventoryReservation]:
        result = await self.db.execute(
            select(InventoryReservation).where(InventoryReservation.reservation_id == reservation_id)
        )
        return result.scalars().first()

    async def create(self, customer_id: str, product_id: str, quantity: int, idempotency_key: str, expires_at: datetime) -> InventoryReservation:
        reservation = InventoryReservation(
            customer_id=customer_id,
            product_id=product_id,
            quantity=quantity,
            status="RESERVED",
            idempotency_key=idempotency_key,
            expires_at=expires_at
        )
        self.db.add(reservation)
        await self.db.flush()
        return reservation

    async def update_status(self, reservation_id: str, new_status: str) -> bool:
        stmt = (
            update(InventoryReservation)
            .where(InventoryReservation.reservation_id == reservation_id)
            .values(status=new_status, updated_at=datetime.now(timezone.utc))
        )
        result = await self.db.execute(stmt)
        return result.rowcount == 1

    async def get_expired(self) -> List[InventoryReservation]:
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(InventoryReservation)
            .where(InventoryReservation.status == "RESERVED")
            .where(InventoryReservation.expires_at <= now)
        )
        return list(result.scalars().all())
