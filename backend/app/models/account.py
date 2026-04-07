from sqlalchemy import Column, Integer, String
from app.db.database import Base

class AccountDetail(Base):
    __tablename__ = "account_details"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, nullable=False)
    login_type = Column(String, nullable=False)
    mail_address = Column(String, nullable=True)
    username = Column(String, nullable=True)
    password = Column(String, nullable=False)