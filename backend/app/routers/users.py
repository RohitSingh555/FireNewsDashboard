from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog, ActivityType
from app.schemas.auth import UserResponse, UserUpdate
from app.schemas.activity_log import ActivityLogResponse
from app.services.auth_service import get_current_user
from typing import List
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """Get all users with pagination - Admin only"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators can view all users"
        )
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/stats")
def get_user_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user statistics for admin dashboard - Admin only"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators can view user statistics"
        )
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    admin_users = db.query(User).filter(User.role == UserRole.ADMIN).count()
    reporter_users = db.query(User).filter(User.role == UserRole.REPORTER).count()
    regular_users = db.query(User).filter(User.role == UserRole.USER).count()
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_activities = db.query(ActivityLog).filter(ActivityLog.created_at >= week_ago).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "admin_users": admin_users,
        "reporter_users": reporter_users,
        "regular_users": regular_users,
        "recent_activities": recent_activities
    }

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user role - Admin only, cannot change own role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators can update user roles"
        )
    
    # Prevent admin from changing their own role
    if current_user.id == user_id:
        raise HTTPException(
            status_code=403,
            detail="Administrators cannot change their own role"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_role = role_update.get("role")
    if new_role not in [role.value for role in UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Prevent changing the last admin to a different role
    if user.role == UserRole.ADMIN and new_role != UserRole.ADMIN:
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot change the last administrator's role. At least one admin must remain."
            )
    
    old_role = user.role.value
    user.role = UserRole(new_role)
    
    # Create activity log
    activity_log = ActivityLog(
        user_id=user.id,
        action_type=ActivityType.ROLE_CHANGED,
        description=f"User {user.email} role changed from {old_role} to {new_role}",
        details=f"Role updated by admin {current_user.email}"
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(user)
    
    return {"message": f"User role updated to {new_role}", "user": UserResponse.from_orm(user)}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a user - Admin only, cannot delete self"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators can delete users"
        )
    
    # Prevent admin from deleting themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=403,
            detail="Administrators cannot delete their own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting the last admin
    if user.role == UserRole.ADMIN:
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the last administrator. At least one admin must remain."
            )
    
    user_email = user.email
    db.delete(user)
    
    # Create activity log
    activity_log = ActivityLog(
        action_type=ActivityType.USER_DELETED,
        description=f"User {user_email} was deleted",
        details=f"User account removed by admin {current_user.email}"
    )
    db.add(activity_log)
    
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/activity-logs", response_model=List[ActivityLogResponse])
def get_activity_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    action_type: str = Query(None),
    user_id: int = Query(None)
):
    """Get activity logs with filtering - Admin only"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators can view activity logs"
        )
    
    query = db.query(ActivityLog)
    
    if action_type:
        query = query.filter(ActivityLog.action_type == action_type)
    
    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    
    logs = query.order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()
    
    # Convert to response format with user email
    response_logs = []
    for log in logs:
        user_email = None
        if log.user_id:
            user = db.query(User).filter(User.id == log.user_id).first()
            user_email = user.email if user else None
        
        response_logs.append(ActivityLogResponse(
            id=log.id,
            action_type=log.action_type,
            description=log.description,
            details=log.details,
            user_email=user_email,
            created_at=log.created_at
        ))
    
    return response_logs

@router.get("/activity-logs/stats")
def get_activity_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get activity log statistics - Admin only"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators can view activity statistics"
        )
    
    total_activities = db.query(ActivityLog).count()
    
    # Activities by type
    activities_by_type = {}
    for activity_type in ActivityType:
        count = db.query(ActivityLog).filter(ActivityLog.action_type == activity_type.value).count()
        activities_by_type[activity_type.value] = count
    
    # Recent activities (last 24 hours)
    day_ago = datetime.utcnow() - timedelta(days=1)
    recent_activities = db.query(ActivityLog).filter(ActivityLog.created_at >= day_ago).count()
    
    # Activities by user
    user_activities = db.query(
        ActivityLog.user_id,
        User.email,
        db.func.count(ActivityLog.id).label('activity_count')
    ).join(User, ActivityLog.user_id == User.id, isouter=True)\
     .group_by(ActivityLog.user_id, User.email)\
     .order_by(db.func.count(ActivityLog.id).desc())\
     .limit(10).all()
    
    return {
        "total_activities": total_activities,
        "activities_by_type": activities_by_type,
        "recent_activities_24h": recent_activities,
        "top_active_users": [
            {"user_id": ua.user_id, "email": ua.email, "count": ua.activity_count}
            for ua in user_activities
        ]
    } 