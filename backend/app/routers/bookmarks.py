from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import get_db
from app.models.bookmark import Bookmark
from app.models.user import User
from app.models.fire_news import FireNews
from app.services.auth_service import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/bookmarks", tags=["bookmarks"])

class BookmarkCreate(BaseModel):
    news_id: int
    data_type: str  # 'fire_news' or 'emergency_911'

class BookmarkResponse(BaseModel):
    id: int
    user_id: int
    news_id: int
    data_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class BookmarkWithNewsResponse(BaseModel):
    id: int
    user_id: int
    news_id: int
    data_type: str
    created_at: datetime
    news: dict  # Will contain the news item data
    
    class Config:
        from_attributes = True

@router.post("/", response_model=BookmarkResponse)
async def create_bookmark(
    bookmark: BookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new bookmark for the current user"""
    
    # Check if news item exists
    news_item = db.query(FireNews).filter(FireNews.id == bookmark.news_id).first()
    if not news_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News item not found"
        )
    
    # Check if bookmark already exists
    existing_bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.news_id == bookmark.news_id,
        Bookmark.data_type == bookmark.data_type
    ).first()
    
    if existing_bookmark:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bookmark already exists"
        )
    
    # Create new bookmark
    new_bookmark = Bookmark(
        user_id=current_user.id,
        news_id=bookmark.news_id,
        data_type=bookmark.data_type
    )
    
    db.add(new_bookmark)
    db.commit()
    db.refresh(new_bookmark)
    
    return new_bookmark

@router.get("/", response_model=List[BookmarkWithNewsResponse])
async def get_user_bookmarks(
    data_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all bookmarks for the current user"""
    
    query = db.query(Bookmark).filter(Bookmark.user_id == current_user.id)
    
    if data_type:
        query = query.filter(Bookmark.data_type == data_type)
    
    bookmarks = query.all()
    
    # Get the news data for each bookmark
    result = []
    for bookmark in bookmarks:
        news_item = db.query(FireNews).filter(FireNews.id == bookmark.news_id).first()
        if news_item:
            bookmark_dict = bookmark.__dict__.copy()
            bookmark_dict['news'] = {
                'id': news_item.id,
                'title': news_item.title,
                'content': news_item.content,
                'published_date': news_item.published_date,
                'incident_date': news_item.incident_date,
                'url': news_item.url,
                'source': news_item.source,
                'fire_related_score': news_item.fire_related_score,
                'verification_result': news_item.verification_result,
                'state': news_item.state,
                'county': news_item.county,
                'city': news_item.city,
                'province': news_item.province,
                'country': news_item.country,
                'latitude': news_item.latitude,
                'longitude': news_item.longitude,
                'image_url': news_item.image_url,
                'tags': news_item.tags,
                'reporter_name': news_item.reporter_name,
                'incident_type': news_item.incident_type,
                'priority_level': news_item.priority_level,
                'response_time': news_item.response_time,
                'units_dispatched': news_item.units_dispatched,
                'status': news_item.status,
                'notes': news_item.notes,
                'is_verified': news_item.is_verified,
                'is_hidden': news_item.is_hidden,
                'created_at': news_item.created_at,
                'updated_at': news_item.updated_at,
                'data_type': news_item.data_type
            }
            result.append(bookmark_dict)
    
    return result

@router.delete("/{bookmark_id}")
async def delete_bookmark(
    bookmark_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a bookmark"""
    
    bookmark = db.query(Bookmark).filter(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == current_user.id
    ).first()
    
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )
    
    db.delete(bookmark)
    db.commit()
    
    return {"message": "Bookmark deleted successfully"}

@router.delete("/news/{news_id}")
async def delete_bookmark_by_news_id(
    news_id: int,
    data_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a bookmark by news ID and data type"""
    
    bookmark = db.query(Bookmark).filter(
        Bookmark.news_id == news_id,
        Bookmark.user_id == current_user.id,
        Bookmark.data_type == data_type
    ).first()
    
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )
    
    db.delete(bookmark)
    db.commit()
    
    return {"message": "Bookmark deleted successfully"}

@router.get("/check/{news_id}")
async def check_bookmark_status(
    news_id: int,
    data_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if a news item is bookmarked by the current user"""
    
    bookmark = db.query(Bookmark).filter(
        Bookmark.news_id == news_id,
        Bookmark.user_id == current_user.id,
        Bookmark.data_type == data_type
    ).first()
    
    return {"is_bookmarked": bookmark is not None, "bookmark_id": bookmark.id if bookmark else None} 