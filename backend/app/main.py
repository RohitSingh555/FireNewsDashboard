import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import auth, users
from app.routers import excel_uploads
from app.middleware.logging import LoggingMiddleware
from app.middleware.db_error_handler import DatabaseErrorMiddleware
from app.core.db import engine
from sqlalchemy import text

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('CORS_ORIGINS', 'http://localhost:3000')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(DatabaseErrorMiddleware)
app.add_middleware(LoggingMiddleware)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(excel_uploads.router, prefix="/api", tags=["excel_uploads"])

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/health")
async def health_check():
    try:
        # Test database connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {str(e)}"
        ) 