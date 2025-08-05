from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.schemas.auth import UserCreate, UserLogin, Token, UserOut
from app.services.auth_service import AuthService, get_current_user
from app.services.user_service import get_user_service
from app.services.activity_log_service import get_activity_log_service
from app.core.db import get_db

router = APIRouter()

auth_service = AuthService()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    user_service = get_user_service(db)
    
    db_user = user_service.get_by_email(user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Get client information
    ip_address = request.client.host
    user_agent = request.headers.get('user-agent')
    
    # Create user with activity logging
    created_user = user_service.create_user(user, ip_address, user_agent)
    
    return created_user

@router.post("/login", response_model=Token)
def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):
    user_service = get_user_service(db)
    activity_log_service = get_activity_log_service(db)
    
    db_user = user_service.authenticate_user(user.email, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Log user login
    ip_address = request.client.host
    user_agent = request.headers.get('user-agent')
    activity_log_service.log_user_login(db_user, ip_address, user_agent)
    
    return auth_service.create_token(db_user)

@router.get("/me", response_model=UserOut)
def me(current_user: UserOut = Depends(get_current_user)):
    return current_user 