from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from app.core.database import Base


class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), default="Dogs", index=True)
    name = Column(String(100), nullable=False)
    breed_id = Column(Integer, ForeignKey("breeds.id", ondelete="SET NULL"), nullable=True, index=True)
    age = Column(String(50), nullable=True)           # e.g. "2 years", "6 months"
    price = Column(Float, nullable=False)
    gender = Column(String(20), nullable=True)        # Male / Female
    availability = Column(Boolean, default=True)
    image_url = Column(String(500), nullable=True)
    description = Column(String(500), nullable=True)
