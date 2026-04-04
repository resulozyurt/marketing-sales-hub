from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# SQLite kullanıyorsak "check_same_thread" ayarını False yapmalıyız, PostgreSQL'de buna gerek kalmayacak.
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Veritabanı oturumunu (session) açıp kapatacak bağımlılık (dependency) fonksiyonumuz
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()