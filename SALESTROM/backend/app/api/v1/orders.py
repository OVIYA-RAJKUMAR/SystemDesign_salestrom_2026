from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.order_repository import OrderRepository

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=list)
async def list_orders(db: AsyncSession = Depends(get_db)):
    repo = OrderRepository(db)
    orders = await repo.get_all()
    return orders

@router.get("/{order_id}")
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    repo = OrderRepository(db)
    order = await repo.get_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
