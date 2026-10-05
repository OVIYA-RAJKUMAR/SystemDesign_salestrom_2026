import asyncio
import time
import uuid
import numpy as np
from typing import Dict, Any, List
from app.core.database import AsyncSessionLocal
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.reservation_repository import ReservationRepository
from app.models.domain_models import Product, Inventory, InventoryReservation, Payment, Order
from app.schemas.domain_schemas import SimulationRequestSchema, SimulationResultSchema
from app.services.reservation_service import ReservationService
from app.services.payment_service import PaymentService
from app.services.order_service import OrderService
from sqlalchemy import delete

class SimulationService:
    async def run_simulation(self, req: SimulationRequestSchema) -> SimulationResultSchema:
        start_time = time.time()
        product_id = "SALESTORM-X-DEFAULT"

        # 1. Reset database state cleanly
        async with AsyncSessionLocal() as db:
            await db.execute(delete(Order))
            await db.execute(delete(Payment))
            await db.execute(delete(InventoryReservation))
            await db.execute(delete(Inventory).where(Inventory.product_id == product_id))
            await db.execute(delete(Product).where(Product.product_id == product_id))
            await db.commit()

            product = Product(
                product_id=product_id,
                name="SALESTORM X — Limited Edition",
                sku="SALESTORM-X-2026",
                price=49999.0,
                stock_initial=req.stock
            )
            db.add(product)
            inventory = Inventory(
                product_id=product_id,
                available_quantity=req.stock,
                reserved_quantity=0,
                sold_quantity=0,
                version=1
            )
            db.add(inventory)
            await db.commit()

        # Generate request keys
        num_duplicates = int(req.concurrent_users * req.duplicate_rate)
        unique_keys = [str(uuid.uuid4()) for _ in range(req.concurrent_users - num_duplicates)]
        
        all_keys = list(unique_keys)
        for _ in range(num_duplicates):
            if unique_keys:
                all_keys.append(np.random.choice(unique_keys))
            else:
                all_keys.append(str(uuid.uuid4()))

        np.random.shuffle(all_keys)

        latencies = []
        raw_reservations = 0
        failed_reservations = 0
        duplicate_requests = 0
        payments_successful = 0
        payments_failed = 0
        orders_created = 0
        events_log = []

        semaphore = asyncio.Semaphore(100)

        async def execute_user_request(user_index: int, key: str):
            nonlocal raw_reservations, failed_reservations, duplicate_requests
            nonlocal payments_successful, payments_failed, orders_created

            async with semaphore:
                t0 = time.time()
                async with AsyncSessionLocal() as session:
                    res_service = ReservationService(session)
                    payment_service = PaymentService(session)
                    order_service = OrderService(session)

                    customer_id = f"CUST-{user_index:05d}"
                    try:
                        res = await res_service.reserve_stock(
                            customer_id=customer_id,
                            product_id=product_id,
                            quantity=1,
                            idempotency_key=key,
                            strategy=req.concurrency_strategy
                        )

                        t_elapsed = (time.time() - t0) * 1000.0
                        latencies.append(t_elapsed)

                        if res.get("is_duplicate"):
                            duplicate_requests += 1
                            events_log.append({
                                "time": time.strftime("%H:%M:%S"),
                                "event": f"Request #{user_index} → Duplicate detected (Idempotency Key reused)",
                                "status": "DUPLICATE"
                            })
                            return

                        raw_reservations += 1
                        events_log.append({
                            "time": time.strftime("%H:%M:%S"),
                            "event": f"Request #{user_index} ({customer_id}) → Reservation SUCCESS ({res['reservation_id'][:8]})",
                            "status": "SUCCESS"
                        })

                        # Execute Payment Process
                        pay_key = f"PAY-{key}"
                        should_succeed = (np.random.rand() <= req.payment_success_rate)

                        if should_succeed:
                            try:
                                pay_res = await payment_service.process_payment(
                                    reservation_id=res["reservation_id"],
                                    amount=49999.0,
                                    idempotency_key=pay_key
                                )
                                payments_successful += 1

                                await order_service.create_order_from_event({
                                    "reservation_id": res["reservation_id"],
                                    "payment_id": pay_res["payment_id"],
                                    "customer_id": customer_id,
                                    "amount": 49999.0
                                })
                                orders_created += 1
                            except Exception:
                                payments_failed += 1
                        else:
                            payments_failed += 1
                            inv_repo = InventoryRepository(session)
                            res_repo = ReservationRepository(session)
                            await inv_repo.release_reservation(product_id, 1)
                            await res_repo.update_status(res["reservation_id"], "RELEASED")
                            await session.commit()

                    except Exception:
                        t_elapsed = (time.time() - t0) * 1000.0
                        latencies.append(t_elapsed)
                        failed_reservations += 1
                        events_log.append({
                            "time": time.strftime("%H:%M:%S"),
                            "event": f"Request #{user_index} → Out of stock / Reservation REJECTED",
                            "status": "REJECTED"
                        })

        tasks = [execute_user_request(i, key) for i, key in enumerate(all_keys)]
        await asyncio.gather(*tasks)

        total_elapsed = time.time() - start_time
        throughput = req.concurrent_users / max(total_elapsed, 0.001)

        # Check authoritative inventory state from Database
        async with AsyncSessionLocal() as check_db:
            inv_repo = InventoryRepository(check_db)
            final_inv = await inv_repo.get_by_product_id(product_id)

            available = final_inv.available_quantity if final_inv else 0
            reserved = final_inv.reserved_quantity if final_inv else 0
            sold = final_inv.sold_quantity if final_inv else 0

        # Successful reservations represents active reservations + sold items <= initial stock
        successful_reservations = reserved + sold
        total_accounted = available + reserved + sold
        oversold_count = max(0, (reserved + sold) - req.stock)

        p50 = float(np.percentile(latencies, 50)) if latencies else 0.0
        p95 = float(np.percentile(latencies, 95)) if latencies else 0.0
        p99 = float(np.percentile(latencies, 99)) if latencies else 0.0
        avg_lat = float(np.mean(latencies)) if latencies else 0.0

        return SimulationResultSchema(
            total_requests=req.concurrent_users,
            successful_reservations=successful_reservations,
            failed_reservations=failed_reservations,
            duplicate_requests=duplicate_requests,
            payments_successful=payments_successful,
            payments_failed=payments_failed,
            orders_created=orders_created,
            oversold_count=oversold_count,
            average_latency_ms=round(avg_lat, 2),
            p95_latency_ms=round(p95, 2),
            p99_latency_ms=round(p99, 2),
            throughput_rps=round(throughput, 2),
            events_log=events_log[:50]
        )
