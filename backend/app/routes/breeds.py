from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import require_admin
from app.models.breed import Breed
from app.schemas import BreedCreate, BreedOut

router = APIRouter()


from typing import Optional

@router.get("/", response_model=list[BreedOut])
async def list_breeds(category: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Breed).order_by(Breed.name)
    if category:
        query = query.where(Breed.category == category.capitalize())
    result = await db.execute(query)
    return [BreedOut.model_validate(b) for b in result.scalars().all()]


@router.get("/{breed_id}", response_model=BreedOut)
async def get_breed(breed_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Breed).where(Breed.id == breed_id))
    breed = result.scalar_one_or_none()
    if not breed:
        raise HTTPException(status_code=404, detail="Breed not found")
    return BreedOut.model_validate(breed)


@router.post("/", response_model=BreedOut, status_code=201)
async def create_breed(data: BreedCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    breed = Breed(**data.model_dump())
    db.add(breed)
    await db.commit()
    await db.refresh(breed)
    return BreedOut.model_validate(breed)


@router.put("/{breed_id}", response_model=BreedOut)
async def update_breed(breed_id: int, data: BreedCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(Breed).where(Breed.id == breed_id))
    breed = result.scalar_one_or_none()
    if not breed:
        raise HTTPException(status_code=404, detail="Breed not found")
    for key, value in data.model_dump().items():
        setattr(breed, key, value)
    await db.commit()
    await db.refresh(breed)
    return BreedOut.model_validate(breed)
