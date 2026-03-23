from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Auth ──
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Breed ──
class BreedCreate(BaseModel):
    name: str
    category: str = "Dogs"
    origin: Optional[str] = None
    size: Optional[str] = None
    weight: Optional[str] = None
    lifespan: Optional[str] = None
    temperament: Optional[str] = None
    activity_level: Optional[str] = None
    breed_group: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class BreedOut(BreedCreate):
    id: int

    class Config:
        from_attributes = True


# ── Diet ──
class DietCreate(BaseModel):
    breed_id: int
    age_group: str
    food_type: str
    feeding_frequency: str
    water_requirement: Optional[str] = None
    notes: Optional[str] = None


class DietOut(DietCreate):
    id: int

    class Config:
        from_attributes = True


# ── Pet ──
class PetCreate(BaseModel):
    name: str
    category: str = "Dogs"
    breed_id: Optional[int] = None
    age: Optional[str] = None
    price: float
    gender: Optional[str] = None
    availability: bool = True
    image_url: Optional[str] = None
    description: Optional[str] = None


# ── Pet Image ──
class PetImageOut(BaseModel):
    id: int
    pet_id: int
    image_url: str
    is_primary: bool = False
    sort_order: int = 0

    class Config:
        from_attributes = True


class PetOut(PetCreate):
    id: int
    breed_name: Optional[str] = None
    gallery_images: list[PetImageOut] = []

    class Config:
        from_attributes = True


# ── Order ──
class OrderCreate(BaseModel):
    pet_id: int
    notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str  # confirmed, rejected, completed


class OrderOut(BaseModel):
    id: int
    user_id: int
    pet_id: Optional[int] = None
    total_price: float
    status: str
    order_date: Optional[datetime] = None
    notes: Optional[str] = None
    pet_name: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


# ── AI ──
class AIChatRequest(BaseModel):
    message: str


class AIChatResponse(BaseModel):
    reply: str


class AIRecommendRequest(BaseModel):
    description: str
