import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import auth, users
from app.routers import excel_uploads
from app.middleware.logging import LoggingMiddleware

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('CORS_ORIGINS', 'http://localhost:3000')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(excel_uploads.router, prefix="/api", tags=["excel_uploads"])

@app.get("/")
def root():
    return {"message": "API is running"} 