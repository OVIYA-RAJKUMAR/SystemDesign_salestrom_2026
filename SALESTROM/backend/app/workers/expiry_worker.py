import asyncio
import logging
from app.core.database import AsyncSessionLocal
from app.repositories.reservation_repository import ReservationRepository
from app.repositories.inventory_repository import InventoryRepository

logger = logging.getLogger(__name__)

async def run_reservation_expiry_worker():
    """Background worker task that periodically checks for expired reservations and releases stock."""
    while True:
        try:
            async with AsyncSessionLocal() as db:
                res_repo = ReservationRepository(db)
                inv_repo = InventoryRepository(db)

                expired_reservations = await res_repo.get_expired()
                for reservation in expired_reservations:
                    logger.info(f"[ExpiryWorker] Expiring reservation {reservation.reservation_id}")
                    await res_repo.update_status(reservation.reservation_id, "EXPIRED")
                    await inv_repo.release_reservation(reservation.product_id, reservation.quantity)
                
                if expired_reservations:
                    await db.commit()

        except Exception as e:
            logger.error(f"[ExpiryWorker] Error during expiration loop: {e}")

        await asyncio.sleep(5.0)
