from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.api import auth, knives, favorites, categories  # ← добавил categories

# Создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CutPoint API", version="1.0.0")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://cutpoint-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация роутеров
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(knives.router, prefix="/api/knives", tags=["knives"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["favorites"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])  # ← добавил

@app.get("/")
def root():
    return {"message": "Welcome to CutPoint API", "docs": "/docs"}