# SALESTORM System Architecture Specification

## 1. High-Level Architecture Overview
SALESTORM uses a layered microservices architecture designed to decouple synchronous inventory reservation from asynchronous order processing and payment execution.

```
Customers (10,000 req/s)
    │
    ▼
[ API Gateway & Token Bucket Rate Limiter ]
    │
    ▼
[ Inventory & Reservation Service ]  ──(Atomic SQL Update)──► [ Relational Database ]
    │
    ▼
[ Payment Service & Circuit Breaker ]
    │ (PaymentSucceeded Event)
    ▼
[ Outbox Event Table & Message Broker ]
    │
    ▼
[ Order Service Consumer ]
```

## 2. Layered Responsibilities
- **API Gateway:** Entry point for ingress admission control, token bucket rate limiting, and request correlation context tracking.
- **Inventory Service:** Acts as the strongly-consistent domain boundary. Executes atomic conditional SQL updates:
  `UPDATE inventory SET available = available - 1, reserved = reserved + 1 WHERE product_id = X AND available >= 1`
- **Reservation Service:** Manages 30s TTL hold lifecycles and enforces idempotency key constraints.
- **Payment Service:** Wraps external gateway dependencies inside a Circuit Breaker (CLOSED / OPEN / HALF_OPEN).
- **Order Service:** Asynchronous consumer processing outbox events idempotently to finalize order records.

## 3. Horizontal Scalability Strategy (10,000 -> 500,000 req/s)
1. **Edge Admission Control:** CDN + Token Bucket Rate Limiter shed traffic spikes exceeding server capacity.
2. **Stateless API Tier:** Microservices run as containerized pods auto-scaled horizontally via Kubernetes HPA.
3. **Hot-Key Inventory Partitioning:** For 500,000 req/s flash sales, inventory is pre-allocated into database partitions/buckets to eliminate single-row lock contention.
