from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.core.security import require_admin
from app.models.diet import Diet
from app.schemas import DietCreate, DietOut

router = APIRouter()


@router.get("/", response_model=list[DietOut])
async def list_diets(breed_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db)):
    query = select(Diet)
    if breed_id:
        query = query.where(Diet.breed_id == breed_id)
    result = await db.execute(query)
    return [DietOut.model_validate(d) for d in result.scalars().all()]


@router.post("/", response_model=DietOut, status_code=201)
async def create_diet(data: DietCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    diet = Diet(**data.model_dump())
    db.add(diet)
    await db.commit()
    await db.refresh(diet)
    return DietOut.model_validate(diet)


@router.put("/{diet_id}", response_model=DietOut)
async def update_diet(diet_id: int, data: DietCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(Diet).where(Diet.id == diet_id))
    diet = result.scalar_one_or_none()
    if not diet:
        raise HTTPException(status_code=404, detail="Diet not found")
    for key, value in data.model_dump().items():
        setattr(diet, key, value)
    await db.commit()
    await db.refresh(diet)
    return DietOut.model_validate(diet)
