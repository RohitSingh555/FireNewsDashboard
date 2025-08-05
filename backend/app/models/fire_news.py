from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.db import Base

class FireNews(Base):
    __tablename__ = 'fire_news'
    id = Column(Integer, primary_key=True, index=True)
    # Data type to distinguish between fire news and 911 emergency data
    data_type = Column(String(50), default='fire_news', nullable=False)  # 'fire_news' or 'emergency_911'
    
    # Common fields for both types
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    published_date = Column(DateTime(timezone=True), nullable=True)
    incident_date = Column(DateTime(timezone=True), nullable=True)  # For 911 emergency data
    url = Column(String(500), nullable=True)
    source = Column(String(255), nullable=True)
    fire_related_score = Column(Float, nullable=True)
    verification_result = Column(String(100), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    state = Column(String(100), nullable=True)
    county = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    province = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    tags = Column(String(255), nullable=True)  # Keep for backward compatibility
    reporter_name = Column(String(100), nullable=True)
    verifier_feedback = Column(Text, nullable=True)  # Feedback added by the verifier
    is_verified = Column(Boolean, default=False, nullable=False)
    is_hidden = Column(Boolean, default=False, nullable=False)
    
    # 911 Emergency specific fields
    station_name = Column(String(255), nullable=True)
    address = Column(String(500), nullable=True)
    context = Column(Text, nullable=True)
    verified_address = Column(String(500), nullable=True)
    address_accuracy_score = Column(Float, nullable=True)
    incident_type = Column(String(100), nullable=True)
    priority_level = Column(String(50), nullable=True)
    response_time = Column(Integer, nullable=True)  # in minutes
    units_dispatched = Column(String(255), nullable=True)
    status = Column(String(50), nullable=True)  # pending, in_progress, completed, cancelled
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    bookmarks = relationship("Bookmark", back_populates="news") 