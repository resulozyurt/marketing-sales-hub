from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class HubCategory(Base):
    __tablename__ = "hub_categories"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    color = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)  # NEW: Sıralama sütunu eklendi
    links = relationship("HubLink", back_populates="category", cascade="all, delete-orphan")

class HubLink(Base):
    __tablename__ = "hub_links"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(String, ForeignKey("hub_categories.id"))
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    category = relationship("HubCategory", back_populates="links")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=False)