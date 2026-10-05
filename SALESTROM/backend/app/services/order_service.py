from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.order_repository import OrderRepository
from app.repositories.payment_repository import PaymentRepository
from app.repositories.outbox_repository import OutboxRepository
from app.domain.failure_simulator import global_failure_simulator
from app.domain.message_broker import global_broker, Event
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.payment_repo = PaymentRepository(db)
        self.outbox_repo = OutboxRepository(db)

    async def create_order_from_event(self, payload: Dict[str, Any]):
        """Consumes PaymentSucceeded event and creates Order asynchronously."""
        if global_failure_simulator.is_failed("order_service_down"):
            logger.warning("[OrderService] Simulated Order Service failure. Event deferred in Outbox/Broker queue.")
            raise RuntimeError("Order Service is currently unavailable (Simulated)")

        reservation_id = payload["reservation_id"]
        payment_id = payload["payment_id"]
        customer_id = payload["customer_id"]
        amount = payload["amount"]

        # Check existing order for idempotency
        existing = await self.order_repo.get_by_reservation_id(reservation_id)
        if existing:
            return existing

        order = await self.order_repo.create(
            customer_id=customer_id,
            reservation_id=reservation_id,
            payment_id=payment_id,
            total_amount=amount
        )

        # Update payment record with order_id
        await self.payment_repo.update_status(payment_id, "SUCCESS", order_id=order.order_id)
        
        await self.outbox_repo.create_event("ORDER_CREATED", order.order_id, {
            "order_id": order.order_id,
            "customer_id": customer_id,
            "payment_id": payment_id
        })
        
        await self.db.commit()

        await global_broker.publish("order.events", Event("ORDER_CREATED", order.order_id, {
            "order_id": order.order_id,
            "customer_id": customer_id,
            "payment_id": payment_id
        }))

        return order
