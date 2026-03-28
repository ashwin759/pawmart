from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
import os
import uuid

from app.core.database import get_db
from app.core.security import require_admin
from app.models.pet import Pet
from app.models.breed import Breed
from app.models.pet_image import PetImage
from app.schemas import PetCreate, PetOut, PetImageOut

router = APIRouter()

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def _get_extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


async def _build_pet_out(pet, breed_name, db: AsyncSession) -> PetOut:
    """Build PetOut with gallery images."""
    img_result = await db.execute(
        select(PetImage)
        .where(PetImage.pet_id == pet.id)
        .order_by(PetImage.sort_order)
    )
    images = img_result.scalars().all()
    gallery = [
        PetImageOut(
            id=img.id, pet_id=img.pet_id, image_url=img.image_url,
            is_primary=img.is_primary, sort_order=img.sort_order,
        )
        for img in images
    ]
    return PetOut(
        id=pet.id, name=pet.name, breed_id=pet.breed_id, age=pet.age,
        price=pet.price, gender=pet.gender, availability=pet.availability,
        image_url=pet.image_url, description=pet.description,
        breed_name=breed_name, gallery_images=gallery,
    )


@router.get("/", response_model=list[PetOut])
async def list_pets(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    category: Optional[str] = None,
    breed_id: Optional[int] = None,
    gender: Optional[str] = None,
    available: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Pet, Breed.name.label("breed_name")).outerjoin(Breed, Pet.breed_id == Breed.id)

    if category:
        query = query.where(Pet.category.ilike(category))
    if breed_id:
        query = query.where(Pet.breed_id == breed_id)
    if gender:
        query = query.where(Pet.gender == gender)
    if available is not None:
        query = query.where(Pet.availability == available)
    if min_price is not None:
        query = query.where(Pet.price >= min_price)
    if max_price is not None:
        query = query.where(Pet.price <= max_price)

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    rows = result.all()
    # For list views, skip gallery images for performance
    return [
        PetOut(
            id=pet.id, name=pet.name, breed_id=pet.breed_id, age=pet.age,
            price=pet.price, gender=pet.gender, availability=pet.availability,
            image_url=pet.image_url, description=pet.description, breed_name=breed_name,
        )
        for pet, breed_name in rows
    ]


@router.get("/count")
async def pets_count(
    category: Optional[str] = None,
    breed_id: Optional[int] = None,
    gender: Optional[str] = None,
    available: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(func.count(Pet.id))
    if category:
        query = query.where(Pet.category.ilike(category))
    if breed_id:
        query = query.where(Pet.breed_id == breed_id)
    if gender:
        query = query.where(Pet.gender == gender)
    if available is not None:
        query = query.where(Pet.availability == available)
    result = await db.execute(query)
    return {"count": result.scalar()}


@router.get("/{pet_id}", response_model=PetOut)
async def get_pet(pet_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Pet, Breed.name.label("breed_name"))
        .outerjoin(Breed, Pet.breed_id == Breed.id)
        .where(Pet.id == pet_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Pet not found")
    pet, breed_name = row
    return await _build_pet_out(pet, breed_name, db)


@router.post("/", response_model=PetOut, status_code=201)
async def create_pet(data: PetCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    pet = Pet(**data.model_dump())
    db.add(pet)
    await db.commit()
    await db.refresh(pet)
    return PetOut(**pet.__dict__, breed_name=None)


@router.put("/{pet_id}", response_model=PetOut)
async def update_pet(pet_id: int, data: PetCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(Pet).where(Pet.id == pet_id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    for key, value in data.model_dump().items():
        setattr(pet, key, value)
    await db.commit()
    await db.refresh(pet)
    return PetOut(**pet.__dict__, breed_name=None)


@router.delete("/{pet_id}")
async def delete_pet(pet_id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(Pet).where(Pet.id == pet_id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    await db.delete(pet)
    await db.commit()
    return {"message": "Pet deleted"}


# ── Pet Image Gallery Endpoints ──

@router.post("/{pet_id}/image")
async def upload_pet_image(
    pet_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    result = await db.execute(select(Pet).where(Pet.id == pet_id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    ext = _get_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed. Use JPG, PNG, or WEBP.")

    content = await file.read()
    assert isinstance(content, bytes), "File content must be bytes"
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 5MB.")

    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads", filename)
    with open(filepath, "wb") as f:
        f.write(content)

    pet.image_url = f"/uploads/{filename}"
    await db.commit()
    return {"image_url": pet.image_url}


@router.post("/{pet_id}/images", response_model=list[PetImageOut])
async def upload_pet_gallery_images(
    pet_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    """Upload multiple gallery photos for a pet."""
    result = await db.execute(select(Pet).where(Pet.id == pet_id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    # Get current max sort_order
    max_order_result = await db.execute(
        select(func.coalesce(func.max(PetImage.sort_order), 0))
        .where(PetImage.pet_id == pet_id)
    )
    current_max = max_order_result.scalar()

    uploaded = []
    pet_dir = os.path.join("uploads", "pets", str(pet_id))
    os.makedirs(pet_dir, exist_ok=True)

    for idx, file in enumerate(files):
        ext = _get_extension(file.filename)
        if ext not in ALLOWED_EXTENSIONS:
            continue  # Skip invalid files silently

        content = await file.read()
        assert isinstance(content, bytes), "File content must be bytes"
        if len(content) > MAX_FILE_SIZE:
            continue  # Skip oversized files

        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(pet_dir, filename)
        with open(filepath, "wb") as f:
            f.write(content)

        pet_image = PetImage(
            pet_id=pet_id,
            image_url=f"/uploads/pets/{pet_id}/{filename}",
            is_primary=(idx == 0 and current_max == 0),
            sort_order=current_max + idx + 1,
        )
        db.add(pet_image)
        await db.flush()
        uploaded.append(PetImageOut(
            id=pet_image.id, pet_id=pet_image.pet_id,
            image_url=pet_image.image_url, is_primary=pet_image.is_primary,
            sort_order=pet_image.sort_order,
        ))

    await db.commit()
    return uploaded


@router.get("/{pet_id}/images", response_model=list[PetImageOut])
async def list_pet_images(pet_id: int, db: AsyncSession = Depends(get_db)):
    """List all gallery images for a pet."""
    result = await db.execute(
        select(PetImage)
        .where(PetImage.pet_id == pet_id)
        .order_by(PetImage.sort_order)
    )
    images = result.scalars().all()
    return [
        PetImageOut(
            id=img.id, pet_id=img.pet_id, image_url=img.image_url,
            is_primary=img.is_primary, sort_order=img.sort_order,
        )
        for img in images
    ]


@router.delete("/{pet_id}/images/{image_id}")
async def delete_pet_image(
    pet_id: int,
    image_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    """Delete a gallery image by ID."""
    result = await db.execute(
        select(PetImage).where(PetImage.id == image_id, PetImage.pet_id == pet_id)
    )
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    # Delete file from disk
    filepath = image.image_url.lstrip("/")
    if os.path.exists(filepath):
        os.remove(filepath)

    await db.delete(image)
    await db.commit()
    return {"message": "Image deleted"}
