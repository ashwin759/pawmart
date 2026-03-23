"""Seed the database with sample breeds, diets, and pets."""
import asyncio
from sqlalchemy import select
from app.core.database import engine, async_session, Base
from app.models import Breed, Diet, Pet, User
from app.core.security import hash_password

BREEDS = [
    {
        "name": "Golden Retriever", "origin": "Scotland", "size": "Large",
        "weight": "25-34 kg", "lifespan": "10-12 years",
        "temperament": "Friendly, Intelligent, Devoted, Reliable",
        "activity_level": "High", "breed_group": "Sporting",
        "description": "A large, friendly breed known for their golden coat and gentle temperament. They are one of the most popular family dogs in the world.",
    },
    {
        "name": "Labrador Retriever", "origin": "Canada", "size": "Large",
        "weight": "25-36 kg", "lifespan": "10-12 years",
        "temperament": "Friendly, Active, Outgoing, Gentle",
        "activity_level": "High", "breed_group": "Sporting",
        "description": "The most popular dog breed, known for their friendly nature and versatility as family pets, service dogs, and retrievers.",
    },
    {
        "name": "German Shepherd", "origin": "Germany", "size": "Large",
        "weight": "22-40 kg", "lifespan": "9-13 years",
        "temperament": "Confident, Courageous, Smart, Loyal",
        "activity_level": "High", "breed_group": "Herding",
        "description": "A highly intelligent and versatile breed, often used as working dogs in police and military roles.",
    },
    {
        "name": "French Bulldog", "origin": "France", "size": "Small",
        "weight": "8-13 kg", "lifespan": "10-12 years",
        "temperament": "Playful, Adaptable, Smart, Affectionate",
        "activity_level": "Low", "breed_group": "Non-Sporting",
        "description": "A small, muscular breed with a smooth coat and distinctive bat ears. Perfect for apartment living.",
    },
    {
        "name": "Poodle", "origin": "Germany/France", "size": "Medium",
        "weight": "20-32 kg", "lifespan": "12-15 years",
        "temperament": "Intelligent, Active, Alert, Faithful",
        "activity_level": "Moderate", "breed_group": "Non-Sporting",
        "description": "One of the smartest dog breeds, known for their curly hypoallergenic coat and elegant appearance.",
    },
    {
        "name": "Beagle", "origin": "England", "size": "Small",
        "weight": "9-11 kg", "lifespan": "12-15 years",
        "temperament": "Merry, Friendly, Curious, Determined",
        "activity_level": "Moderate", "breed_group": "Hound",
        "description": "A small scent hound known for their excellent sense of smell and gentle temperament.",
    },
    {
        "name": "Bulldog", "origin": "England", "size": "Medium",
        "weight": "18-25 kg", "lifespan": "8-10 years",
        "temperament": "Docile, Willful, Friendly, Gregarious",
        "activity_level": "Low", "breed_group": "Non-Sporting",
        "description": "A medium-sized breed with a wrinkled face and distinctive pushed-in nose. Known for being calm and courageous.",
    },
    {
        "name": "Shih Tzu", "origin": "China/Tibet", "size": "Small",
        "weight": "4-7 kg", "lifespan": "10-16 years",
        "temperament": "Affectionate, Playful, Outgoing, Loyal",
        "activity_level": "Low", "breed_group": "Toy",
        "description": "A toy breed originally bred for royalty. Known for their long, flowing coat and friendly personality.",
    },
    {
        "name": "Siberian Husky", "origin": "Russia", "size": "Medium",
        "weight": "16-27 kg", "lifespan": "12-14 years",
        "temperament": "Outgoing, Mischievous, Loyal, Gentle",
        "activity_level": "High", "breed_group": "Working",
        "description": "A beautiful, athletic breed originally bred as sled dogs. Known for their striking blue eyes and thick coat.",
    },
    {
        "name": "Pug", "origin": "China", "size": "Small",
        "weight": "6-8 kg", "lifespan": "12-15 years",
        "temperament": "Charming, Mischievous, Loving, Sociable",
        "activity_level": "Low", "breed_group": "Toy",
        "description": "A small breed with a wrinkly face and curled tail. Great companion dogs that love being around people.",
    },
    {
        "name": "Persian Cat", "category": "Cats", "origin": "Iran", "size": "Medium",
        "weight": "3-5 kg", "lifespan": "12-15 years",
        "temperament": "Quiet, Sweet, Peaceful, Affectionate",
        "activity_level": "Low", "breed_group": "Longhair",
        "description": "Known for their gentle, sweet personalities and beautiful long coats. They prefer a serene environment.",
    },
    {
        "name": "Siamese Cat", "category": "Cats", "origin": "Thailand", "size": "Medium",
        "weight": "3-5 kg", "lifespan": "15-20 years",
        "temperament": "Vocal, Affectionate, Active, Intelligent",
        "activity_level": "High", "breed_group": "Shorthair",
        "description": "Highly intelligent and famously vocal cats that form strong bonds with their human families.",
    },
    {
        "name": "Parakeet", "category": "Birds", "origin": "Australia", "size": "Small",
        "weight": "30-40 g", "lifespan": "5-10 years",
        "temperament": "Social, Active, Vocal, Playful",
        "activity_level": "High", "breed_group": "Parrot",
        "description": "Small, colorful, and highly social birds that can learn to mimic human speech.",
    },
    {
        "name": "Cockatiel", "category": "Birds", "origin": "Australia", "size": "Small",
        "weight": "70-120 g", "lifespan": "10-15 years",
        "temperament": "Gentle, Affectionate, Whistling, Social",
        "activity_level": "Moderate", "breed_group": "Parrot",
        "description": "Friendly and outgoing pet birds famous for their crests and impressive whistling abilities.",
    },
]

DIETS_BY_BREED = {
    "Golden Retriever": [
        {"age_group": "Puppy", "food_type": "High-protein puppy kibble, boiled chicken, rice", "feeding_frequency": "3 times daily", "water_requirement": "1/2 to 1 cup per pound of body weight"},
        {"age_group": "Adult", "food_type": "Premium adult dog food, lean meats, vegetables", "feeding_frequency": "2 times daily", "water_requirement": "1 ounce per pound of body weight"},
        {"age_group": "Senior", "food_type": "Senior formula with glucosamine, low-fat proteins", "feeding_frequency": "2 times daily", "water_requirement": "1 ounce per pound of body weight"},
    ],
    "Labrador Retriever": [
        {"age_group": "Puppy", "food_type": "Large breed puppy food, eggs, cottage cheese", "feeding_frequency": "3 times daily", "water_requirement": "1/2 cup per pound of body weight"},
        {"age_group": "Adult", "food_type": "Portion-controlled adult food, fish, sweet potatoes", "feeding_frequency": "2 times daily", "water_requirement": "1 ounce per pound of body weight"},
    ],
    "French Bulldog": [
        {"age_group": "Puppy", "food_type": "Small breed puppy formula, soft food", "feeding_frequency": "3 times daily", "water_requirement": "1/2 cup per meal"},
        {"age_group": "Adult", "food_type": "Limited ingredient diet, grain-free options", "feeding_frequency": "2 times daily", "water_requirement": "Fresh water always available"},
    ],
    "Beagle": [
        {"age_group": "Puppy", "food_type": "High-quality puppy food, lean turkey", "feeding_frequency": "3 times daily", "water_requirement": "1/2 cup per meal"},
        {"age_group": "Adult", "food_type": "Controlled portions — beagles overeat easily", "feeding_frequency": "2 times daily", "water_requirement": "Fresh water always available"},
    ],
    "Pug": [
        {"age_group": "Puppy", "food_type": "Small breed puppy formula", "feeding_frequency": "3-4 times daily", "water_requirement": "Small amounts frequently"},
        {"age_group": "Adult", "food_type": "Weight management formula, avoid fatty foods", "feeding_frequency": "2 times daily", "water_requirement": "Fresh water always available"},
    ],
}

PETS = [
    {"name": "Buddy", "breed": "Golden Retriever", "age": "2 years", "price": 1200, "gender": "Male", "description": "A playful and loving golden boy who loves fetch."},
    {"name": "Luna", "breed": "Golden Retriever", "age": "8 months", "price": 1500, "gender": "Female", "description": "Adorable puppy with a silky golden coat."},
    {"name": "Max", "breed": "Labrador Retriever", "age": "1 year", "price": 1100, "gender": "Male", "description": "Energetic and friendly Lab, great with kids."},
    {"name": "Bella", "breed": "French Bulldog", "age": "3 years", "price": 2500, "gender": "Female", "description": "Compact and charming Frenchie, perfect for apartments."},
    {"name": "Charlie", "breed": "Beagle", "age": "6 months", "price": 800, "gender": "Male", "description": "Curious little beagle puppy with big ears."},
    {"name": "Daisy", "breed": "Poodle", "age": "1.5 years", "price": 1800, "gender": "Female", "description": "Elegant and hypoallergenic, very intelligent."},
    {"name": "Rocky", "breed": "German Shepherd", "age": "2 years", "price": 1400, "gender": "Male", "description": "Loyal and confident, well-trained protector."},
    {"name": "Coco", "breed": "Shih Tzu", "age": "4 years", "price": 900, "gender": "Female", "description": "Sweet and gentle lap dog who loves cuddles."},
    {"name": "Duke", "breed": "Siberian Husky", "age": "1 year", "price": 1600, "gender": "Male", "description": "Stunning blue-eyed husky, very active and playful."},
    {"name": "Milo", "breed": "Pug", "age": "2 years", "price": 1000, "gender": "Male", "description": "Charming little pug who loves being the center of attention."},
    {"name": "Sadie", "breed": "Golden Retriever", "age": "3 years", "price": 1100, "gender": "Female", "description": "Calm and well-mannered golden, great therapy dog."},
    {"name": "Tucker", "breed": "Labrador Retriever", "age": "5 months", "price": 1300, "gender": "Male", "description": "Adorable chocolate lab puppy."},
    {"name": "Rosie", "breed": "Beagle", "age": "2 years", "price": 750, "gender": "Female", "description": "Sweet beagle who loves walks and sniffing adventures."},
    {"name": "Zeus", "breed": "German Shepherd", "age": "4 years", "price": 1200, "gender": "Male", "description": "Majestic shepherd, excellent guard dog."},
    {"name": "Lola", "breed": "French Bulldog", "age": "1 year", "price": 2800, "gender": "Female", "description": "Rare blue coat Frenchie, very affectionate."},
    {"name": "Bear", "breed": "Siberian Husky", "age": "3 years", "price": 1400, "gender": "Male", "description": "Beautiful husky with heterochromia, loves snow."},
    {"name": "Ginger", "breed": "Poodle", "age": "6 months", "price": 2000, "gender": "Female", "description": "Adorable miniature poodle puppy, already house-trained."},
    {"name": "Oscar", "breed": "Bulldog", "age": "2 years", "price": 1500, "gender": "Male", "description": "Gentle bulldog who loves napping on the couch."},
    {"name": "Penny", "breed": "Shih Tzu", "age": "1 year", "price": 950, "gender": "Female", "description": "Playful shih tzu with a beautiful long coat."},
    {"name": "Bruno", "breed": "Pug", "category": "Dogs", "age": "4 months", "price": 1100, "gender": "Male", "description": "Tiny pug puppy full of personality."},
    {"name": "Snowball", "breed": "Persian Cat", "category": "Cats", "age": "2 years", "price": 800, "gender": "Female", "description": "Fluffy white Persian who loves lounging."},
    {"name": "Shadow", "breed": "Siamese Cat", "category": "Cats", "age": "1 year", "price": 950, "gender": "Male", "description": "Talkative and very active Siamese kitten."},
    {"name": "Sky", "breed": "Parakeet", "category": "Birds", "age": "6 months", "price": 45, "gender": "Female", "description": "Beautiful blue parakeet, loves mirrors."},
    {"name": "Sunny", "breed": "Cockatiel", "category": "Birds", "age": "1 year", "price": 120, "gender": "Male", "description": "Whistles the Andy Griffith theme song!"},
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Check if data exists
        existing = await db.execute(
            select(Breed).limit(1)
        )
        if existing.scalar_one_or_none():
            print("Database already seeded!")
            return

        # Seed breeds
        breed_map = {}
        for breed_data in BREEDS:
            breed = Breed(**breed_data)
            db.add(breed)
            await db.flush()
            breed_map[breed.name] = breed.id

        # Seed diets
        for breed_name, diet_list in DIETS_BY_BREED.items():
            if breed_name in breed_map:
                for diet_data in diet_list:
                    diet = Diet(breed_id=breed_map[breed_name], **diet_data)
                    db.add(diet)

        # Seed pets
        for pet_data in PETS:
            breed_name = str(pet_data.pop("breed"))
            pet = Pet(breed_id=breed_map.get(breed_name), **pet_data)
            db.add(pet)

        # Create admin user
        admin = User(
            name="Admin",
            email="admin@petmarket.com",
            password_hash=hash_password("admin123"),
            role="admin",
        )
        db.add(admin)

        await db.commit()
        print("✅ Database seeded successfully!")
        print(f"   - {len(BREEDS)} breeds")
        print(f"   - {sum(len(v) for v in DIETS_BY_BREED.values())} diet entries")
        print(f"   - {len(PETS)} pets")
        print(f"   - 1 admin user (admin@petmarket.com / admin123)")


if __name__ == "__main__":
    asyncio.run(seed())
