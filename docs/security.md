# Security Architecture & Input Validation

## 1. Security Principles
- **No Raw Credit Card Data Storage:** Payment processing uses tokenized transaction references (`transaction_reference`). Raw PCI data is never logged or stored.
- **Idempotency Header Enforcement:** All mutation requests require `Idempotency-Key` to prevent double-charging or duplicate order creation.
- **Rate Limiting & Ingress Protection:** Token bucket rate limiter guards against Denial of Service (DoS) attacks and brute-force bot sweeps.
- **Role-Based Authorization:** Endpoints enforce strict separation between `CUSTOMER`, `OPERATOR`, and `ADMIN` roles.
- **Audit Logging:** Every critical transaction logs `correlation_id` and `request_id` into immutable `AuditLog` records.
