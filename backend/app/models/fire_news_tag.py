from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class FireNewsTag(Base):
    __tablename__ = 'fire_news_tags'
    id = Column(Integer, primary_key=True, index=True)
    fire_news_id = Column(Integer, ForeignKey('fire_news.id', ondelete='CASCADE'), nullable=False)
    tag_id = Column(Integer, ForeignKey('tags.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 