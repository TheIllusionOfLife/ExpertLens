"""Rate limiter singleton for REST endpoints."""

from fastapi import Request
from slowapi import Limiter


def _get_client_ip(request: Request) -> str:
    """Extract client IP, respecting X-Forwarded-For behind Cloud Run's load balancer.

    Cloud Run sets X-Forwarded-For with the real client IP as the first entry.
    Falls back to the direct connection IP for local development.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=_get_client_ip)
