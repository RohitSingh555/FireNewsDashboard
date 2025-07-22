from sqlalchemy import Column, Integer, String, DateTime, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class FireNews(Base):
    __tablename__ = 'fire_news'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    published_date = Column(DateTime(timezone=True), nullable=True)
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
    tags = Column(String(255), nullable=True)
    reporter_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 