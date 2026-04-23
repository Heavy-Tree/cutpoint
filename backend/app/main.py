from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.api import auth, knives

# Создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CutPoint API", version="1.0.0")

# CORS настройки — ЭТО ВАЖНО ДЛЯ ФРОНТЕНДА
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite по умолчанию
        "http://localhost:3000",   # React по умолчанию
        "http://localhost:8000",   # Бэкенд
    ],
    allow_credentials=True,
    allow_methods=["*"],           # Разрешить все методы (GET, POST, PUT, DELETE)
    allow_headers=["*"],           # Разрешить все заголовки
)

# Регистрация роутеров
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(knives.router, prefix="/api/knives", tags=["knives"])

@app.get("/")
def root():
    return {"message": "Welcome to CutPoint API", "docs": "/docs"}