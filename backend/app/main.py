import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Veritabanı ve modelleri içeri aktarıyoruz
from app.db.database import engine, Base
from app.models import user, hub
from app.api.v1 import auth, hub 
from app.models import user, hub, account  # account eklendi
from app.api.v1 import auth, hub, account  # account eklendi

# Sunucu başlarken veritabanı tablolarını otomatik oluştur
Base.metadata.create_all(bind=engine)

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Setup CORS Middleware
# Fetch the frontend URL from environment variables and add it to allowed origins
allowed_origins = list(settings.BACKEND_CORS_ORIGINS)
frontend_url = os.getenv("FRONTEND_URL")

if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(hub.router, prefix=f"{settings.API_V1_STR}/hub", tags=["Hub Management"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(hub.router, prefix=f"{settings.API_V1_STR}/hub", tags=["Hub Management"])
app.include_router(account.router, prefix=f"{settings.API_V1_STR}/accounts", tags=["Account Details"])

# Health Check Endpoint
@app.get("/", tags=["Health"])
def read_root():
    return {
        "message": "Welcome to Marketing & Sales Hub API",
        "status": "healthy",
        "version": settings.VERSION
    }