from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import get_db
from app.models.tag import Tag
from app.models.fire_news_tag import FireNewsTag
from app.schemas.tag import TagCreate, TagUpdate, Tag as TagSchema, TagList
from app.models.user import User
from app.services.auth_service import get_current_user

router = APIRouter()

@router.get("/tags", response_model=TagList)
def get_tags(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str = Query(None),
    category: str = Query(None),
    is_active: bool = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get all tags with pagination and filtering"""
    query = db.query(Tag)
    
    if search:
        query = query.filter(Tag.name.ilike(f"%{search}%"))
    
    if category:
        query = query.filter(Tag.category == category)
    
    if is_active is not None:
        query = query.filter(Tag.is_active == is_active)
    
    total = query.count()
    tags = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return TagList(tags=tags, total=total)

@router.get("/tags/search")
def search_tags(
    db: Session = Depends(get_db),
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    """Search tags by name for autocomplete"""
    tags = db.query(Tag).filter(
        Tag.name.ilike(f"%{q}%"),
        Tag.is_active == True
    ).limit(limit).all()
    
    return [{"id": tag.id, "name": tag.name, "category": tag.category, "color": tag.color} for tag in tags]

@router.get("/tags/categories")
def get_tag_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all unique tag categories"""
    categories = db.query(Tag.category).filter(
        Tag.category.isnot(None),
        Tag.is_active == True
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]

@router.post("/tags", response_model=TagSchema)
def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new tag"""
    # Check if tag name already exists
    existing_tag = db.query(Tag).filter(Tag.name == tag.name).first()
    if existing_tag:
        raise HTTPException(status_code=400, detail="Tag name already exists")
    
    db_tag = Tag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.put("/tags/{tag_id}", response_model=TagSchema)
def update_tag(
    tag_id: int,
    tag_update: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a tag"""
    db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    update_data = tag_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tag, field, value)
    
    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.delete("/tags/{tag_id}")
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a tag (soft delete by setting is_active to False)"""
    db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Soft delete - set is_active to False
    db_tag.is_active = False
    db.commit()
    
    return {"message": "Tag deleted successfully"}

@router.get("/fire-news/{news_id}/tags")
def get_fire_news_tags(
    news_id: int,
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user)  # Temporarily disabled for debugging
):
    """Get tags for a specific fire news entry"""
    try:
        # First check if the fire news entry exists
        from app.models.fire_news import FireNews
        fire_news = db.query(FireNews).filter(FireNews.id == news_id).first()
        if not fire_news:
            return []
        
        # Get tags for this fire news entry
        tags = db.query(Tag).join(FireNewsTag).filter(
            FireNewsTag.fire_news_id == news_id,
            Tag.is_active == True
        ).all()
        
        return [{"id": tag.id, "name": tag.name, "category": tag.category, "color": tag.color} for tag in tags]
    except Exception as e:
        print(f"Error in get_fire_news_tags: {e}")
        # Return empty list on error instead of crashing
        return []

@router.post("/fire-news/{news_id}/tags")
def add_tags_to_fire_news(
    news_id: int,
    tag_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add tags to a fire news entry"""
    # Check if fire news exists
    from app.models.fire_news import FireNews
    fire_news = db.query(FireNews).filter(FireNews.id == news_id).first()
    if not fire_news:
        raise HTTPException(status_code=404, detail="Fire news not found")
    
    # Check if tags exist and are active
    tags = db.query(Tag).filter(Tag.id.in_(tag_ids), Tag.is_active == True).all()
    if len(tags) != len(tag_ids):
        raise HTTPException(status_code=400, detail="Some tags not found or inactive")
    
    # Remove existing tags for this fire news
    db.query(FireNewsTag).filter(FireNewsTag.fire_news_id == news_id).delete()
    
    # Add new tags
    for tag_id in tag_ids:
        fire_news_tag = FireNewsTag(fire_news_id=news_id, tag_id=tag_id)
        db.add(fire_news_tag)
    
    db.commit()
    return {"message": "Tags updated successfully"}

@router.delete("/fire-news/{news_id}/tags")
def remove_tags_from_fire_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove all tags from a fire news entry"""
    db.query(FireNewsTag).filter(FireNewsTag.fire_news_id == news_id).delete()
    db.commit()
    return {"message": "All tags removed successfully"} 