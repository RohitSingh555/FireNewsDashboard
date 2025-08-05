from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.db import Base

class Bookmark(Base):
    __tablename__ = 'bookmarks'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    news_id = Column(Integer, ForeignKey('fire_news.id'), nullable=False)
    data_type = Column(String(50), nullable=False)  # 'fire_news' or 'emergency_911'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships - using string references to avoid circular imports
    user = relationship("User", back_populates="bookmarks")
    news = relationship("FireNews", foreign_keys=[news_id])
    
    # Ensure unique bookmark per user per news item
    __table_args__ = (
        {'mysql_engine': 'InnoDB'}
    ) 