# Architecture Trade-Off Analysis

## 1. Consistency vs Availability (CAP Theorem)
- **Decision:** Prioritize **Strong Consistency (CP)** over high availability (AP) for inventory reservation.
- **Rationale:** Overselling (selling 101 units when only 100 exist) causes severe financial, legal, and customer trust damage. If a DB partition cannot verify stock, the system MUST fail fast with `409 OUT_OF_STOCK` rather than returning a speculative approval.

## 2. Atomic Conditional Update vs Optimistic Versioning
- **Decision:** Select **Atomic Conditional Update** as primary strategy.
- **Rationale:** Under 10,000 req/s extreme contention for a single row (Product X), optimistic version checking causes excessive retry loops (9,900 retries). Atomic SQL conditional updates (`WHERE available >= requested`) allow the database engine to resolve contention in a single lock pass.

## 3. Synchronous Reservation vs Asynchronous Order Processing
- **Decision:** Reservation is synchronous; Order Creation is asynchronous event-driven.
- **Rationale:** Buyers need immediate feedback whether stock was successfully reserved. However, generating invoice PDFs, sending email notifications, and updating order history can safely execute asynchronously in background worker queues.
