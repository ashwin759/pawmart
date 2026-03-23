from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base


class Breed(Base):
    __tablename__ = "breeds"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), default="Dogs", index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    origin = Column(String(100), nullable=True)
    size = Column(String(50), nullable=True)        # Small, Medium, Large
    weight = Column(String(50), nullable=True)       # e.g. "25-35 kg"
    lifespan = Column(String(50), nullable=True)     # e.g. "10-12 years"
    temperament = Column(String(500), nullable=True)
    activity_level = Column(String(50), nullable=True)  # Low, Moderate, High
    breed_group = Column(String(100), nullable=True)    # Sporting, Herding, etc.
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
