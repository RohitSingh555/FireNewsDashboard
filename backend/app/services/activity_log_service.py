from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog, ActivityType
from app.models.user import User
from typing import Optional
from datetime import datetime

def get_activity_log_service(db: Session):
    return ActivityLogService(db)

class ActivityLogService:
    def __init__(self, db: Session):
        self.db = db

    def create_activity_log(
        self,
        action_type: ActivityType,
        description: str,
        user_id: Optional[int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> ActivityLog:
        """Create an activity log entry"""
        activity_log = ActivityLog(
            user_id=user_id,
            action_type=action_type.value,
            description=description,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.utcnow()
        )
        self.db.add(activity_log)
        self.db.commit()
        self.db.refresh(activity_log)
        return activity_log

    def log_user_login(self, user: User, ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        """Log user login activity"""
        return self.create_activity_log(
            action_type=ActivityType.USER_LOGIN,
            description=f"User {user.email} logged in",
            user_id=user.id,
            details=f"Login successful for user: {user.email}",
            ip_address=ip_address,
            user_agent=user_agent
        )

    def log_user_registration(self, user: User, ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        """Log user registration activity"""
        return self.create_activity_log(
            action_type=ActivityType.USER_CREATED,
            description=f"New user registered: {user.email}",
            user_id=user.id,
            details=f"User registration completed for: {user.email} with role: {user.role.value}",
            ip_address=ip_address,
            user_agent=user_agent
        )

    def log_excel_upload(self, user: Optional[User], file_name: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        """Log Excel upload activity"""
        user_info = f" by {user.email}" if user else " anonymously"
        return self.create_activity_log(
            action_type=ActivityType.NEWS_UPLOADED,
            description=f"Excel file uploaded: {file_name}{user_info}",
            user_id=user.id if user else None,
            details=f"File upload: {file_name}",
            ip_address=ip_address,
            user_agent=user_agent
        )

    def log_user_logout(self, user: User, ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        """Log user logout activity"""
        return self.create_activity_log(
            action_type=ActivityType.USER_LOGOUT,
            description=f"User {user.email} logged out",
            user_id=user.id,
            details=f"Logout successful for user: {user.email}",
            ip_address=ip_address,
            user_agent=user_agent
        )

    def log_role_change(self, user: User, new_role: str, changed_by: User, ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        """Log role change activity"""
        return self.create_activity_log(
            action_type=ActivityType.ROLE_CHANGED,
            description=f"User {user.email} role changed to {new_role}",
            user_id=changed_by.id,
            details=f"Role change: {user.email} -> {new_role} (changed by: {changed_by.email})",
            ip_address=ip_address,
            user_agent=user_agent
        )

    def log_user_deletion(self, user_email: str, deleted_by: User, ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        """Log user deletion activity"""
        return self.create_activity_log(
            action_type=ActivityType.USER_DELETED,
            description=f"User {user_email} deleted",
            user_id=deleted_by.id,
            details=f"User deletion: {user_email} (deleted by: {deleted_by.email})",
            ip_address=ip_address,
            user_agent=user_agent
        )

    def get_user_activity_logs(self, user_id: int, limit: int = 50):
        """Get activity logs for a specific user"""
        return self.db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id
        ).order_by(ActivityLog.created_at.desc()).limit(limit).all()

    def get_all_activity_logs(self, limit: int = 100):
        """Get all activity logs"""
        return self.db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all() 