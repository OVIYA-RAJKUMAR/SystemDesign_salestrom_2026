# System Reliability & Resilience Architecture

## 1. Reliability Patterns Implemented
1. **Circuit Breaker Pattern:** External payment provider dependencies are protected via `CircuitBreaker` states (`CLOSED`, `OPEN`, `HALF_OPEN`). After 3 consecutive timeouts, the breaker trips OPEN, shedding payment calls to prevent backend worker thread blocking.
2. **Transactional Outbox Pattern:** Outbox events (`OutboxEvent`) are inserted into the database within the exact same transaction boundary as reservation/payment state updates. This guarantees at-least-once event delivery even during server crashes.
3. **Dead Letter Queue (DLQ):** Unprocessable events that exceed 3 retry attempts are moved to the broker's Dead Letter Queue for manual operator inspection.
4. **Automatic Hold Expiry Worker:** Background task periodically sweeps unpaid reservations exceeding 30s TTL and releases stock atomically back to the available inventory pool.
