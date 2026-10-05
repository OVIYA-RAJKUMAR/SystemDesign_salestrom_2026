# REST API Contracts Specification

All mutation endpoints require the `Idempotency-Key` header.

## 1. Inventory Reservation
`POST /api/v1/reservations`

### Request Headers
`Idempotency-Key: BUY-88219-X`

### Request Body
```json
{
  "product_id": "SALESTORM-X-DEFAULT",
  "customer_id": "CUST-00042",
  "quantity": 1,
  "idempotency_key": "BUY-88219-X"
}
```

### Response (201 Created)
```json
{
  "reservation_id": "c7a91f8e-...",
  "customer_id": "CUST-00042",
  "product_id": "SALESTORM-X-DEFAULT",
  "quantity": 1,
  "status": "RESERVED",
  "idempotency_key": "BUY-88219-X",
  "expires_at": "2026-10-05T09:45:00Z",
  "is_duplicate": false
}
```

## 2. Process Payment
`POST /api/v1/payments`

### Request Body
```json
{
  "reservation_id": "c7a91f8e-...",
  "amount": 49999.0,
  "idempotency_key": "PAY-88219-X"
}
```

### Response (201 Created)
```json
{
  "payment_id": "p8912a3-...",
  "reservation_id": "c7a91f8e-...",
  "amount": 49999.0,
  "status": "SUCCESS",
  "transaction_reference": "TXN-881923A",
  "is_duplicate": false
}
```

## 3. Flash Sale Simulation
`POST /api/v1/flash-sale/simulate`
Inputs: `stock`, `concurrent_users`, `duplicate_rate`, `payment_success_rate`.
Output: `total_requests`, `successful_reservations`, `failed_reservations`, `oversold_count`, latency metrics.
