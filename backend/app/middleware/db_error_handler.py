from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import HTTPException
from sqlalchemy.exc import OperationalError, DisconnectionError
import logging
import time

logger = logging.getLogger("app.middleware.db_error_handler")

class DatabaseErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                response = await call_next(request)
                return response
            except (OperationalError, DisconnectionError) as e:
                retry_count += 1
                logger.warning(f"Database connection error (attempt {retry_count}/{max_retries}): {str(e)}")
                
                if retry_count >= max_retries:
                    logger.error(f"Max retries reached for database operation: {str(e)}")
                    raise HTTPException(
                        status_code=503,
                        detail="Database temporarily unavailable. Please try again."
                    )
                
                # Wait before retrying (exponential backoff)
                wait_time = 2 ** retry_count
                logger.info(f"Retrying database operation in {wait_time} seconds...")
                time.sleep(wait_time)
                
                # Force a new database connection
                from app.core.db import engine
                engine.dispose()
        
        # This should never be reached, but just in case
        raise HTTPException(
            status_code=503,
            detail="Database temporarily unavailable. Please try again."
        ) 