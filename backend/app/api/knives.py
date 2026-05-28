from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Knife, Category
from typing import List
import json

from app.database import get_db
from app.models import Knife, User
from app.schemas import KnifeCreate, KnifeResponse
from app.utils.dependencies import get_current_admin

router = APIRouter()

def slugify(text: str) -> str:
    return text.lower().replace(" ", "-").replace("ё", "e")[:190]

@router.get("/", response_model=List[KnifeResponse])
def get_knives(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None),
    category: str = Query(None),
    sort_by: str = Query(None),
    db: Session = Depends(get_db)
):
    print(f"Received sort_by: {sort_by}")
    query = db.query(Knife)
    
    # Поиск по названию или описанию
    if search:
        query = query.filter(
            Knife.name.contains(search) | Knife.description.contains(search)
        )
    
    # Фильтр по минимальной цене
    if min_price is not None:
        query = query.filter(Knife.price >= min_price)
    
    # Фильтр по максимальной цене
    if max_price is not None:
        query = query.filter(Knife.price <= max_price)
    
    # Фильтр по категории (поиск по названию категории)
    if category:
        query = query.join(Knife.category).filter(Category.name == category)
    
    if sort_by == "price_asc":
        query = query.order_by(Knife.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Knife.price.desc())
    elif sort_by == "name_asc":
        query = query.order_by(Knife.name.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Knife.name.desc())
    else:
        query = query.order_by(Knife.id.desc())

    knives = query.offset(skip).limit(limit).all()
    return [KnifeResponse.model_validate(k) for k in knives]

@router.get("/{knife_id}", response_model=KnifeResponse)
def get_knife(knife_id: int, db: Session = Depends(get_db)):
    knife = db.query(Knife).filter(Knife.id == knife_id).first()
    if not knife:
        raise HTTPException(status_code=404, detail="Knife not found")
    knife.views += 1
    db.commit()
    db.refresh(knife)
    return KnifeResponse.model_validate(knife)

@router.post("/", response_model=KnifeResponse, status_code=201)
def create_knife(knife_data: KnifeCreate, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    slug = slugify(knife_data.name)
    existing = db.query(Knife).filter(Knife.slug == slug).first()
    if existing:
        slug = f"{slug}-{db.query(Knife).count() + 1}"
    
    new_knife = Knife(
        name=knife_data.name, slug=slug, price=knife_data.price,
        description=knife_data.description, steel=knife_data.steel,
        blade_length=knife_data.blade_length, total_length=knife_data.total_length,
        handle_material=knife_data.handle_material, in_stock=knife_data.in_stock,
        images=json.dumps(knife_data.images)
    )
    db.add(new_knife)
    db.commit()
    db.refresh(new_knife)
    return KnifeResponse.model_validate(new_knife)

@router.put("/{knife_id}", response_model=KnifeResponse)
def update_knife(knife_id: int, knife_data: KnifeCreate, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    knife = db.query(Knife).filter(Knife.id == knife_id).first()
    if not knife:
        raise HTTPException(status_code=404, detail="Knife not found")
    
    knife.name = knife_data.name
    knife.slug = slugify(knife_data.name)
    knife.price = knife_data.price
    knife.description = knife_data.description
    knife.steel = knife_data.steel
    knife.blade_length = knife_data.blade_length
    knife.total_length = knife_data.total_length
    knife.handle_material = knife_data.handle_material
    knife.in_stock = knife_data.in_stock
    knife.images = json.dumps(knife_data.images)
    
    db.commit()
    db.refresh(knife)
    return KnifeResponse.model_validate(knife)

@router.delete("/{knife_id}", status_code=204)
def delete_knife(knife_id: int, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    knife = db.query(Knife).filter(Knife.id == knife_id).first()
    if not knife:
        raise HTTPException(status_code=404, detail="Knife not found")
    db.delete(knife)
    db.commit()