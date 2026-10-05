from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.domain_schemas import PaymentCreateSchema, PaymentResponseSchema
from app.services.payment_service import PaymentService
from app.repositories.payment_repository import PaymentRepository
from typing import Optional

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("", response_model=PaymentResponseSchema, status_code=status.HTTP_201_CREATED)
async def process_payment(
    req: PaymentCreateSchema,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    db: AsyncSession = Depends(get_db)
):
    key = idempotency_key or req.idempotency_key
    if not key:
        raise HTTPException(status_code=400, detail="Idempotency-Key is required for payment safety")

    service = PaymentService(db)
    result = await service.process_payment(
        reservation_id=req.reservation_id,
        amount=req.amount,
        idempotency_key=key
    )
    return result

@router.get("/{payment_id}")
async def get_payment(payment_id: str, db: AsyncSession = Depends(get_db)):
    repo = PaymentRepository(db)
    payment = await repo.get_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    return payment
