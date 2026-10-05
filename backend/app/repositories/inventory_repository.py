from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone
from app.models.domain_models import Inventory, Product
import logging

logger = logging.getLogger(__name__)

class InventoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_product_id(self, product_id: str) -> Inventory:
        result = await self.db.execute(select(Inventory).where(Inventory.product_id == product_id))
        return result.scalars().first()

    async def reserve_atomic(self, product_id: str, quantity: int) -> bool:
        """
        ATOMIC CONDITIONAL UPDATE (PRIMARY CONCURRENCY STRATEGY)
        Guarantees zero overselling at the database engine boundary.
        Executes atomically: available >= quantity must hold.
        Returns True if 1 row was updated, False otherwise.
        """
        stmt = (
            update(Inventory)
            .where(Inventory.product_id == product_id)
            .where(Inventory.available_quantity >= quantity)
            .values(
                available_quantity=Inventory.available_quantity - quantity,
                reserved_quantity=Inventory.reserved_quantity + quantity,
                version=Inventory.version + 1,
                updated_at=datetime.now(timezone.utc)
            )
        )
        result = await self.db.execute(stmt)
        return result.rowcount == 1

    async def reserve_optimistic(self, product_id: str, quantity: int) -> bool:
        """
        OPTIMISTIC LOCKING STRATEGY (APPROACH A)
        Reads current version, attempts update matching product_id & version.
        Fails under high contention if version changed in between.
        """
        inv = await self.get_by_product_id(product_id)
        if not inv or inv.available_quantity < quantity:
            return False

        current_version = inv.version
        stmt = (
            update(Inventory)
            .where(Inventory.product_id == product_id)
            .where(Inventory.version == current_version)
            .where(Inventory.available_quantity >= quantity)
            .values(
                available_quantity=Inventory.available_quantity - quantity,
                reserved_quantity=Inventory.reserved_quantity + quantity,
                version=Inventory.version + 1,
                updated_at=datetime.now(timezone.utc)
            )
        )
        result = await self.db.execute(stmt)
        return result.rowcount == 1

    async def release_reservation(self, product_id: str, quantity: int) -> bool:
        """Releases reserved stock back to available stock upon expiry or payment failure."""
        stmt = (
            update(Inventory)
            .where(Inventory.product_id == product_id)
            .where(Inventory.reserved_quantity >= quantity)
            .values(
                available_quantity=Inventory.available_quantity + quantity,
                reserved_quantity=Inventory.reserved_quantity - quantity,
                version=Inventory.version + 1,
                updated_at=datetime.now(timezone.utc)
            )
        )
        result = await self.db.execute(stmt)
        return result.rowcount == 1

    async def confirm_sale(self, product_id: str, quantity: int) -> bool:
        """Converts reserved stock to sold stock upon confirmed payment."""
        stmt = (
            update(Inventory)
            .where(Inventory.product_id == product_id)
            .where(Inventory.reserved_quantity >= quantity)
            .values(
                reserved_quantity=Inventory.reserved_quantity - quantity,
                sold_quantity=Inventory.sold_quantity + quantity,
                version=Inventory.version + 1,
                updated_at=datetime.now(timezone.utc)
            )
        )
        result = await self.db.execute(stmt)
        return result.rowcount == 1
