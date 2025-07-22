from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.mysql import BLOB
import uuid
from app.core.db import Base

class ExcelUpload(Base):
    __tablename__ = 'excel_uploads'
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    created = Column(DateTime, server_default=func.now())
    from_url = Column(String(512), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    extra = Column(Text, nullable=True)  # for any extra metadata 