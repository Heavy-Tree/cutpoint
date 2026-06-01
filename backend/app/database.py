import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

connect_args = {}
if DATABASE_URL and "ssl=require" in DATABASE_URL:
    connect_args = {"ssl": {"ca": None}}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,  # теперь всегда словарь, не None
    pool_size=5
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()