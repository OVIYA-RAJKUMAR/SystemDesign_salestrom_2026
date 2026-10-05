import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone
from typing import Optional
from app.models.domain_models import Payment

class PaymentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_idempotency_key(self, idempotency_key: str) -> Optional[Payment]:
        result = await self.db.execute(
            select(Payment).where(Payment.idempotency_key == idempotency_key)
        )
        return result.scalars().first()

    async def get_by_id(self, payment_id: str) -> Optional[Payment]:
        result = await self.db.execute(
            select(Payment).where(Payment.payment_id == payment_id)
        )
        return result.scalars().first()

    async def create(self, reservation_id: str, amount: float, idempotency_key: str, provider: str = "STRIPE_SIMULATOR", currency: str = "INR") -> Payment:
        tx_ref = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        payment = Payment(
            reservation_id=reservation_id,
            amount=amount,
            currency=currency,
            status="INITIATED",
            provider=provider,
            transaction_reference=tx_ref,
            idempotency_key=idempotency_key
        )
        self.db.add(payment)
        await self.db.flush()
        return payment

    async def update_status(self, payment_id: str, new_status: str, order_id: Optional[str] = None) -> bool:
        values = {"status": new_status, "updated_at": datetime.now(timezone.utc)}
        if order_id:
            values["order_id"] = order_id
        stmt = (
            update(Payment)
            .where(Payment.payment_id == payment_id)
            .values(**values)
        )
        result = await self.db.execute(stmt)
        return result.rowcount == 1
