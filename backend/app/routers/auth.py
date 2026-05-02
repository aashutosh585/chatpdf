from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..database import get_db
from ..models.user import UserCreate, UserLogin, UserResponse, UserInDB, hash_password, verify_password
from ..utils.auth import create_access_token, verify_token
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId

router = APIRouter()
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_doc = await db.users.find_one({"_id": ObjectId(payload["id"])})
    if user_doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserInDB(**user_doc, id=user_doc["_id"])

@router.post("/register")
async def register(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    normalized_email = user.email.lower().strip()

    # Check if user already exists
    existing_user = await db.users.find_one({"email": normalized_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists with this email"
        )

    # Hash password
    hashed_password = hash_password(user.password)

    # Create user document
    user_doc = {
        "name": user.name.strip(),
        "email": normalized_email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = await db.users.insert_one(user_doc)

    # Generate JWT token
    token = create_access_token(data={"id": str(result.inserted_id), "email": normalized_email})

    return {
        "success": True,
        "message": "Registration successful",
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "name": user.name,
            "email": normalized_email
        }
    }

@router.post("/login")
async def login(user_credentials: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    normalized_email = user_credentials.email.lower().strip()

    # Find user by email
    user_doc = await db.users.find_one({"email": normalized_email})
    if user_doc is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found. Please sign up first."
        )

    # Check password
    if not verify_password(user_credentials.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please try again."
        )

    # Generate JWT token
    token = create_access_token(data={"id": str(user_doc["_id"]), "email": user_doc["email"]})

    return {
        "success": True,
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(user_doc["_id"]),
            "name": user_doc["name"],
            "email": user_doc["email"]
        }
    }

@router.get("/me")
async def get_current_user_info(current_user: UserInDB = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "id": str(current_user.id),
            "name": current_user.name,
            "email": current_user.email
        }
    }

@router.post("/logout")
async def logout(current_user: UserInDB = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}