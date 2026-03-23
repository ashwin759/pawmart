from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id", ondelete="SET NULL"), nullable=True)
    total_price = Column(Float, nullable=False)
    status = Column(String(30), default="pending")  # pending, confirmed, rejected, completed
    order_date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String(500), nullable=True)
