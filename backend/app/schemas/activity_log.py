from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ActivityLogBase(BaseModel):
    action_type: str
    description: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    user_id: Optional[int] = None

class ActivityLogOut(ActivityLogBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ActivityLogResponse(BaseModel):
    id: int
    action_type: str
    description: str
    details: Optional[str] = None
    user_email: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True 