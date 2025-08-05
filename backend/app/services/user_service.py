from app.models.user import User
from app.schemas.auth import UserCreate
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.services.activity_log_service import get_activity_log_service
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_service(db: Session):
    return UserService(db)

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, user: UserCreate, ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            email=user.email,
            hashed_password=hashed_password,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            city=user.city,
            state=user.state,
            country=user.country
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        # Log user creation
        activity_log_service = get_activity_log_service(self.db)
        activity_log_service.log_user_registration(db_user, ip_address, user_agent)
        
        return db_user

    def authenticate_user(self, email: str, password: str):
        user = self.get_by_email(email)
        if not user or not pwd_context.verify(password, user.hashed_password):
            return None
        return user

    def list_users(self):
        return self.db.query(User).all()

    def get_by_id(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id).first() 