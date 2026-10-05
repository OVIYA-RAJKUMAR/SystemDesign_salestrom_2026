from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone
from typing import Optional, List
from app.models.domain_models import Order

class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_reservation_id(self, reservation_id: str) -> Optional[Order]:
        result = await self.db.execute(
            select(Order).where(Order.reservation_id == reservation_id)
        )
        return result.scalars().first()

    async def get_by_id(self, order_id: str) -> Optional[Order]:
        result = await self.db.execute(
            select(Order).where(Order.order_id == order_id)
        )
        return result.scalars().first()

    async def create(self, customer_id: str, reservation_id: str, payment_id: str, total_amount: float) -> Order:
        order = Order(
            customer_id=customer_id,
            reservation_id=reservation_id,
            payment_id=payment_id,
            status="CONFIRMED",
            total_amount=total_amount
        )
        self.db.add(order)
        await self.db.flush()
        return order

    async def get_all(self, limit: int = 50) -> List[Order]:
        result = await self.db.execute(
            select(Order).order_by(Order.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())
