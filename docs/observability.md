# Observability, Telemetry & Distributed Tracing

## 1. Metrics Exported
- `current_traffic_rps`: Ingress request rate per second.
- `p50_latency_ms`, `p95_latency_ms`, `p99_latency_ms`: Response time percentiles.
- `circuit_breaker_state`: Current status of gateway circuit breaker (`CLOSED`, `OPEN`, `HALF_OPEN`).
- `queue_backlog`: Message broker queue depth.
- `available_stock`, `reserved_stock`, `sold_stock`: Real-time inventory gauge.

## 2. Distributed Context Propagation
Every incoming HTTP request generates or propagates:
- `X-Request-ID`: Uniquely identifies the client request.
- `X-Correlation-ID`: Traces requests across API Gateway, Inventory Service, Payment Gateway, and Order Consumer.
