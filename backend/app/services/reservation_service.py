from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.reservation_repository import ReservationRepository
from app.repositories.outbox_repository import OutboxRepository
from app.domain.failure_simulator import global_failure_simulator
from app.domain.message_broker import global_broker, Event
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class ReservationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.inventory_repo = InventoryRepository(db)
        self.reservation_repo = ReservationRepository(db)
        self.outbox_repo = OutboxRepository(db)

    async def reserve_stock(
        self,
        customer_id: str,
        product_id: str,
        quantity: int,
        idempotency_key: str,
        strategy: str = "ATOMIC_UPDATE"
    ):
        # 1. Database failure simulation check
        if global_failure_simulator.is_failed("database_failure"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error_code": "DATABASE_FAILURE", "message": "Database connection failed (Simulated)"}
            )

        # 2. Check Idempotency Key
        existing = await self.reservation_repo.get_by_idempotency_key(idempotency_key)
        if existing:
            return {
                "reservation_id": existing.reservation_id,
                "customer_id": existing.customer_id,
                "product_id": existing.product_id,
                "quantity": existing.quantity,
                "status": existing.status,
                "idempotency_key": existing.idempotency_key,
                "expires_at": existing.expires_at,
                "created_at": existing.created_at,
                "is_duplicate": True
            }

        # 3. Perform Concurrency-Safe Reservation Strategy
        if strategy == "OPTIMISTIC_LOCKING":
            success = await self.inventory_repo.reserve_optimistic(product_id, quantity)
        else: # ATOMIC_UPDATE (Primary strategy)
            success = await self.inventory_repo.reserve_atomic(product_id, quantity)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error_code": "OUT_OF_STOCK",
                    "message": "Product is out of stock or requested quantity unavailable"
                }
            )

        # 4. Create Reservation Record inside the same database transaction boundary
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.RESERVATION_EXPIRY_SECONDS)
        reservation = await self.reservation_repo.create(
            customer_id=customer_id,
            product_id=product_id,
            quantity=quantity,
            idempotency_key=idempotency_key,
            expires_at=expires_at
        )

        # 5. Outbox Event & Broker Notification
        payload = {
            "reservation_id": reservation.reservation_id,
            "customer_id": customer_id,
            "product_id": product_id,
            "quantity": quantity,
            "idempotency_key": idempotency_key,
            "expires_at": expires_at.isoformat()
        }
        await self.outbox_repo.create_event("INVENTORY_RESERVED", reservation.reservation_id, payload)
        await self.db.commit()

        # Publish event to async broker
        await global_broker.publish("inventory.events", Event("INVENTORY_RESERVED", reservation.reservation_id, payload))

        return {
            "reservation_id": reservation.reservation_id,
            "customer_id": reservation.customer_id,
            "product_id": reservation.product_id,
            "quantity": reservation.quantity,
            "status": reservation.status,
            "idempotency_key": reservation.idempotency_key,
            "expires_at": reservation.expires_at,
            "created_at": reservation.created_at,
            "is_duplicate": False
        }
