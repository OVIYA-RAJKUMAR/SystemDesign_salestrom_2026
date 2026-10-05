# Database Schema & Concurrency Model

## 1. Relational Schema & Unique Constraints
The domain data model enforces hard data integrity using foreign keys and unique indexes:

### `inventories` Table
- `inventory_id`: Primary Key (UUID)
- `product_id`: Foreign Key to `products` (Unique, Indexed)
- `available_quantity`: Integer (>= 0)
- `reserved_quantity`: Integer (>= 0)
- `sold_quantity`: Integer (>= 0)
- `version`: Integer (Optimistic Locking version)
- `updated_at`: Timestamp

### `inventory_reservations` Table
- `reservation_id`: Primary Key (UUID)
- `customer_id`: String (Indexed)
- `product_id`: Foreign Key to `products`
- `quantity`: Integer
- `status`: Enum (`RESERVED`, `CONFIRMED`, `RELEASED`, `EXPIRED`)
- `idempotency_key`: String (Unique Index)
- `expires_at`: Timestamp (Indexed for expiration worker)

### `payments` Table
- `payment_id`: Primary Key (UUID)
- `reservation_id`: Foreign Key to `inventory_reservations`
- `idempotency_key`: String (Unique Index)
- `transaction_reference`: String (Unique Index)
- `status`: Enum (`INITIATED`, `SUCCESS`, `FAILED`, `TIMEOUT`)

### `outbox_events` Table
- `event_id`: Primary Key (UUID)
- `event_type`: String (Indexed)
- `aggregate_id`: String
- `payload`: Text (JSON)
- `status`: Enum (`PENDING`, `PROCESSED`, `FAILED`)
