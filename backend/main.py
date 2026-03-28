from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.database import engine, Base
from app.routes import auth, pets, breeds, diets, orders, search, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Pet Marketplace API",
    description="AI-Powered Pet Marketplace Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.environ.get("VERCEL"):
    import shutil
    os.makedirs("/tmp/uploads", exist_ok=True)
    bundled_uploads = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    if os.path.exists(bundled_uploads):
        for item in os.listdir(bundled_uploads):
            s = os.path.join(bundled_uploads, item)
            d = os.path.join("/tmp/uploads", item)
            if not os.path.exists(d):
                try:
                    shutil.copy2(s, d)
                except Exception:
                    pass
    app.mount("/uploads", StaticFiles(directory="/tmp/uploads"), name="uploads")
else:
    os.makedirs("uploads", exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(pets.router, prefix="/api/pets", tags=["Pets"])
app.include_router(breeds.router, prefix="/api/breeds", tags=["Breeds"])
app.include_router(diets.router, prefix="/api/diets", tags=["Diets"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Pet Marketplace API is running"}

import traceback
from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": str(exc), "traceback": traceback.format_exc(), "url": str(request.url)}
    )
