import asyncio
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.payment_repository import PaymentRepository
from app.repositories.reservation_repository import ReservationRepository
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.outbox_repository import OutboxRepository
from app.domain.circuit_breaker import global_payment_circuit_breaker, CircuitBreakerOpenException
from app.domain.failure_simulator import global_failure_simulator
from app.domain.message_broker import global_broker, Event

class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.payment_repo = PaymentRepository(db)
        self.reservation_repo = ReservationRepository(db)
        self.inventory_repo = InventoryRepository(db)
        self.outbox_repo = OutboxRepository(db)

    async def process_payment(self, reservation_id: str, amount: float, idempotency_key: str):
        # 1. Idempotency Check
        existing = await self.payment_repo.get_by_idempotency_key(idempotency_key)
        if existing:
            return {
                "payment_id": existing.payment_id,
                "order_id": existing.order_id,
                "reservation_id": existing.reservation_id,
                "amount": existing.amount,
                "currency": existing.currency,
                "status": existing.status,
                "provider": existing.provider,
                "transaction_reference": existing.transaction_reference,
                "idempotency_key": existing.idempotency_key,
                "created_at": existing.created_at,
                "is_duplicate": True
            }

        # 2. Reservation Validation
        reservation = await self.reservation_repo.get_by_id(reservation_id)
        if not reservation or reservation.status not in ["RESERVED", "PAYMENT_PENDING"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error_code": "INVALID_RESERVATION", "message": "Reservation not found or no longer active"}
            )

        # 3. Create initial payment record
        payment = await self.payment_repo.create(
            reservation_id=reservation_id,
            amount=amount,
            idempotency_key=idempotency_key
        )

        # 4. Check Circuit Breaker
        if not global_payment_circuit_breaker.can_execute():
            await self.payment_repo.update_status(payment.payment_id, "FAILED")
            await self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"error_code": "CIRCUIT_BREAKER_OPEN", "message": "Payment Gateway Circuit Breaker is OPEN"}
            )

        # 5. Check Failure Simulations
        if global_failure_simulator.is_failed("payment_gateway_failure"):
            global_payment_circuit_breaker.record_failure()
            await self.payment_repo.update_status(payment.payment_id, "FAILED")
            # Release stock back to available
            await self.inventory_repo.release_reservation(reservation.product_id, reservation.quantity)
            await self.reservation_repo.update_status(reservation_id, "RELEASED")
            await self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail={"error_code": "PAYMENT_GATEWAY_FAILURE", "message": "External Payment Gateway failed (Simulated)"}
            )

        if global_failure_simulator.is_failed("payment_timeout"):
            await self.payment_repo.update_status(payment.payment_id, "TIMEOUT")
            await self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail={"error_code": "PAYMENT_TIMEOUT", "message": "Payment Gateway timed out. Reconciling..."}
            )

        # 6. Payment Success Processing
        global_payment_circuit_breaker.record_success()
        await self.payment_repo.update_status(payment.payment_id, "SUCCESS")
        await self.reservation_repo.update_status(reservation_id, "CONFIRMED")
        await self.inventory_repo.confirm_sale(reservation.product_id, reservation.quantity)

        payload = {
            "payment_id": payment.payment_id,
            "reservation_id": reservation_id,
            "customer_id": reservation.customer_id,
            "amount": amount,
            "product_id": reservation.product_id,
            "quantity": reservation.quantity,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        # Outbox & Broker publication
        await self.outbox_repo.create_event("PaymentSucceeded", payment.payment_id, payload)
        await self.db.commit()

        # Publish event for Order Service consumption
        await global_broker.publish("payment.events", Event("PaymentSucceeded", payment.payment_id, payload))

        return {
            "payment_id": payment.payment_id,
            "order_id": payment.order_id,
            "reservation_id": payment.reservation_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "status": "SUCCESS",
            "provider": payment.provider,
            "transaction_reference": payment.transaction_reference,
            "idempotency_key": payment.idempotency_key,
            "created_at": payment.created_at,
            "is_duplicate": False
        }
