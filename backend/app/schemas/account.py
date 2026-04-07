from pydantic import BaseModel
from typing import Optional

class AccountDetailBase(BaseModel):
    platform: str
    login_type: str
    mail_address: Optional[str] = None
    username: Optional[str] = None
    password: str

class AccountDetailCreate(AccountDetailBase):
    pass

class AccountDetailUpdate(BaseModel):
    platform: Optional[str] = None
    login_type: Optional[str] = None
    mail_address: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None

class AccountDetailResponse(AccountDetailBase):
    id: int

    class Config:
        from_attributes = True