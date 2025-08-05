from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.activity_log_service import get_activity_log_service
from app.schemas.activity_log import ActivityLogResponse
from typing import List

router = APIRouter()

@router.get("/activity-logs", response_model=List[ActivityLogResponse])
def get_activity_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get activity logs (admin only)"""
    if current_user.role.value not in ['admin', 'ADMIN']:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    activity_log_service = get_activity_log_service(db)
    logs = activity_log_service.get_all_activity_logs(limit=page_size)
    
    # Convert to response format
    response_logs = []
    for log in logs:
        user_email = log.user.email if log.user else None
        response_logs.append(ActivityLogResponse(
            id=log.id,
            action_type=log.action_type,
            description=log.description,
            details=log.details,
            user_email=user_email,
            created_at=log.created_at
        ))
    
    return response_logs

@router.get("/activity-logs/user/{user_id}")
def get_user_activity_logs(
    user_id: int,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get activity logs for a specific user (admin only)"""
    if current_user.role.value not in ['admin', 'ADMIN']:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    activity_log_service = get_activity_log_service(db)
    logs = activity_log_service.get_user_activity_logs(user_id, limit)
    
    # Convert to response format
    response_logs = []
    for log in logs:
        user_email = log.user.email if log.user else None
        response_logs.append(ActivityLogResponse(
            id=log.id,
            action_type=log.action_type,
            description=log.description,
            details=log.details,
            user_email=user_email,
            created_at=log.created_at
        ))
    
    return response_logs 