import time
from typing import Callable, Any

class CircuitBreakerOpenException(Exception):
    pass

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, recovery_timeout_seconds: float = 5.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout_seconds = recovery_timeout_seconds
        
        self.state = "CLOSED" # CLOSED, OPEN, HALF_OPEN
        self.failure_count = 0
        self.last_failure_time = 0.0
        self.success_count_half_open = 0

    def allow_request(self) -> bool:
        return self.can_execute()

    def can_execute(self) -> bool:
        now = time.time()
        if self.state == "OPEN":
            if now - self.last_failure_time > self.recovery_timeout_seconds:
                self.state = "HALF_OPEN"
                self.success_count_half_open = 0
                return True
            return False
        return True

    def record_success(self):
        if self.state == "HALF_OPEN":
            self.success_count_half_open += 1
            if self.success_count_half_open >= 2:
                self.state = "CLOSED"
                self.failure_count = 0
        elif self.state == "CLOSED":
            self.failure_count = 0

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.state in ["CLOSED", "HALF_OPEN"] and self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

    async def call(self, func: Callable, *args, **kwargs) -> Any:
        if not self.can_execute():
            raise CircuitBreakerOpenException("Circuit Breaker is OPEN. External payment gateway unavailable.")
        try:
            result = await func(*args, **kwargs)
            self.record_success()
            return result
        except Exception as e:
            self.record_failure()
            raise e

global_payment_circuit_breaker = CircuitBreaker()
