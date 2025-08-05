from fastapi import APIRouter, UploadFile, File, Form, Request, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.excel_upload import ExcelUpload
from app.schemas.excel_upload import ExcelUploadCreate, ExcelUploadOut
from app.models.user import User, UserRole
from app.services.auth_service import get_current_user
from app.services.activity_log_service import get_activity_log_service
from app.models.fire_news import FireNews
import os, shutil
from datetime import datetime
from typing import List
from pydantic import BaseModel
from app.models.activity_log import ActivityType
import pandas as pd
import io


router = APIRouter()

UPLOAD_DIR = '/app/uploads'  # Make sure this directory exists in your Docker setup
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Pydantic models for JSON validation
class FireNewsItem(BaseModel):
    title: str
    content: str
    published_date: str | None = None
    url: str | None = None
    source: str | None = None
    fire_related_score: float = 0.8
    verification_result: str = "yes"
    verified_at: str | None = None
    state: str | None = None
    county: str | None = None
    city: str | None = None
    province: str | None = None
    country: str = "USA"
    latitude: float | None = None
    longitude: float | None = None
    image_url: str | None = None
    tags: str | None = None
    reporter_name: str | None = None
    verifier_feedback: str | None = None
    data_type: str = "fire_news"

class Emergency911Item(BaseModel):
    title: str
    incident_date: str | None = None
    station_name: str | None = None
    city: str | None = None
    county: str | None = None
    address: str | None = None
    context: str | None = None
    verified_address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    address_accuracy_score: float | None = None
    reporter_name: str | None = None
    incident_type: str | None = None
    priority_level: str | None = None
    response_time: int | None = None
    units_dispatched: str | None = None
    status: str | None = None
    notes: str | None = None
    data_type: str = "emergency_911"

class FireNewsBulkUpload(BaseModel):
    items: List[FireNewsItem]

class Emergency911BulkUpload(BaseModel):
    items: List[Emergency911Item]

def parse_datetime(dt_str):
    """Parse datetime string to datetime object with comprehensive format support"""
    if not dt_str:
        return None
    
    # Convert to string if it's not already
    dt_str = str(dt_str).strip()
    
    # Common datetime formats to try
    formats = [
        # ISO formats
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ", 
        "%Y-%m-%dT%H:%M:%S.%f+00:00",
        "%Y-%m-%dT%H:%M:%S+00:00",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        
        # Standard formats
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        
        # Alternative separators
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d",
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y",
        
        # US formats
        "%m-%d-%Y %H:%M:%S",
        "%m-%d-%Y",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y",
        
        # With timezone abbreviations (common in RSS feeds)
        "%Y-%m-%d %H:%M:%S %Z",
        "%a, %d %b %Y %H:%M:%S %Z",
        "%a, %d %b %Y %H:%M:%S",
        "%d %b %Y %H:%M:%S %Z",
        "%d %b %Y %H:%M:%S",
        
        # RFC formats
        "%a, %d %b %Y %H:%M:%S %z",
        "%d %b %Y %H:%M:%S %z",
        
        # Unix timestamp (if it's a number)
        "%s"
    ]
    
    # Try each format
    for fmt in formats:
        try:
            if fmt == "%s":
                # Handle Unix timestamp
                if dt_str.isdigit():
                    return datetime.fromtimestamp(int(dt_str))
            else:
                return datetime.strptime(dt_str, fmt)
        except (ValueError, TypeError, OSError):
            continue
    
    # If all formats fail, try to extract date using regex patterns
    import re
    
    # Pattern for ISO-like dates
    iso_pattern = r'(\d{4})-(\d{1,2})-(\d{1,2})'
    match = re.search(iso_pattern, dt_str)
    if match:
        try:
            year, month, day = match.groups()
            return datetime(int(year), int(month), int(day))
        except (ValueError, TypeError):
            pass
    
    # Pattern for various date formats
    date_patterns = [
        r'(\d{1,2})/(\d{1,2})/(\d{4})',  # MM/DD/YYYY or DD/MM/YYYY
        r'(\d{4})/(\d{1,2})/(\d{1,2})',  # YYYY/MM/DD
        r'(\d{1,2})-(\d{1,2})-(\d{4})',  # MM-DD-YYYY or DD-MM-YYYY
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, dt_str)
        if match:
            try:
                if pattern == r'(\d{1,2})/(\d{1,2})/(\d{4})':
                    # Try both MM/DD/YYYY and DD/MM/YYYY
                    month, day, year = match.groups()
                    try:
                        return datetime(int(year), int(month), int(day))
                    except ValueError:
                        # Try DD/MM/YYYY
                        day, month, year = match.groups()
                        return datetime(int(year), int(month), int(day))
                elif pattern == r'(\d{4})/(\d{1,2})/(\d{1,2})':
                    year, month, day = match.groups()
                    return datetime(int(year), int(month), int(day))
                elif pattern == r'(\d{1,2})-(\d{1,2})-(\d{4})':
                    # Try both MM-DD-YYYY and DD-MM-YYYY
                    month, day, year = match.groups()
                    try:
                        return datetime(int(year), int(month), int(day))
                    except ValueError:
                        # Try DD-MM-YYYY
                        day, month, year = match.groups()
                        return datetime(int(year), int(month), int(day))
            except (ValueError, TypeError):
                continue
    
    print(f"Failed to parse date: {dt_str}")
    return None



@router.post("/excel-uploads", response_model=ExcelUploadOut)
def upload_excel(
    request: Request,
    file: UploadFile = File(...),
    from_url: str = Form(None),
    extra: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    
    # Log Excel upload activity
    activity_log_service = get_activity_log_service(db)
    activity_log_service.log_excel_upload(current_user, file_name, ip_address, user_agent)
    
    return upload 

@router.post("/fire-news/process-excel")
def process_excel_upload(
    file: UploadFile = File(...),
    reporter_name: str = Form(...),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Process Excel file and upload fire news entries with specified reporter name"""
    try:
        # Validate file type
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="Only Excel and CSV files (.xlsx, .xls, .csv) are supported")
        
        # Read file based on type
        content = file.file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        # Handle different column requirements based on reporter name
        if reporter_name == "911":
            # For 911 emergency data, use different column validation
            required_columns = ['Date', 'Station Name', 'City', 'County', 'Address', 'Context']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Missing required columns for 911 data: {', '.join(missing_columns)}"
                )
        else:
            # For regular fire news data
            required_columns = ['title', 'content']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Missing required columns: {', '.join(missing_columns)}"
                )
        
        # Convert DataFrame to list of dictionaries
        items = []
        inserted = 0
        skipped = 0
        
        for index, row in df.iterrows():
            try:
                if reporter_name == "911":
                    # Process 911 emergency data
                    # Create title from station name and date
                    station_name = str(row.get('Station Name', '')).strip()
                    date_str = str(row.get('Date', '')).strip()
                    title = f"911 Emergency - {station_name} - {date_str}"
                    
                    # Create content from context
                    context = str(row.get('Context', '')).strip()
                    content = context if context else f"Emergency call from {station_name}"
                    
                    # Check for duplicate based on station name and date
                    incident_date = parse_datetime(date_str)
                    exists = db.query(FireNews).filter(
                        FireNews.station_name == station_name,
                        FireNews.incident_date == incident_date,
                        FireNews.data_type == 'emergency_911'
                    ).first()
                    
                    if exists:
                        skipped += 1
                        continue  # Skip duplicate
                    
                    # Create FireNews record for 911 emergency data
                    fire_news = FireNews(
                        title=title,
                        content=content,
                        incident_date=incident_date,
                        station_name=station_name,
                        city=str(row.get('City', '')) if pd.notna(row.get('City')) else None,
                        county=str(row.get('County', '')) if pd.notna(row.get('County')) else None,
                        address=str(row.get('Address', '')) if pd.notna(row.get('Address')) else None,
                        context=context,
                        verified_address=str(row.get('Verified Address', '')) if pd.notna(row.get('Verified Address')) else None,
                        latitude=float(row.get('Lat', 0)) if pd.notna(row.get('Lat')) else None,
                        longitude=float(row.get('Long', 0)) if pd.notna(row.get('Long')) else None,
                        address_accuracy_score=float(row.get('Address Accuracy Score', 0)) if pd.notna(row.get('Address Accuracy Score')) else None,
                        reporter_name=reporter_name,
                        data_type='emergency_911'
                    )
                else:
                    # Process regular fire news data
                    # Create FireNewsItem with reporter_name from form
                    item = FireNewsItem(
                        title=str(row.get('title', '')).strip(),
                        content=str(row.get('content', '')).strip(),
                        published_date=str(row.get('published_date', '')) if pd.notna(row.get('published_date')) else None,
                        url=str(row.get('url', '')) if pd.notna(row.get('url')) else None,
                        source=str(row.get('source', '')) if pd.notna(row.get('source')) else None,
                        fire_related_score=float(row.get('fire_related_score', 0.8)) if pd.notna(row.get('fire_related_score')) else 0.8,
                        verification_result=str(row.get('verification_result', 'yes')) if pd.notna(row.get('verification_result')) else 'yes',
                        verified_at=str(row.get('verified_at', '')) if pd.notna(row.get('verified_at')) else None,
                        state=str(row.get('state', '')) if pd.notna(row.get('state')) else None,
                        county=str(row.get('county', '')) if pd.notna(row.get('county')) else None,
                        city=str(row.get('city', '')) if pd.notna(row.get('city')) else None,
                        province=str(row.get('province', '')) if pd.notna(row.get('province')) else None,
                        country=str(row.get('country', 'USA')) if pd.notna(row.get('country')) else 'USA',
                        latitude=float(row.get('latitude')) if pd.notna(row.get('latitude')) else None,
                        longitude=float(row.get('longitude')) if pd.notna(row.get('longitude')) else None,
                        image_url=str(row.get('image_url', '')) if pd.notna(row.get('image_url')) else None,
                        tags=str(row.get('tags', '')) if pd.notna(row.get('tags')) else None,
                        reporter_name=reporter_name,  # Use the reporter name from form
                        verifier_feedback=str(row.get('verifier_feedback', '')) if pd.notna(row.get('verifier_feedback')) else None
                    )
                    
                    # Check for duplicate
                    published_date = parse_datetime(item.published_date)
                    exists = db.query(FireNews).filter(
                        FireNews.title == item.title,
                        FireNews.published_date == published_date
                    ).first()
                    
                    if exists:
                        skipped += 1
                        continue  # Skip duplicate
                    
                    # Create FireNews record for regular fire news
                    fire_news = FireNews(
                        title=item.title,
                        content=item.content,
                        published_date=published_date,
                        url=item.url,
                        source=item.source,
                        fire_related_score=item.fire_related_score,
                        verification_result=item.verification_result,
                        verified_at=parse_datetime(item.verified_at),
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
                        data_type='fire_news'
                    )
                
                db.add(fire_news)
                inserted += 1
                
            except Exception as e:
                print(f"Error processing row {index + 1}: {str(e)}")
                skipped += 1
                continue
        
        db.commit()
        
        # Log Excel processing activity (without user authentication)
        ip_address = request.client.host if request else None
        user_agent = request.headers.get('user-agent') if request else None
        activity_log_service = get_activity_log_service(db)
        activity_log_service.create_activity_log(
            action_type=ActivityType.NEWS_UPLOADED,
            description=f"Excel file processed: {inserted} items inserted, {skipped} skipped",
            user_id=None,  # No user authentication required
            details=f"Excel upload with reporter '{reporter_name}': {inserted} new items, {skipped} skipped",
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return {
            "message": "Excel file processed successfully",
            "inserted": inserted,
            "skipped": skipped,
            "total_processed": len(df),
            "reporter_name": reporter_name
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing Excel file: {str(e)}")

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
    end_date: str = Query(None),
    is_hidden: bool = Query(None),
    status: str = Query(None),
    is_verified: bool = Query(None)
):
    # If reporter_name is "911", redirect to the 911 emergency endpoint
    if reporter_name == "911":
        return get_911_emergency_data(
            db=db,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
            county=county,
            state=state,
            search=search,
            start_date=start_date,
            end_date=end_date,
            is_hidden=is_hidden
        )
    
    query = db.query(FireNews)
    # Filtering
    if county:
        query = query.filter(FireNews.county == county)
    if state:
        query = query.filter(FireNews.state == state)
    if reporter_name:
        query = query.filter(FireNews.reporter_name == reporter_name)
    if is_hidden is not None:
        query = query.filter(FireNews.is_hidden == is_hidden)
    if status:
        query = query.filter(FireNews.status == status)
    if is_verified is not None:
        query = query.filter(FireNews.is_verified == is_verified)
    
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
        query = query.filter(
            (FireNews.title.ilike(like)) | 
            (FireNews.content.ilike(like)) | 
            (FireNews.state.ilike(like))
        )
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
                "is_verified": getattr(n, 'is_verified', False),
                "is_hidden": getattr(n, 'is_hidden', False),
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
                "is_verified": getattr(n, 'is_verified', False),
                "is_hidden": getattr(n, 'is_hidden', False),
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
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user)  # Temporarily disabled for testing
):
    """Delete all fire news records - Admin only"""
    # Temporarily disabled authentication for development
    # if current_user.role != UserRole.ADMIN:
    #     raise HTTPException(
    #         status_code=403, 
    #         detail="Only administrators can delete all records"
    #     )
    
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
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user)  # Temporarily disabled for testing
):
    """Delete a specific fire news entry - Admin and Reporter only"""
    # Temporarily disabled authentication for development
    # if current_user.role not in [UserRole.ADMIN, UserRole.REPORTER]:
    #     raise HTTPException(
    #         status_code=403, 
    #         detail="Only administrators and reporters can delete records"
    #     )
    
    news = db.query(FireNews).filter(FireNews.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Fire news entry not found")
    db.delete(news)
    db.commit()
    return {"detail": "Deleted"}

@router.put("/fire-news/{news_id}/toggle-verified")
def toggle_verified_status(
    news_id: int,
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user)  # Temporarily disabled for testing
):
    """Toggle the verified status of a fire news entry"""
    news = db.query(FireNews).filter(FireNews.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Fire news not found")
    
    # Toggle the verified status
    news.is_verified = not getattr(news, 'is_verified', False)
    news.verified_at = datetime.utcnow() if news.is_verified else None
    
    db.commit()
    db.refresh(news)
    
    return {
        "message": f"Fire news {'verified' if news.is_verified else 'unverified'} successfully",
        "is_verified": news.is_verified
    }

@router.put("/fire-news/{news_id}/toggle-hidden")
def toggle_hidden_status(
    news_id: int,
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user)  # Temporarily disabled for testing
):
    """Toggle the hidden status of a fire news entry"""
    news = db.query(FireNews).filter(FireNews.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Fire news not found")
    
    # Toggle the hidden status
    news.is_hidden = not getattr(news, 'is_hidden', False)
    
    db.commit()
    db.refresh(news)
    
    return {
        "message": f"Fire news {'hidden' if news.is_hidden else 'shown'} successfully",
        "is_hidden": news.is_hidden
    }

@router.post("/fire-news/bulk-upload")
def bulk_upload_fire_news(
    data: FireNewsBulkUpload,
    request: Request,
    db: Session = Depends(get_db)
):
    """Bulk upload fire news from JSON data"""
    try:
        inserted = 0
        skipped = 0
        print(data.items)
        for item in data.items:
            # Parse dates
            # print(f"Parsing published_date: {item.published_date}")
            published_date = parse_datetime(item.published_date)
            # print(f"Parsed published_date: {published_date}")
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
        
        # Log bulk upload activity (without user authentication)
        ip_address = request.client.host
        user_agent = request.headers.get('user-agent')
        activity_log_service = get_activity_log_service(db)
        activity_log_service.create_activity_log(
            action_type=ActivityType.NEWS_UPLOADED,
            description=f"Bulk upload completed: {inserted} items inserted, {skipped} skipped",
            user_id=None,  # No user authentication required
            details=f"Bulk upload: {inserted} new items, {skipped} duplicates",
            ip_address=ip_address,
            user_agent=user_agent
        )
        
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
    request: Request,
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
        
        # Log test upload activity
        ip_address = request.client.host
        user_agent = request.headers.get('user-agent')
        activity_log_service = get_activity_log_service(db)
        activity_log_service.create_activity_log(
            action_type=ActivityType.NEWS_UPLOADED,
            description=f"Test upload: {data.title}",
            user_id=None,  # No user authentication required for test upload
            details=f"Test upload: {data.title}",
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return {
            "message": "Test upload successful",
            "id": fire_news.id,
            "title": fire_news.title
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error during test upload: {str(e)}") 

@router.get("/fire-news/all-leads")
def get_all_leads(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query('published_date'),
    sort_order: str = Query('desc'),
    county: str = Query(None),
    state: str = Query(None),
    search: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    status: str = Query(None),
    is_verified: bool = Query(None)
):
    """Get all non-hidden fire news entries (excluding 911 emergency data) with proper pagination"""
    query = db.query(FireNews).filter(
        FireNews.is_hidden == False,
        FireNews.data_type != 'emergency_911'
    )
    
    # Filtering
    if county:
        query = query.filter(FireNews.county == county)
    if state:
        query = query.filter(FireNews.state == state)
    if is_verified is not None:
        query = query.filter(FireNews.is_verified == is_verified)
    
    # Date filtering
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(FireNews.published_date >= start_datetime)
        except ValueError:
            pass
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            query = query.filter(FireNews.published_date <= end_datetime)
        except ValueError:
            pass
    
    # Search
    if search:
        like = f"%{search}%"
        query = query.filter(
            (FireNews.title.ilike(like)) | 
            (FireNews.content.ilike(like)) | 
            (FireNews.state.ilike(like))
        )
    
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
                "is_verified": getattr(n, 'is_verified', False),
                "is_hidden": getattr(n, 'is_hidden', False),
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in items
        ]
    }

@router.get("/fire-news/tweet")
def get_tweet_news(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query('published_date'),
    sort_order: str = Query('desc'),
    county: str = Query(None),
    state: str = Query(None),
    search: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    status: str = Query(None),
    is_verified: bool = Query(None)
):
    """Get Twitter Fire Detection Bot entries with proper pagination"""
    query = db.query(FireNews).filter(
        FireNews.reporter_name == 'Twitter Fire Detection Bot',
        FireNews.is_hidden == False
    )
    
    # Filtering
    if county:
        query = query.filter(FireNews.county == county)
    if state:
        query = query.filter(FireNews.state == state)
    if is_verified is not None:
        query = query.filter(FireNews.is_verified == is_verified)
    
    # Date filtering
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(FireNews.published_date >= start_datetime)
        except ValueError:
            pass
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            query = query.filter(FireNews.published_date <= end_datetime)
        except ValueError:
            pass
    
    # Search
    if search:
        like = f"%{search}%"
        query = query.filter(
            (FireNews.title.ilike(like)) | 
            (FireNews.content.ilike(like)) | 
            (FireNews.state.ilike(like))
        )
    
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
                "is_verified": getattr(n, 'is_verified', False),
                "is_hidden": getattr(n, 'is_hidden', False),
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in items
        ]
    }

@router.get("/fire-news/web")
def get_web_news(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query('published_date'),
    sort_order: str = Query('desc'),
    county: str = Query(None),
    state: str = Query(None),
    search: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    status: str = Query(None),
    is_verified: bool = Query(None)
):
    """Get web entries (non-Twitter, non-hidden, non-911) with proper pagination"""
    query = db.query(FireNews).filter(
        FireNews.reporter_name != 'Twitter Fire Detection Bot',
        FireNews.reporter_name != '911',
        FireNews.data_type != 'emergency_911',
        FireNews.is_hidden == False
    )
    
    # Filtering
    if county:
        query = query.filter(FireNews.county == county)
    if state:
        query = query.filter(FireNews.state == state)
    if is_verified is not None:
        query = query.filter(FireNews.is_verified == is_verified)
    
    # Date filtering
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(FireNews.published_date >= start_datetime)
        except ValueError:
            pass
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            query = query.filter(FireNews.published_date <= end_datetime)
        except ValueError:
            pass
    
    # Search
    if search:
        like = f"%{search}%"
        query = query.filter(
            (FireNews.title.ilike(like)) | 
            (FireNews.content.ilike(like)) | 
            (FireNews.state.ilike(like))
        )
    
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
                "is_verified": getattr(n, 'is_verified', False),
                "is_hidden": getattr(n, 'is_hidden', False),
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in items
        ]
    }

@router.get("/fire-news/hidden")
def get_hidden_news(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query('published_date'),
    sort_order: str = Query('desc'),
    county: str = Query(None),
    state: str = Query(None),
    search: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    status: str = Query(None),
    is_verified: bool = Query(None)
):
    """Get hidden fire news entries with proper pagination"""
    query = db.query(FireNews).filter(FireNews.is_hidden == True)
    
    # Filtering
    if county:
        query = query.filter(FireNews.county == county)
    if state:
        query = query.filter(FireNews.state == state)
    if is_verified is not None:
        query = query.filter(FireNews.is_verified == is_verified)
    
    # Date filtering
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(FireNews.published_date >= start_datetime)
        except ValueError:
            pass
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            query = query.filter(FireNews.published_date <= end_datetime)
        except ValueError:
            pass
    
    # Search
    if search:
        like = f"%{search}%"
        query = query.filter(
            (FireNews.title.ilike(like)) | 
            (FireNews.content.ilike(like)) | 
            (FireNews.state.ilike(like))
        )
    
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
                "is_verified": getattr(n, 'is_verified', False),
                "is_hidden": getattr(n, 'is_hidden', False),
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in items
        ]
    } 

@router.get("/fire-news/others")
def get_others_news(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query('published_date'),
    sort_order: str = Query('desc'),
    county: str = Query(None),
    state: str = Query(None),
    search: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    status: str = Query(None),
    is_verified: bool = Query(None)
):
    """Get fire news entries where reporter_name is empty or null"""
    query = db.query(FireNews).filter(
        (FireNews.reporter_name.is_(None)) | 
        (FireNews.reporter_name == '') | 
        (FireNews.reporter_name == 'null')
    )
    
    # Filtering
    if county:
        query = query.filter(FireNews.county == county)
    if state:
        query = query.filter(FireNews.state == state)
    if is_verified is not None:
        query = query.filter(FireNews.is_verified == is_verified)
    
    # Date filtering
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(FireNews.published_date >= start_datetime)
        except ValueError:
            pass
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            query = query.filter(FireNews.published_date <= end_datetime)
        except ValueError:
            pass
    
    # Search
    if search:
        like = f"%{search}%"
        query = query.filter(
            (FireNews.title.ilike(like)) | 
            (FireNews.content.ilike(like)) | 
            (FireNews.state.ilike(like))
        )
    
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
                "is_verified": getattr(n, 'is_verified', False),
                "is_hidden": getattr(n, 'is_hidden', False),
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in items
        ]
    } 

@router.get("/fire-news/others-count")
def get_others_count(db: Session = Depends(get_db)):
    """Get count of fire news entries where reporter_name is empty or null"""
    count = db.query(FireNews).filter(
        (FireNews.reporter_name.is_(None)) | 
        (FireNews.reporter_name == '') | 
        (FireNews.reporter_name == 'null')
    ).count()
    return {"count": count}

@router.get("/fire-news/911")
def get_911_emergency_data(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query('incident_date'),
    sort_order: str = Query('desc'),
    county: str = Query(None),
    state: str = Query(None),
    search: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    is_hidden: bool = Query(None),
    status: str = Query(None)
):
    """Get 911 emergency data entries"""
    query = db.query(FireNews).filter(FireNews.data_type == 'emergency_911')
    
    # Filtering
    if county:
        query = query.filter(FireNews.county == county)
    if state:
        query = query.filter(FireNews.state == state)
    if is_hidden is not None:
        query = query.filter(FireNews.is_hidden == is_hidden)
    else:
        # By default, exclude hidden entries
        query = query.filter(FireNews.is_hidden == False)
    if status:
        query = query.filter(FireNews.status == status)
    
    # Date filtering - use incident_date for 911 data
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(FireNews.incident_date >= start_datetime)
        except ValueError:
            pass
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            query = query.filter(FireNews.incident_date <= end_datetime)
        except ValueError:
            pass
    
    # Search
    if search:
        like = f"%{search}%"
        query = query.filter(
            (FireNews.title.ilike(like)) | 
            (FireNews.context.ilike(like)) | 
            (FireNews.station_name.ilike(like)) |
            (FireNews.address.ilike(like)) |
            (FireNews.state.ilike(like))
        )
    
    # Sorting - handle both incident_date and published_date
    if sort_by == 'incident_date':
        sort_col = FireNews.incident_date
    elif sort_by == 'published_date':
        sort_col = FireNews.published_date
    else:
        sort_col = getattr(FireNews, sort_by, FireNews.incident_date)
    
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
                "incident_date": n.incident_date.isoformat() if n.incident_date else None,
                "station_name": n.station_name,
                "city": n.city,
                "county": n.county,
                "address": n.address,
                "context": n.context,
                "verified_address": n.verified_address,
                "latitude": n.latitude,
                "longitude": n.longitude,
                "address_accuracy_score": n.address_accuracy_score,
                "reporter_name": n.reporter_name,
                "incident_type": n.incident_type,
                "priority_level": n.priority_level,
                "response_time": n.response_time,
                "units_dispatched": n.units_dispatched,
                "status": n.status,
                "notes": n.notes,
                "is_verified": getattr(n, 'is_verified', False),
                "is_hidden": getattr(n, 'is_hidden', False),
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in items
        ]
    } 


@router.post("/fire-news/add-911-reporter")
def add_911_reporter(db: Session = Depends(get_db)):
    """Add a test record with reporter name '911' to make it available in the reporter list"""
    try:
        # Check if "911" reporter already exists
        existing_911 = db.query(FireNews).filter(FireNews.reporter_name == "911").first()
        if existing_911:
            return {"message": "Reporter '911' already exists", "status": "exists"}
        
        # Create a test record with reporter name "911"
        test_record = FireNews(
            title="Test 911 Emergency Record",
            content="This is a test record to add the '911' reporter name to the system.",
            reporter_name="911",
            data_type="emergency_911",
            is_hidden=True  # Hide it so it doesn't show up in normal queries
        )
        
        db.add(test_record)
        db.commit()
        db.refresh(test_record)
        
        return {
            "message": "Reporter '911' added successfully", 
            "status": "created",
            "record_id": test_record.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding 911 reporter: {str(e)}") 