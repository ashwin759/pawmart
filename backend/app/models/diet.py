from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base


class Diet(Base):
    __tablename__ = "diets"

    id = Column(Integer, primary_key=True, index=True)
    breed_id = Column(Integer, ForeignKey("breeds.id", ondelete="CASCADE"), nullable=False, index=True)
    age_group = Column(String(50), nullable=False)       # Puppy, Adult, Senior
    food_type = Column(String(200), nullable=False)
    feeding_frequency = Column(String(100), nullable=False)
    water_requirement = Column(String(100), nullable=True)
    notes = Column(String(500), nullable=True)
