#!/usr/bin/env python3
"""
Script to create test data for FireNewsDashboard
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.db import SessionLocal, engine
from app.models.fire_news import FireNews
from sqlalchemy import text

def create_test_data():
    """Create test fire news entries with different reporters"""
    
    # Test data with different reporters
    test_entries = [
        {
            "title": "Major Wildfire Breaks Out in California Forest",
            "content": "A significant wildfire has erupted in the northern California forest region, prompting evacuations of nearby communities. Firefighters are working around the clock to contain the blaze.",
            "published_date": datetime.now() - timedelta(days=1),
            "url": "https://example.com/news/california-wildfire",
            "source": "California News Network",
            "fire_related_score": 9,
            "verification_result": "verified",
            "verified_at": datetime.now() - timedelta(hours=2),
            "state": "California",
            "county": "Shasta",
            "city": "Redding",
            "province": None,
            "country": "USA",
            "latitude": 40.5865,
            "longitude": -122.3917,
            "image_url": "https://example.com/images/california-fire.jpg",
            "tags": "wildfire,california,evacuation",
            "reporter_name": "Tweet"
        },
        {
            "title": "Firefighters Battle Blaze in Oregon Mountains",
            "content": "Emergency crews are responding to a wildfire in the Oregon mountain range. The fire has already consumed over 500 acres of forest land.",
            "published_date": datetime.now() - timedelta(days=2),
            "url": "https://example.com/news/oregon-fire",
            "source": "Oregon Daily",
            "fire_related_score": 8,
            "verification_result": "pending",
            "verified_at": None,
            "state": "Oregon",
            "county": "Lane",
            "city": "Eugene",
            "province": None,
            "country": "USA",
            "latitude": 44.0521,
            "longitude": -123.0868,
            "image_url": "https://example.com/images/oregon-fire.jpg",
            "tags": "wildfire,oregon,mountains",
            "reporter_name": "Web"
        },
        {
            "title": "Texas Grass Fire Threatens Rural Communities",
            "content": "A fast-moving grass fire in Texas has forced the evacuation of several rural communities. High winds are making firefighting efforts challenging.",
            "published_date": datetime.now() - timedelta(days=3),
            "url": "https://example.com/news/texas-grass-fire",
            "source": "Texas News Today",
            "fire_related_score": 7,
            "verification_result": "verified",
            "verified_at": datetime.now() - timedelta(hours=5),
            "state": "Texas",
            "county": "Travis",
            "city": "Austin",
            "province": None,
            "country": "USA",
            "latitude": 30.2672,
            "longitude": -97.7431,
            "image_url": "https://example.com/images/texas-fire.jpg",
            "tags": "grass fire,texas,evacuation",
            "reporter_name": "Tweet"
        },
        {
            "title": "Arizona Desert Fire Spreads Rapidly",
            "content": "A wildfire in the Arizona desert has spread rapidly due to dry conditions and strong winds. Multiple fire departments are coordinating response efforts.",
            "published_date": datetime.now() - timedelta(days=4),
            "url": "https://example.com/news/arizona-desert-fire",
            "source": "Arizona Republic",
            "fire_related_score": 6,
            "verification_result": "pending",
            "verified_at": None,
            "state": "Arizona",
            "county": "Maricopa",
            "city": "Phoenix",
            "province": None,
            "country": "USA",
            "latitude": 33.4484,
            "longitude": -112.0740,
            "image_url": "https://example.com/images/arizona-fire.jpg",
            "tags": "desert fire,arizona,dry conditions",
            "reporter_name": "Web"
        },
        {
            "title": "Colorado Mountain Fire Update",
            "content": "Firefighters have made progress containing the mountain fire in Colorado. Evacuation orders have been lifted for some areas.",
            "published_date": datetime.now() - timedelta(days=5),
            "url": "https://example.com/news/colorado-fire-update",
            "source": "Denver Post",
            "fire_related_score": 5,
            "verification_result": "verified",
            "verified_at": datetime.now() - timedelta(hours=8),
            "state": "Colorado",
            "county": "Boulder",
            "city": "Boulder",
            "province": None,
            "country": "USA",
            "latitude": 40.0150,
            "longitude": -105.2705,
            "image_url": "https://example.com/images/colorado-fire.jpg",
            "tags": "mountain fire,colorado,containment",
            "reporter_name": "Tweet"
        },
        {
            "title": "New Mexico Forest Fire Investigation",
            "content": "Authorities are investigating the cause of a forest fire in New Mexico. The fire has been contained but damage assessment is ongoing.",
            "published_date": datetime.now() - timedelta(days=6),
            "url": "https://example.com/news/new-mexico-investigation",
            "source": "Albuquerque Journal",
            "fire_related_score": 4,
            "verification_result": "pending",
            "verified_at": None,
            "state": "New Mexico",
            "county": "Bernalillo",
            "city": "Albuquerque",
            "province": None,
            "country": "USA",
            "latitude": 35.0844,
            "longitude": -106.6504,
            "image_url": "https://example.com/images/new-mexico-fire.jpg",
            "tags": "forest fire,new mexico,investigation",
            "reporter_name": "Web"
        },
        {
            "title": "Utah Canyon Fire Emergency Response",
            "content": "Emergency responders are working to control a fire in a Utah canyon. The fire is threatening several hiking trails and campgrounds.",
            "published_date": datetime.now() - timedelta(days=7),
            "url": "https://example.com/news/utah-canyon-fire",
            "source": "Salt Lake Tribune",
            "fire_related_score": 8,
            "verification_result": "verified",
            "verified_at": datetime.now() - timedelta(hours=3),
            "state": "Utah",
            "county": "Salt Lake",
            "city": "Salt Lake City",
            "province": None,
            "country": "USA",
            "latitude": 40.7608,
            "longitude": -111.8910,
            "image_url": "https://example.com/images/utah-fire.jpg",
            "tags": "canyon fire,utah,emergency",
            "reporter_name": "Tweet"
        },
        {
            "title": "Nevada Desert Fire Containment",
            "content": "Firefighters have successfully contained a desert fire in Nevada. The fire burned through 200 acres before being brought under control.",
            "published_date": datetime.now() - timedelta(days=8),
            "url": "https://example.com/news/nevada-fire-contained",
            "source": "Las Vegas Review-Journal",
            "fire_related_score": 3,
            "verification_result": "verified",
            "verified_at": datetime.now() - timedelta(hours=12),
            "state": "Nevada",
            "county": "Clark",
            "city": "Las Vegas",
            "province": None,
            "country": "USA",
            "latitude": 36.1699,
            "longitude": -115.1398,
            "image_url": "https://example.com/images/nevada-fire.jpg",
            "tags": "desert fire,nevada,containment",
            "reporter_name": "Web"
        }
    ]
    
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_count = db.query(FireNews).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} entries. Skipping test data creation.")
            return
        
        # Create test entries
        for entry_data in test_entries:
            fire_news = FireNews(**entry_data)
            db.add(fire_news)
        
        db.commit()
        print(f"Successfully created {len(test_entries)} test entries:")
        print("- Tweet reporter: 4 entries")
        print("- Web reporter: 4 entries")
        print("\nTest data includes entries with different:")
        print("- Fire related scores (3-9)")
        print("- Verification status (verified/pending)")
        print("- States (California, Oregon, Texas, Arizona, Colorado, New Mexico, Utah, Nevada)")
        print("- Publication dates (last 8 days)")
        
    except Exception as e:
        print(f"Error creating test data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating test data for FireNewsDashboard...")
    create_test_data()
    print("Done!") 