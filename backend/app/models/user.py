from sqlalchemy import Boolean, Column, Integer, String, DateTime
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # YENİ EKLENEN ALANLAR
    username = Column(String, unique=True, index=True, nullable=True)
    profile_image = Column(String, nullable=True) # Resim URL'si veya base64 tutulabilir