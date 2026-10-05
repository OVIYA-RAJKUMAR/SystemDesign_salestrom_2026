import time
import asyncio
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.domain.failure_simulator import global_failure_simulator

class TokenBucketRateLimiter:
    def __init__(self, capacity: int = 10000, refill_rate: float = 10000.0):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = float(capacity)
        self.last_refill = time.time()
        self._lock = asyncio.Lock()

    async def acquire(self) -> bool:
        async with self._lock:
            now = time.time()
            elapsed = now - self.last_refill
            self.tokens = min(float(self.capacity), self.tokens + elapsed * self.refill_rate)
            self.last_refill = now

            if self.tokens >= 1.0:
                self.tokens -= 1.0
                return True
            return False

global_rate_limiter = TokenBucketRateLimiter()

class RateLimiterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Apply rate limiting on simulation or purchase endpoints if traffic spike simulated
        if global_failure_simulator.is_failed("high_traffic_spike"):
            allowed = await global_rate_limiter.acquire()
            if not allowed:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error_code": "RATE_LIMITED",
                        "message": "Traffic spike detected. Request dropped by API Gateway Rate Limiter.",
                        "request_id": str(request.headers.get("x-request-id", "unknown")),
                        "timestamp": str(time.time())
                    }
                )
        response = await call_next(request)
        return response
