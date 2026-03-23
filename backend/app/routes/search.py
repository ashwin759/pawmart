from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.core.database import get_db
from app.models.pet import Pet
from app.models.breed import Breed
from app.schemas import PetOut, BreedOut

router = APIRouter()

SIZE_ORDER = {"Small": 1, "Medium": 2, "Large": 3}
ACTIVITY_ORDER = {"Low": 1, "Moderate": 2, "High": 3}


@router.get("/", response_model=list[PetOut])
async def smart_search(q: str = Query(..., min_length=1), db: AsyncSession = Depends(get_db)):
    pattern = f"%{q.lower()}%"
    query = (
        select(Pet, Breed.name.label("breed_name"))
        .outerjoin(Breed, Pet.breed_id == Breed.id)
        .where(
            or_(
                func.lower(Pet.name).like(pattern),
                func.lower(Breed.name).like(pattern),
                func.lower(Breed.temperament).like(pattern),
                func.lower(Breed.size).like(pattern),
                func.lower(Pet.description).like(pattern),
            )
        )
        .limit(20)
    )
    result = await db.execute(query)
    return [
        PetOut(
            id=pet.id, name=pet.name, breed_id=pet.breed_id, age=pet.age,
            price=pet.price, gender=pet.gender, availability=pet.availability,
            image_url=pet.image_url, description=pet.description, breed_name=breed_name,
        )
        for pet, breed_name in result.all()
    ]


@router.get("/recommendations/{breed_id}", response_model=list[BreedOut])
async def get_recommendations(breed_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Breed).where(Breed.id == breed_id))
    target = result.scalar_one_or_none()
    if not target:
        return []

    result = await db.execute(select(Breed).where(Breed.id != breed_id))
    all_breeds = result.scalars().all()

    def similarity_score(breed: Breed) -> int:
        score = 0
        if breed.breed_group and target.breed_group and breed.breed_group == target.breed_group:
            score += 3
        if breed.size and target.size and breed.size == target.size:
            score += 2
        if breed.activity_level and target.activity_level and breed.activity_level == target.activity_level:
            score += 1
        if breed.temperament and target.temperament:
            t1 = set(t.strip().lower() for t in target.temperament.split(","))
            t2 = set(t.strip().lower() for t in breed.temperament.split(","))
            score += len(t1 & t2)
        return score

    ranked = sorted(all_breeds, key=similarity_score, reverse=True)[:5] # type: ignore
    return [BreedOut.model_validate(b) for b in ranked]
