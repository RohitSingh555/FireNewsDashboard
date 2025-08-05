import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from app.routers import auth, users
from app.routers import excel_uploads
from app.routers import tags
from app.routers import admin
from app.middleware.logging import LoggingMiddleware

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

app = FastAPI()

# Simplified CORS configuration - allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Add logging middleware after CORS
app.add_middleware(LoggingMiddleware)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/admin", tags=["admin"])
app.include_router(excel_uploads.router, prefix="/api", tags=["excel_uploads"])
app.include_router(tags.router, prefix="/api", tags=["tags"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
def root():
    return {"message": "API is running"}

# Add a health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

# Add OPTIONS handler for debugging
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """Handle OPTIONS requests for debugging"""
    print(f"OPTIONS request to: /{full_path}")
    print(f"Headers: {dict(request.headers)}")
    return JSONResponse(content={}, status_code=200) 