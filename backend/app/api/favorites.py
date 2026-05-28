from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Knife, Favorite
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.get("/")
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить список избранных ножей текущего пользователя"""
    favorites = db.query(Knife).join(Favorite).filter(Favorite.user_id == current_user.id).all()
    return favorites

@router.post("/{knife_id}", status_code=status.HTTP_201_CREATED)
def add_to_favorites(
    knife_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Добавить нож в избранное"""
    # Проверяем, существует ли нож
    knife = db.query(Knife).filter(Knife.id == knife_id).first()
    if not knife:
        raise HTTPException(status_code=404, detail="Knife not found")
    
    # Проверяем, не добавлен ли уже
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.knife_id == knife_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")
    
    favorite = Favorite(user_id=current_user.id, knife_id=knife_id)
    db.add(favorite)
    db.commit()
    return {"message": "Added to favorites"}

@router.delete("/{knife_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_favorites(
    knife_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удалить нож из избранного"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.knife_id == knife_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Not in favorites")
    
    db.delete(favorite)
    db.commit()