from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ExcelUploadCreate(BaseModel):
    file_name: str
    from_url: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    extra: Optional[str] = None

class ExcelUploadOut(BaseModel):
    id: int
    external_id: str
    file_name: str
    file_path: str
    created: datetime
    from_url: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    extra: Optional[str]

    class Config:
        orm_mode = True 