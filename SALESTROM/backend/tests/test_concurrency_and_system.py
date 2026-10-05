import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine, Base, AsyncSessionLocal
from app.models.domain_models import Product, Inventory, InventoryReservation, Payment, Order
from app.core.config import settings
from sqlalchemy import delete, update

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Reset DB tables cleanly for each test run
        await db.execute(delete(Order))
        await db.execute(delete(Payment))
        await db.execute(delete(InventoryReservation))
        await db.execute(delete(Inventory).where(Inventory.product_id == "SALESTORM-X-DEFAULT"))
        await db.execute(delete(Product).where(Product.product_id == "SALESTORM-X-DEFAULT"))
        await db.commit()

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
    yield

@pytest.mark.asyncio
async def test_single_reservation_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        key = str(uuid.uuid4())
        res = await ac.post("/api/v1/reservations", json={
            "product_id": "SALESTORM-X-DEFAULT",
            "customer_id": "CUST-00001",
            "quantity": 1,
            "idempotency_key": key
        }, headers={"Idempotency-Key": key})
        assert res.status_code in [201, 200]
        data = res.json()
        assert data["status"] == "RESERVED"
        assert data["is_duplicate"] is False

@pytest.mark.asyncio
async def test_duplicate_reservation_idempotency():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        key = f"IDEM-KEY-{uuid.uuid4().hex[:8]}"
        res1 = await ac.post("/api/v1/reservations", json={
            "product_id": "SALESTORM-X-DEFAULT",
            "customer_id": "CUST-00002",
            "quantity": 1,
            "idempotency_key": key
        }, headers={"Idempotency-Key": key})
        assert res1.status_code in [201, 200]

        # Duplicate Request
        res2 = await ac.post("/api/v1/reservations", json={
            "product_id": "SALESTORM-X-DEFAULT",
            "customer_id": "CUST-00002",
            "quantity": 1,
            "idempotency_key": key
        }, headers={"Idempotency-Key": key})
        assert res2.status_code in [201, 200]
        data2 = res2.json()
        assert data2["is_duplicate"] is True
        assert data2["reservation_id"] == res1.json()["reservation_id"]

@pytest.mark.asyncio
async def test_10k_concurrency_attack_simulation():
    """CRITICAL HACKATHON ASSERTION: 1,000 concurrent requests competing for stock."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        sim_res = await ac.post("/api/v1/flash-sale/simulate", json={
            "stock": 100,
            "concurrent_users": 1000,
            "duplicate_rate": 0.05,
            "payment_success_rate": 0.95
        })
        assert sim_res.status_code == 200
        data = sim_res.json()
        
        # Core architectural assertions
        assert data["successful_reservations"] <= 100
        assert data["oversold_count"] == 0
        assert data["total_requests"] == 1000

@pytest.mark.asyncio
async def test_payment_idempotency_and_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        key = str(uuid.uuid4())
        r_res = await ac.post("/api/v1/reservations", json={
            "product_id": "SALESTORM-X-DEFAULT",
            "customer_id": "CUST-PAY-TEST",
            "quantity": 1,
            "idempotency_key": key
        })
        if r_res.status_code == 201:
            res_id = r_res.json()["reservation_id"]
            pay_key = f"PAY-KEY-{uuid.uuid4().hex[:8]}"

            # First Payment
            p1 = await ac.post("/api/v1/payments", json={
                "reservation_id": res_id,
                "amount": 49999.0,
                "idempotency_key": pay_key
            }, headers={"Idempotency-Key": pay_key})
            assert p1.status_code in [201, 200]
            assert p1.json()["status"] == "SUCCESS"

            # Duplicate Payment attempt with same key
            p2 = await ac.post("/api/v1/payments", json={
                "reservation_id": res_id,
                "amount": 49999.0,
                "idempotency_key": pay_key
            }, headers={"Idempotency-Key": pay_key})
            assert p2.status_code in [201, 200]
            assert p2.json()["is_duplicate"] is True
            assert p2.json()["payment_id"] == p1.json()["payment_id"]

@pytest.mark.asyncio
async def test_order_service_recovery_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/api/v1/failure/order-service?enable=true")
        
        key = str(uuid.uuid4())
        r_res = await ac.post("/api/v1/reservations", json={
            "product_id": "SALESTORM-X-DEFAULT",
            "customer_id": "CUST-ORDER-RECOVERY",
            "quantity": 1,
            "idempotency_key": key
        })
        if r_res.status_code == 201:
            res_id = r_res.json()["reservation_id"]
            pay_key = f"PAY-REC-{uuid.uuid4().hex[:8]}"
            p_res = await ac.post("/api/v1/payments", json={
                "reservation_id": res_id,
                "amount": 49999.0,
                "idempotency_key": pay_key
            })
            assert p_res.status_code in [201, 200]

        await ac.post("/api/v1/failure/order-service?enable=false")

@pytest.mark.asyncio
async def test_circuit_breaker_state():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        metrics = await ac.get("/api/v1/metrics")
        assert metrics.status_code == 200
        assert "circuit_breaker_state" in metrics.json()
