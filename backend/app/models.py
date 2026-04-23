from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum

class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    name = Column(String(100))
    role = Column(Enum(Role), default=Role.USER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Knife(Base):
    __tablename__ = "knives"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text)
    steel = Column(String(100), nullable=False)
    blade_length = Column(Integer)
    total_length = Column(Integer)
    handle_material = Column(String(100))
    in_stock = Column(Boolean, default=True)
    images = Column(String(1000), default="[]")
    views = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())