#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.db import SessionLocal
from app.models.tag import Tag

def create_sample_tags():
    db = SessionLocal()
    try:
        # Sample tags with categories
        sample_tags = [
            # Fire Type
            {"name": "Wildfire", "category": "fire_type", "description": "Large uncontrolled fire in natural areas", "color": "#FF6B35"},
            {"name": "Structure Fire", "category": "fire_type", "description": "Fire in buildings or structures", "color": "#FF4757"},
            {"name": "Vehicle Fire", "category": "fire_type", "description": "Fire involving vehicles", "color": "#FF3838"},
            {"name": "Brush Fire", "category": "fire_type", "description": "Small vegetation fire", "color": "#FF6348"},
            
            # Severity
            {"name": "High Priority", "category": "severity", "description": "Urgent fire requiring immediate attention", "color": "#FF0000"},
            {"name": "Medium Priority", "category": "severity", "description": "Moderate fire situation", "color": "#FFA500"},
            {"name": "Low Priority", "category": "severity", "description": "Minor fire incident", "color": "#FFFF00"},
            
            # Location Type
            {"name": "Residential", "category": "location", "description": "Fire in residential areas", "color": "#4ECDC4"},
            {"name": "Commercial", "category": "location", "description": "Fire in commercial buildings", "color": "#45B7D1"},
            {"name": "Industrial", "category": "location", "description": "Fire in industrial facilities", "color": "#96CEB4"},
            {"name": "Forest", "category": "location", "description": "Fire in forest areas", "color": "#8B4513"},
            {"name": "Urban", "category": "location", "description": "Fire in urban areas", "color": "#708090"},
            
            # Response Type
            {"name": "Evacuation", "category": "response", "description": "Evacuation orders issued", "color": "#FF1493"},
            {"name": "Contained", "category": "response", "description": "Fire has been contained", "color": "#32CD32"},
            {"name": "Under Control", "category": "response", "description": "Fire is under control", "color": "#00FF00"},
            {"name": "Extinguished", "category": "response", "description": "Fire has been extinguished", "color": "#008000"},
            
            # Weather Related
            {"name": "Drought", "category": "weather", "description": "Drought conditions contributing to fire", "color": "#DAA520"},
            {"name": "High Winds", "category": "weather", "description": "High winds affecting fire spread", "color": "#87CEEB"},
            {"name": "Lightning", "category": "weather", "description": "Lightning-caused fire", "color": "#FFD700"},
            
            # Emergency Services
            {"name": "Fire Department", "category": "services", "description": "Fire department response", "color": "#FF4500"},
            {"name": "Police", "category": "services", "description": "Police involvement", "color": "#0000FF"},
            {"name": "EMS", "category": "services", "description": "Emergency medical services", "color": "#FF69B4"},
            {"name": "National Guard", "category": "services", "description": "National Guard deployment", "color": "#228B22"},
        ]
        
        for tag_data in sample_tags:
            # Check if tag already exists
            existing_tag = db.query(Tag).filter(Tag.name == tag_data["name"]).first()
            if not existing_tag:
                tag = Tag(**tag_data)
                db.add(tag)
                print(f"Created tag: {tag_data['name']}")
            else:
                print(f"Tag already exists: {tag_data['name']}")
        
        db.commit()
        print("Sample tags created successfully!")
        
    except Exception as e:
        print(f"Error creating sample tags: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_tags() 