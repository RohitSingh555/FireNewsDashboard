from starlette.middleware.base import BaseHTTPMiddleware
import logging

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        logger = logging.getLogger("uvicorn.access")
        logger.info("Request: %s %s", request.method, request.url)
        response = await call_next(request)
        logger.info("Response status: %s", response.status_code)
        return response 