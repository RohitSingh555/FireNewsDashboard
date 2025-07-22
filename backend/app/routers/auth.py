from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.auth import UserCreate, UserLogin, Token, UserOut
from app.services.auth_service import AuthService, get_current_user
from app.services.user_service import get_user_service
from app.core.db import get_db

router = APIRouter()

auth_service = AuthService()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    user_service = get_user_service(db)
    db_user = user_service.get_by_email(user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_service.create_user(user)

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    user_service = get_user_service(db)
    db_user = user_service.authenticate_user(user.email, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return auth_service.create_token(db_user)

@router.get("/me", response_model=UserOut)
def me(current_user: UserOut = Depends(get_current_user)):
    return current_user 