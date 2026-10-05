export interface SimulationRequest {
  stock: number;
  concurrent_users: number;
  duplicate_rate: number;
  payment_success_rate: number;
  concurrency_strategy?: 'ATOMIC_UPDATE' | 'OPTIMISTIC_LOCKING';
}

export interface SimulationResult {
  total_requests: number;
  successful_reservations: number;
  failed_reservations: number;
  duplicate_requests: number;
  payments_successful: number;
  payments_failed: number;
  orders_created: number;
  oversold_count: number;
  average_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  throughput_rps: number;
  events_log: Array<{
    time: string;
    event: string;
    status: 'SUCCESS' | 'REJECTED' | 'DUPLICATE' | 'ERROR';
  }>;
}

export interface SystemMetrics {
  current_traffic_rps: number;
  available_stock: number;
  reserved_stock: number;
  sold_stock: number;
  total_requests: number;
  successful_reservations: number;
  successful_orders: number;
  payment_success_rate: number;
  error_rate: number;
  queue_backlog: number;
  circuit_breaker_state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
}

export interface FailureConfig {
  payment_gateway_failure: boolean;
  payment_timeout: boolean;
  order_service_down: boolean;
  database_failure: boolean;
  duplicate_buy_request: boolean;
  reservation_expiry: boolean;
  message_processing_failure: boolean;
  high_traffic_spike: boolean;
}

export interface ReservationResponse {
  reservation_id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  status: string;
  idempotency_key: string;
  expires_at: string;
  created_at: string;
  is_duplicate?: boolean;
}

export interface PaymentResponse {
  payment_id: string;
  order_id?: string;
  reservation_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  transaction_reference: string;
  idempotency_key: string;
  created_at: string;
  is_duplicate?: boolean;
}

export interface OrderItem {
  order_id: string;
  customer_id: string;
  reservation_id: string;
  payment_id?: string;
  status: string;
  total_amount: number;
  created_at: string;
}
