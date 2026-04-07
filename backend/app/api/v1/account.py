from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.account import AccountDetail
from app.schemas.account import AccountDetailCreate, AccountDetailUpdate, AccountDetailResponse

router = APIRouter()

@router.get("/", response_model=List[AccountDetailResponse])
def get_accounts(db: Session = Depends(get_db)):
    # Order by newest first
    return db.query(AccountDetail).order_by(AccountDetail.id.desc()).all()

@router.post("/", response_model=AccountDetailResponse, status_code=status.HTTP_201_CREATED)
def create_account(account_in: AccountDetailCreate, db: Session = Depends(get_db)):
    new_account = AccountDetail(**account_in.model_dump())
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account

@router.put("/{account_id}", response_model=AccountDetailResponse)
def update_account(account_id: int, account_in: AccountDetailUpdate, db: Session = Depends(get_db)):
    db_account = db.query(AccountDetail).filter(AccountDetail.id == account_id).first()
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    update_data = account_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_account, key, value)
        
    db.commit()
    db.refresh(db_account)
    return db_account

@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    db_account = db.query(AccountDetail).filter(AccountDetail.id == account_id).first()
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(db_account)
    db.commit()