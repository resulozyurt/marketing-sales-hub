from pydantic import BaseModel
from typing import List, Optional

# --- LINK SCHEMAS ---
class HubLinkBase(BaseModel):
    name: str
    url: str

class HubLinkCreate(HubLinkBase):
    pass

class HubLinkUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    category_id: Optional[str] = None

class HubLinkResponse(HubLinkBase):
    id: int
    category_id: str
    class Config:
        from_attributes = True

# --- CATEGORY SCHEMAS ---
class HubCategoryBase(BaseModel):
    id: str
    title: str
    icon: str
    color: str
    sort_order: int = 0  # NEW: Şemaya eklendi

class HubCategoryCreate(HubCategoryBase):
    pass

class HubCategoryUpdate(BaseModel):
    title: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    sort_order: Optional[int] = None  # NEW: Güncelleme şemasına eklendi

class HubCategoryResponse(HubCategoryBase):
    links: List[HubLinkResponse] = []
    class Config:
        from_attributes = True

# --- SYSTEM SETTINGS SCHEMAS ---
class SystemSettingBase(BaseModel):
    key: str
    value: str

class SystemSettingResponse(SystemSettingBase):
    class Config:
        from_attributes = True