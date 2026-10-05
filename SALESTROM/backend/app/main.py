import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.models.domain_models import Product, Inventory
from app.domain.message_broker import global_broker
from app.domain.failure_simulator import global_failure_simulator
from app.workers.expiry_worker import run_reservation_expiry_worker
from app.middleware.rate_limiter import RateLimiterMiddleware

from app.api.v1.reservations import router as reservations_router
from app.api.v1.payments import router as payments_router
from app.api.v1.orders import router as orders_router
from app.api.v1.simulation import router as simulation_router
from app.api.v1.failure import router as failure_router
from app.api.v1.observability import router as observability_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("salestorm")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize Database Tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Seed Default Product X & Inventory if missing
    async with AsyncSessionLocal() as db:
        from app.repositories.inventory_repository import InventoryRepository
        inv_repo = InventoryRepository(db)
        existing_inv = await inv_repo.get_by_product_id("SALESTORM-X-DEFAULT")
        if not existing_inv:
            product = Product(
                product_id="SALESTORM-X-DEFAULT",
                name="SALESTORM X — Limited Edition",
                sku="SALESTORM-X-2026",
                price=49999.0,
                stock_initial=settings.DEFAULT_STOCK
            )
            db.add(product)
            inventory = Inventory(
                product_id="SALESTORM-X-DEFAULT",
                available_quantity=settings.DEFAULT_STOCK,
                reserved_quantity=0,
                sold_quantity=0,
                version=1
            )
            db.add(inventory)
            await db.commit()
            logger.info("Initialized default product SALESTORM X with stock=100")

    # 3. Start Background Async Workers
    broker_task = asyncio.create_task(global_broker.process_messages(global_failure_simulator))
    expiry_task = asyncio.create_task(run_reservation_expiry_worker())
    logger.info("Started Background Event Broker Worker and Expiry Worker")

    yield

    # Cleanup
    global_broker.is_running = False
    broker_task.cancel()
    expiry_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting Middleware
app.add_middleware(RateLimiterMiddleware)

# API Routers
app.include_router(reservations_router, prefix=settings.API_V1_STR)
app.include_router(payments_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(simulation_router, prefix=settings.API_V1_STR)
app.include_router(failure_router, prefix=settings.API_V1_STR)
app.include_router(observability_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "OPERATIONAL",
        "docs": "/docs",
        "health": "OK"
    }
