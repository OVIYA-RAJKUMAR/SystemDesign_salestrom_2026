# SALESTORM System Requirements Specification

## 1. System Vision
SALESTORM | SYSCRAFTERS 2026 is a design-first, high-concurrency e-commerce flash sale platform built to demonstrate zero overselling, strict payment idempotency, and fault-tolerant event-driven recovery under extreme traffic bursts (10,000 req/s scaling toward 500,000 req/s).

## 2. Core Functional Requirements
- **FR-01 (Atomic Stock Reservation):** 10,000 concurrent purchase attempts competing for 100 available units MUST produce maximum successful reservations <= 100.
- **FR-02 (Zero Overselling Guarantee):** Available inventory quantity can NEVER drop below 0.
- **FR-03 (Reservation Idempotency):** Re-submitting identical `customer_id` + `idempotency_key` MUST return the existing reservation without creating duplicate stock deductions.
- **FR-04 (Payment Idempotency):** Re-submitting identical `idempotency_key` to payment endpoint MUST return the existing transaction record without charging twice.
- **FR-05 (Reservation Expiration):** Holds unpaid after 30 seconds MUST expire and release stock back to the available inventory pool.
- **FR-06 (Order Fault Recovery):** If Order Service fails after payment success, outbox events MUST remain in queue and reconcile upon service recovery.

## 3. Core Non-Functional Requirements
- **NFR-01 (Throughput):** System must process 10,000 concurrent requests without thread exhaustion.
- **NFR-02 (Latency):** P95 latency must remain under 50ms for stock reservation attempts.
- **NFR-03 (Isolation & Consistency):** Transactional database isolation level must guarantee SERIALIZABLE or ATOMIC row update semantics.
