from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.auth import UserOut
from app.services.user_service import get_user_service
from app.core.db import get_db
from app.services.auth_service import get_current_user

router = APIRouter()

@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    user_service = get_user_service(db)
    return user_service.list_users()

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_service = get_user_service(db)
    user = user_service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if current_user.role != "admin" and current_user.id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return user 