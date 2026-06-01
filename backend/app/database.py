import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

DATABASE_URL = settings.DATABASE_URL

connect_args = {}
if DATABASE_URL and "ssl=require" in DATABASE_URL:
    connect_args = {"ssl": {"ca": None}}  # Используем стандартный SSL

engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=5,
    connect_args=connect_args if connect_args else None
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()