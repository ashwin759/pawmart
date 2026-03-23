from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.order import Order
from app.models.pet import Pet
from app.models.user import User
from app.schemas import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter()


@router.post("/", response_model=OrderOut, status_code=201)
async def create_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Pet).where(Pet.id == data.pet_id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    if not pet.availability:
        raise HTTPException(status_code=400, detail="Pet is not available")

    order = Order(
        user_id=current_user.id,
        pet_id=pet.id,
        total_price=pet.price,
        status="pending",
        notes=data.notes,
    )
    db.add(order)
    pet.availability = False
    await db.commit()
    await db.refresh(order)
    return OrderOut(
        id=order.id, user_id=order.user_id, pet_id=order.pet_id,
        total_price=order.total_price, status=order.status,
        order_date=order.order_date, notes=order.notes,
        pet_name=pet.name, user_name=current_user.name,
    )


@router.get("/", response_model=list[OrderOut])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Order, Pet.name.label("pet_name"), User.name.label("user_name"))
        .outerjoin(Pet, Order.pet_id == Pet.id)
        .outerjoin(User, Order.user_id == User.id)
    )
    if current_user.role != "admin":
        query = query.where(Order.user_id == current_user.id)
    query = query.order_by(Order.order_date.desc())
    result = await db.execute(query)
    return [
        OrderOut(
            id=o.id, user_id=o.user_id, pet_id=o.pet_id,
            total_price=o.total_price, status=o.status,
            order_date=o.order_date, notes=o.notes,
            pet_name=pet_name, user_name=user_name,
        )
        for o, pet_name, user_name in result.all()
    ]


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = data.status

    if data.status == "rejected":
        pet_result = await db.execute(select(Pet).where(Pet.id == order.pet_id))
        pet = pet_result.scalar_one_or_none()
        if pet:
            pet.availability = True

    await db.commit()
    await db.refresh(order)
    return OrderOut(
        id=order.id, user_id=order.user_id, pet_id=order.pet_id,
        total_price=order.total_price, status=order.status,
        order_date=order.order_date, notes=order.notes,
    )
