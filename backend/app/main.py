from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Veritabanı ve modelleri içeri aktarıyoruz
from app.db.database import engine, Base
from app.models import user, hub  # hub eklendi
from app.api.v1 import auth, hub  # hub eklendi

# Sunucu başlarken veritabanı tablolarını otomatik oluştur
Base.metadata.create_all(bind=engine)

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Setup CORS Middleware
# This is crucial for Next.js (port 3000) to communicate with FastAPI (port 8000) securely.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from app.api.v1 import auth
# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(hub.router, prefix=f"{settings.API_V1_STR}/hub", tags=["Hub Management"]) # Bu satır eklendi
# Health Check Endpoint
@app.get("/", tags=["Health"])
def read_root():
    return {
        "message": "Welcome to Marketing & Sales Hub API",
        "status": "healthy",
        "version": settings.VERSION
    }