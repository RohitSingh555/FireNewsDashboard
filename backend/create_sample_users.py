#!/usr/bin/env python3
"""
Script to create sample users with different roles for FireNewsDashboard
"""

import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.db import SessionLocal
from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog, ActivityType
from app.services.auth_service import AuthService

def create_sample_users():
    """Create sample users with different roles"""
    
    auth_service = AuthService()
    
    # Sample users data
    sample_users = [
        {
            "email": "admin@firenews.com",
            "password": "admin123",
            "username": "admin",
            "first_name": "Admin",
            "last_name": "User",
            "role": UserRole.ADMIN,
            "is_active": True
        },
        {
            "email": "reporter1@firenews.com",
            "password": "reporter123",
            "username": "reporter1",
            "first_name": "John",
            "last_name": "Reporter",
            "role": UserRole.REPORTER,
            "is_active": True
        },
        {
            "email": "reporter2@firenews.com",
            "password": "reporter123",
            "username": "reporter2",
            "first_name": "Sarah",
            "last_name": "Journalist",
            "role": UserRole.REPORTER,
            "is_active": True
        },
        {
            "email": "user1@firenews.com",
            "password": "user123",
            "username": "user1",
            "first_name": "Mike",
            "last_name": "Reader",
            "role": UserRole.USER,
            "is_active": True
        },
        {
            "email": "user2@firenews.com",
            "password": "user123",
            "username": "user2",
            "first_name": "Lisa",
            "last_name": "Viewer",
            "role": UserRole.USER,
            "is_active": True
        },
        {
            "email": "inactive@firenews.com",
            "password": "user123",
            "username": "inactive",
            "first_name": "Inactive",
            "last_name": "User",
            "role": UserRole.USER,
            "is_active": False
        }
    ]
    
    db = SessionLocal()
    try:
        # Create sample users
        created_users = []
        for user_data in sample_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if existing_user:
                print(f"User {user_data['email']} already exists, skipping...")
                continue
            
            # Hash the password
            hashed_password = auth_service.get_password_hash(user_data["password"])
            
            # Create user
            user = User(
                email=user_data["email"],
                username=user_data["username"],
                hashed_password=hashed_password,
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                role=user_data["role"],
                is_active=user_data["is_active"]
            )
            db.add(user)
            db.flush()  # Get the user ID
            
            # Create activity log for user creation
            activity_log = ActivityLog(
                user_id=user.id,
                action_type=ActivityType.USER_CREATED,
                description=f"User {user_data['email']} created with role {user_data['role'].value}",
                details=f"Created by system with username: {user_data['username']}"
            )
            db.add(activity_log)
            created_users.append(user)
        
        db.commit()
        print(f"Successfully created {len(created_users)} new sample users:")
        
        if created_users:
            print("\nAdmin Users:")
            admin_users = [u for u in created_users if u.role == UserRole.ADMIN]
            for user in admin_users:
                print(f"  - {user.email} (username: {user.username})")
            
            print("\nReporter Users:")
            reporter_users = [u for u in created_users if u.role == UserRole.REPORTER]
            for user in reporter_users:
                print(f"  - {user.email} (username: {user.username})")
            
            print("\nRegular Users:")
            regular_users = [u for u in created_users if u.role == UserRole.USER]
            for user in regular_users:
                print(f"  - {user.email} (username: {user.username})")
            
            print(f"\nActivity logs created for each user creation.")
        
        print("\nLogin Credentials:")
        print("Admin: admin@firenews.com / admin123")
        print("Reporter: reporter1@firenews.com / reporter123")
        print("User: user1@firenews.com / user123")
        
    except Exception as e:
        print(f"Error creating sample users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating sample users for FireNewsDashboard...")
    create_sample_users()
    print("Done!") 