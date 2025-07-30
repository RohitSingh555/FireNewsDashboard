from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExcelUploadCreate(BaseModel):
    file_name: str
    file_path: str
    from_url: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    extra: Optional[str] = None

class ExcelUploadOut(BaseModel):
    id: int
    file_name: str
    file_path: str
    from_url: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    extra: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True 