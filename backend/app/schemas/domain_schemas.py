from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime

class ReservationCreateSchema(BaseModel):
    product_id: str
    customer_id: str
    quantity: int = Field(default=1, ge=1)
    idempotency_key: str

class ReservationResponseSchema(BaseModel):
    reservation_id: str
    customer_id: str
    product_id: str
    quantity: int
    status: str
    idempotency_key: str
    expires_at: datetime
    created_at: datetime
    is_duplicate: bool = False

class PaymentCreateSchema(BaseModel):
    reservation_id: str
    amount: float
    idempotency_key: str
    currency: str = "INR"

class PaymentResponseSchema(BaseModel):
    payment_id: str
    order_id: Optional[str] = None
    reservation_id: str
    amount: float
    currency: str
    status: str
    provider: str
    transaction_reference: str
    idempotency_key: str
    created_at: datetime
    is_duplicate: bool = False

class OrderResponseSchema(BaseModel):
    order_id: str
    customer_id: str
    reservation_id: str
    payment_id: Optional[str] = None
    status: str
    total_amount: float
    created_at: datetime

class SimulationRequestSchema(BaseModel):
    stock: int = Field(default=100, ge=1)
    concurrent_users: int = Field(default=10000, ge=1)
    duplicate_rate: float = Field(default=0.02, ge=0.0, le=1.0)
    payment_success_rate: float = Field(default=0.95, ge=0.0, le=1.0)
    concurrency_strategy: str = Field(default="ATOMIC_UPDATE") # ATOMIC_UPDATE or OPTIMISTIC_LOCKING

class SimulationResultSchema(BaseModel):
    total_requests: int
    successful_reservations: int
    failed_reservations: int
    duplicate_requests: int
    payments_successful: int
    payments_failed: int
    orders_created: int
    oversold_count: int
    average_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    throughput_rps: float
    events_log: List[Dict[str, Any]] = []

class FailureConfigSchema(BaseModel):
    payment_gateway_failure: bool = False
    payment_timeout: bool = False
    order_service_down: bool = False
    database_failure: bool = False
    duplicate_buy_request: bool = False
    reservation_expiry: bool = False
    message_processing_failure: bool = False
    high_traffic_spike: bool = False

class SystemMetricsSchema(BaseModel):
    current_traffic_rps: float
    available_stock: int
    reserved_stock: int
    sold_stock: int
    total_requests: int
    successful_reservations: int
    successful_orders: int
    payment_success_rate: float
    error_rate: float
    queue_backlog: int
    circuit_breaker_state: str
    p50_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
