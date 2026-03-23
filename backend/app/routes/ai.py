from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.core.database import get_db
from app.core.config import get_settings
from app.models.breed import Breed
from app.schemas import AIChatRequest, AIChatResponse, AIRecommendRequest

router = APIRouter()
settings = get_settings()


async def _get_breed_context(db: AsyncSession) -> str:
    result = await db.execute(select(Breed))
    breeds = result.scalars().all()
    if not breeds:
        return "No breed data available in the store."
    lines = []
    for b in breeds:
        lines.append(
            f"- {b.name}: Size={b.size}, Temperament={b.temperament}, "
            f"Activity={b.activity_level}, Lifespan={b.lifespan}, Group={b.breed_group}"
        )
    return "Available breeds in our pet store:\n" + "\n".join(lines)


async def _call_ai(system_prompt: str, user_message: str) -> str:
    if not settings.QWEN_API_KEY:
        return _mock_ai_response(user_message)

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{settings.QWEN_API_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.QWEN_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "qwen-plus",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500,
                },
            )
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"AI service temporarily unavailable. Error: {str(e)}"
    
    return "AI service unavailable."


def _mock_ai_response(message: str) -> str:
    msg = message.lower()
    if "apartment" in msg or "small" in msg:
        return (
            "For apartment living, I'd recommend these breeds:\n\n"
            "🐕 **French Bulldog** — Small, quiet, low activity. Perfect for apartments.\n\n"
            "🐕 **Pug** — Friendly, adaptable, minimal exercise needs.\n\n"
            "🐕 **Shih Tzu** — Gentle, affectionate, great indoor companion.\n\n"
            "These breeds are well-suited for smaller spaces and don't require large yards."
        )
    if "feed" in msg or "diet" in msg or "food" in msg:
        return (
            "Here's a general feeding guide:\n\n"
            "🍖 **Puppies (under 1 year)**: Feed 3 times daily with high-protein puppy food.\n\n"
            "🍖 **Adults (1-7 years)**: Feed twice daily with balanced adult dog food.\n\n"
            "🍖 **Seniors (7+ years)**: Feed twice daily with senior formula, lower calories.\n\n"
            "Always provide fresh water and consult a vet for breed-specific dietary needs!"
        )
    if "friendly" in msg or "family" in msg or "children" in msg:
        return (
            "Great family-friendly breeds include:\n\n"
            "🐕 **Golden Retriever** — Patient, gentle, excellent with kids.\n\n"
            "🐕 **Labrador Retriever** — Loyal, playful, very social.\n\n"
            "🐕 **Beagle** — Friendly, curious, great with families.\n\n"
            "These breeds are known for their gentle temperament and love of people."
        )
    return (
        "I'm your Pet Marketplace AI Assistant! I can help you with:\n\n"
        "🔹 **Breed recommendations** — Tell me your lifestyle and I'll suggest breeds\n\n"
        "🔹 **Diet & care tips** — Ask about feeding, grooming, or exercise\n\n"
        "🔹 **Breed comparisons** — Compare temperament, size, and activity levels\n\n"
        "Try asking something like: 'I live in an apartment and want a friendly dog' "
        "or 'What should I feed a Labrador puppy?'"
    )


@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(data: AIChatRequest, db: AsyncSession = Depends(get_db)):
    context = await _get_breed_context(db)
    system_prompt = (
        "You are a helpful pet store AI assistant. You help customers choose the right pet, "
        "provide breed information, diet advice, and care tips. Be friendly and informative. "
        "Use emoji for visual appeal. Here is the store's breed database:\n\n" + context
    )
    reply = await _call_ai(system_prompt, data.message)
    return AIChatResponse(reply=reply)


@router.post("/recommend", response_model=AIChatResponse)
async def ai_recommend(data: AIRecommendRequest, db: AsyncSession = Depends(get_db)):
    context = await _get_breed_context(db)
    system_prompt = (
        "You are a pet breed recommendation expert. Based on the user's description of their "
        "lifestyle and preferences, recommend the best breeds from the store's inventory. "
        "Include breed name, temperament, size, and care difficulty for each recommendation.\n\n" + context
    )
    reply = await _call_ai(system_prompt, data.description)
    return AIChatResponse(reply=reply)


@router.post("/search", response_model=AIChatResponse)
async def ai_search(data: AIChatRequest, db: AsyncSession = Depends(get_db)):
    context = await _get_breed_context(db)
    system_prompt = (
        "You are a pet search assistant. The user will describe what kind of pet they want "
        "in natural language. Return a list of matching breeds from the store with brief descriptions.\n\n" + context
    )
    reply = await _call_ai(system_prompt, data.message)
    return AIChatResponse(reply=reply)
