from starlette.middleware.base import BaseHTTPMiddleware
import logging

# Create a custom logger for our middleware
logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Only log API requests and error responses to reduce noise
        if request.url.path.startswith('/api/') or request.url.path.startswith('/auth/'):
            logger.info(f"API Request: {request.method} {request.url.path}")
        
        response = await call_next(request)
        
        # Only log error responses
        if response.status_code >= 400:
            logger.warning(f"Error Response: {response.status_code} for {request.method} {request.url.path}")
        
        return response 