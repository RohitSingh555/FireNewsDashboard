from fastapi import APIRouter, UploadFile, File, Form, Request, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.excel_upload import ExcelUpload
from app.schemas.excel_upload import ExcelUploadCreate, ExcelUploadOut
from app.models.user import User, UserRole
from app.services.auth_service import get_current_user
from app.models.fire_news import FireNews
import os, shutil
from datetime import datetime
from typing import List
from pydantic import BaseModel


router = APIRouter()

UPLOAD_DIR = '/app/uploads'  # Make sure this directory exists in your Docker setup
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Pydantic models for JSON validation
class FireNewsItem(BaseModel):
    title: str
    content: str
    published_date: str = None
    url: str = None
    source: str = None
    fire_related_score: float = 0.8
    verification_result: str = "yes"
    verified_at: str = None
    state: str = None
    county: str = None
    city: str = None
    province: str = None
    country: str = "USA"
    latitude: float = None
    longitude: float = None
    image_url: str = None
    tags: str = None
    reporter_name: str = None

class FireNewsBulkUpload(BaseModel):
    items: List[FireNewsItem]

def parse_datetime(dt_str):
    """Parse datetime string to datetime object"""
    if not dt_str:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(dt_str, fmt)
        except (ValueError, TypeError):
            continue
    return None



@router.post("/excel-uploads", response_model=ExcelUploadOut)
def upload_excel(
    request: Request,
    file: UploadFile = File(...),
    from_url: str = Form(None),
    extra: str = Form(None),
    db: Session = Depends(get_db)
):
    ip_address = request.client.host
    user_agent = request.headers.get('user-agent')
    file_name = file.filename
    
    # Save file to disk
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    save_name = f"{timestamp}_{file_name}"
    file_path = os.path.join(UPLOAD_DIR, save_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    print(f"Saved file: {file_path}, size: {os.path.getsize(file_path)} bytes")
    
    # Create DB record for upload
    upload = ExcelUpload(
        file_name=file_name,
        file_path=file_path,
        from_url=from_url,
        ip_address=ip_address,
        user_agent=user_agent,
        extra=extra,
        created_at=datetime.utcnow()
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    
    return upload 

@router.get("/fire-news")
def get_fire_news(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query('published_date'),
    sort_order: str = Query('desc'),
    county: str = Query(None),
    state: str = Query(None),
    search: str = Query(None),
    reporter_name: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None)
):
    query = db.query(FireNews)
    # Filtering
    if county:
        query = query.filter(FireNews.county == county)
    if state:
        query = query.filter(FireNews.state == state)
    if reporter_name:
        query = query.filter(FireNews.reporter_name == reporter_name)
    
    # Date filtering
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(FireNews.published_date >= start_datetime)
        except ValueError:
            pass  # Ignore invalid date format
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
            # Add one day to include the end date
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            query = query.filter(FireNews.published_date <= end_datetime)
        except ValueError:
            pass  # Ignore invalid date format
    # Search
    if search:
        like = f"%{search}%"
        query = query.filter((FireNews.title.ilike(like)) | (FireNews.content.ilike(like)))
    # Sorting
    sort_col = getattr(FireNews, sort_by, FireNews.published_date)
    if sort_order == 'desc':
        sort_col = sort_col.desc()
    else:
        sort_col = sort_col.asc()
    query = query.order_by(sort_col)
    # Pagination
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "published_date": n.published_date.isoformat() if n.published_date else None,
                "url": n.url,
                "source": n.source,
                "fire_related_score": n.fire_related_score,
                "verification_result": n.verification_result,
                "verified_at": n.verified_at.isoformat() if n.verified_at else None,
                "state": n.state,
                "county": n.county,
                "city": n.city,
                "province": n.province,
                "country": n.country,
                "latitude": n.latitude,
                "longitude": n.longitude,
                "image_url": n.image_url,
                "tags": n.tags,
                "reporter_name": n.reporter_name,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in items
        ]
    }

@router.get("/fire-news/search")
def search_fire_news_by_title(
    db: Session = Depends(get_db),
    title: str = Query(..., description="Search by title"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    query = db.query(FireNews).filter(FireNews.title.ilike(f"%{title}%"))
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "id": n.id,
                "title": n.title,
                "content": n.content,
                "published_date": n.published_date.isoformat() if n.published_date else None,
                "url": n.url,
                "source": n.source,
                "fire_related_score": n.fire_related_score,
                "verification_result": n.verification_result,
                "verified_at": n.verified_at.isoformat() if n.verified_at else None,
                "state": n.state,
                "county": n.county,
                "city": n.city,
                "province": n.province,
                "country": n.country,
                "latitude": n.latitude,
                "longitude": n.longitude,
                "image_url": n.image_url,
                "tags": n.tags,
                "reporter_name": n.reporter_name,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in items
        ]
    }

@router.get("/fire-news/reporters")
def get_reporter_names(db: Session = Depends(get_db)):
    """Get all unique reporter names"""
    reporters = db.query(FireNews.reporter_name).distinct().filter(FireNews.reporter_name.isnot(None)).all()
    return {"reporters": [r[0] for r in reporters]}

@router.delete("/fire-news/delete-all")
def delete_all_fire_news(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete all fire news records - Admin only"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators can delete all records"
        )
    
    try:
        db.query(FireNews).delete()
        db.commit()
        return {"detail": "All fire news records deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting records: {str(e)}")

@router.put("/fire-news/{news_id}")
def update_fire_news(
    news_id: int,
    news_update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a specific fire news entry - Admin and Reporter only"""
    if current_user.role not in [UserRole.ADMIN, UserRole.REPORTER]:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators and reporters can update records"
        )
    
    news = db.query(FireNews).filter(FireNews.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Fire news entry not found")
    
    # Update fields
    for field, value in news_update.items():
        if hasattr(news, field) and field not in ['id', 'created_at']:
            setattr(news, field, value)
    
    db.commit()
    db.refresh(news)
    return news

@router.delete("/fire-news/{news_id}")
def delete_fire_news(
    news_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific fire news entry - Admin and Reporter only"""
    if current_user.role not in [UserRole.ADMIN, UserRole.REPORTER]:
        raise HTTPException(
            status_code=403, 
            detail="Only administrators and reporters can delete records"
        )
    
    news = db.query(FireNews).filter(FireNews.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Fire news entry not found")
    db.delete(news)
    db.commit()
    return {"detail": "Deleted"}

@router.post("/fire-news/bulk-upload")
def bulk_upload_fire_news(
    data: FireNewsBulkUpload,
    db: Session = Depends(get_db)
):
    """Bulk upload fire news from JSON data"""
    try:
        inserted = 0
        skipped = 0
        print(data.items)
        for item in data.items:
            # Parse dates
            print(f"Parsing published_date: {item.published_date}")
            published_date = parse_datetime(item.published_date)
            print(f"Parsed published_date: {published_date}")
            verified_at = parse_datetime(item.verified_at)
            
            # Check for duplicate
            exists = db.query(FireNews).filter(
                FireNews.title == item.title,
                FireNews.published_date == published_date
            ).first()
            
            if exists:
                skipped += 1
                continue  # Skip duplicate
            
            # Create FireNews record
            fire_news = FireNews(
                title=item.title,
                content=item.content,
                published_date=published_date,
                url=item.url,
                source=item.source,
                fire_related_score=item.fire_related_score,
                verification_result=item.verification_result,
                verified_at=verified_at,
                state=item.state,
                county=item.county,
                city=item.city,
                province=item.province,
                country=item.country,
                latitude=item.latitude,
                longitude=item.longitude,
                image_url=item.image_url,
                tags=item.tags,
                reporter_name=item.reporter_name,
            )
            
            db.add(fire_news)
            inserted += 1
        
        db.commit()
        
        return {
            "message": "Bulk upload completed successfully",
            "inserted": inserted,
            "skipped": skipped,
            "total_processed": len(data.items)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error during bulk upload: {str(e)}")

@router.post("/fire-news/test-upload")
def test_upload_fire_news(
    data: FireNewsItem,
    db: Session = Depends(get_db)
):
    """Test upload a single fire news item"""
    try:
        # Parse dates
        print(f"Test upload - Parsing published_date: {data.published_date}")
        published_date = parse_datetime(data.published_date)
        print(f"Test upload - Parsed published_date: {published_date}")
        verified_at = parse_datetime(data.verified_at)
        
        # Create FireNews record
        fire_news = FireNews(
            title=data.title,
            content=data.content,
            published_date=published_date,
            url=data.url,
            source=data.source,
            fire_related_score=data.fire_related_score,
            verification_result=data.verification_result,
            verified_at=verified_at,
            state=data.state,
            county=data.county,
            city=data.city,
            province=data.province,
            country=data.country,
            latitude=data.latitude,
            longitude=data.longitude,
            image_url=data.image_url,
            tags=data.tags,
            reporter_name=data.reporter_name,
        )
        
        db.add(fire_news)
        db.commit()
        db.refresh(fire_news)
        
        return {
            "message": "Test upload successful",
            "id": fire_news.id,
            "title": fire_news.title
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error during test upload: {str(e)}") 