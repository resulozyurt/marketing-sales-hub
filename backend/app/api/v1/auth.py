import re
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt

from app.db.database import get_db
from app.core.config import settings
from app.core.security import verify_password, create_access_token, get_password_hash
from app.services import user_service
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.token import Token
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="The user with this email already exists.")
    user = user_service.create_user(db, user_in)
    return user

@router.post("/login", response_model=Token)
def login_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = user_service.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.", headers={"WWW-Authenticate": "Bearer"})
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user.")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(db: Session, request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header: return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return db.query(User).filter(User.email == payload.get("sub")).first()
    except Exception:
        return None

@router.get("/me", response_model=UserResponse)
def read_user_me(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(db, request)
    if not user: raise HTTPException(status_code=404, detail="User not found.")
    return user

@router.put("/me", response_model=UserResponse)
def update_user_me(user_in: UserUpdate, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(db, request)
    if not user: raise HTTPException(status_code=404, detail="User not found.")
    
    if user_in.email and user_in.email != user.email:
        if db.query(User).filter(User.email == user_in.email).first():
            raise HTTPException(status_code=400, detail="This email is already in use.")
        user.email = user_in.email

    if user_in.username:
        if user.username and user.username != user_in.username:
            raise HTTPException(status_code=400, detail="Username cannot be changed once set.")
        if not re.match(r"^[a-z0-9_]+$", user_in.username):
            raise HTTPException(status_code=400, detail="Username must be lowercase, no spaces, no Turkish chars.")
        user.username = user_in.username

    if user_in.full_name is not None: user.full_name = user_in.full_name
    if user_in.profile_image is not None: user.profile_image = user_in.profile_image
    if user_in.password: user.hashed_password = get_password_hash(user_in.password)
    
    db.commit()
    db.refresh(user)
    return user