from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import json

class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    role: Role
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class KnifeCreate(BaseModel):
    name: str = Field(..., min_length=3)
    price: float = Field(..., gt=0)
    description: Optional[str] = None
    steel: str = Field(..., min_length=1)
    blade_length: Optional[int] = Field(None, gt=0)
    total_length: Optional[int] = Field(None, gt=0)
    handle_material: Optional[str] = None
    in_stock: bool = True
    images: List[str] = []

class KnifeResponse(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    description: Optional[str]
    steel: str
    blade_length: Optional[int]
    total_length: Optional[int]
    handle_material: Optional[str]
    in_stock: bool
    images: List[str]
    views: int
    created_at: datetime
    
    @field_validator('images', mode='before')
    @classmethod
    def parse_images(cls, v):
        """Конвертирует строку из БД в список Python"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                if v.startswith('["') and v.endswith('"]'):
                    return json.loads(v)
                return []
        return v
    
    class Config:
        from_attributes = True

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True