from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.domain_schemas import ReservationCreateSchema, ReservationResponseSchema
from app.services.reservation_service import ReservationService
from typing import Optional

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.post("", response_model=ReservationResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    req: ReservationCreateSchema,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    db: AsyncSession = Depends(get_db)
):
    key = idempotency_key or req.idempotency_key
    if not key:
        raise HTTPException(status_code=400, detail="Idempotency-Key header or field is required")

    service = ReservationService(db)
    result = await service.reserve_stock(
        customer_id=req.customer_id,
        product_id=req.product_id,
        quantity=req.quantity,
        idempotency_key=key
    )
    return result

@router.post("/{reservation_id}/release")
async def release_reservation(
    reservation_id: str,
    db: AsyncSession = Depends(get_db)
):
    from app.repositories.reservation_repository import ReservationRepository
    from app.repositories.inventory_repository import InventoryRepository

    res_repo = ReservationRepository(db)
    inv_repo = InventoryRepository(db)

    res = await res_repo.get_by_id(reservation_id)
    if not res or res.status != "RESERVED":
        raise HTTPException(status_code=400, detail="Reservation not active or not found")

    await res_repo.update_status(reservation_id, "RELEASED")
    await inv_repo.release_reservation(res.product_id, res.quantity)
    await db.commit()
    return {"message": f"Reservation {reservation_id} manually released stock."}
