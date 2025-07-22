from starlette.middleware.base import BaseHTTPMiddleware
import logging

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Use a custom logger instead of uvicorn.access
        logger = logging.getLogger("app.middleware")
        logger.info(f"Request: {request.method} {request.url}")
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response 