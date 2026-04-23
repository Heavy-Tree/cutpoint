from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
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
def get_knives(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    knives = db.query(Knife).offset(skip).limit(limit).all()
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