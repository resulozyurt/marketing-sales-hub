from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.hub import HubCategory, HubLink, SystemSetting
from app.schemas.hub import (
    HubCategoryCreate, HubCategoryResponse, HubCategoryUpdate,
    HubLinkCreate, HubLinkResponse, HubLinkUpdate,
    SystemSettingBase, SystemSettingResponse
)

router = APIRouter()

# ==========================================
# CATEGORY ENDPOINTS
# ==========================================
@router.get("/categories", response_model=List[HubCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(HubCategory).all()

@router.post("/categories", response_model=HubCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category_in: HubCategoryCreate, db: Session = Depends(get_db)):
    db_category = db.query(HubCategory).filter(HubCategory.id == category_in.id).first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category with this ID already exists")
    new_category = HubCategory(**category_in.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.put("/categories/{category_id}", response_model=HubCategoryResponse)
def update_category(category_id: str, category_in: HubCategoryUpdate, db: Session = Depends(get_db)):
    db_category = db.query(HubCategory).filter(HubCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: str, db: Session = Depends(get_db)):
    db_category = db.query(HubCategory).filter(HubCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()

# ==========================================
# LINK ENDPOINTS
# ==========================================
@router.post("/categories/{category_id}/links", response_model=HubLinkResponse, status_code=status.HTTP_201_CREATED)
def create_link(category_id: str, link_in: HubLinkCreate, db: Session = Depends(get_db)):
    db_category = db.query(HubCategory).filter(HubCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    new_link = HubLink(**link_in.model_dump(), category_id=category_id)
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    return new_link

@router.put("/links/{link_id}", response_model=HubLinkResponse)
def update_link(link_id: int, link_in: HubLinkUpdate, db: Session = Depends(get_db)):
    db_link = db.query(HubLink).filter(HubLink.id == link_id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    update_data = link_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_link, key, value)
        
    db.commit()
    db.refresh(db_link)
    return db_link

@router.delete("/links/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_link(link_id: int, db: Session = Depends(get_db)):
    db_link = db.query(HubLink).filter(HubLink.id == link_id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")
    db.delete(db_link)
    db.commit()

# ==========================================
# SYSTEM SETTINGS ENDPOINTS
# ==========================================
@router.get("/settings", response_model=List[SystemSettingResponse])
def get_settings(db: Session = Depends(get_db)):
    return db.query(SystemSetting).all()

@router.post("/settings", response_model=SystemSettingResponse)
def set_setting(setting_in: SystemSettingBase, db: Session = Depends(get_db)):
    db_setting = db.query(SystemSetting).filter(SystemSetting.key == setting_in.key).first()
    if db_setting:
        db_setting.value = setting_in.value  # Varsa güncelle
    else:
        db_setting = SystemSetting(key=setting_in.key, value=setting_in.value) # Yoksa oluştur
        db.add(db_setting)
    
    db.commit()
    db.refresh(db_setting)
    return db_setting