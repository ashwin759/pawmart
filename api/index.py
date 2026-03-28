"""Vercel Serverless Function entry point."""
import sys
import os
import traceback

def create_error_app(error_msg: str):
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    error_app = FastAPI()
    @error_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path: str):
        return JSONResponse(status_code=500, content={"error": "Startup Crash", "traceback": error_msg})
    return error_app

try:
    # Add the backend directory to Python's module search path
    backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
    sys.path.insert(0, backend_dir)

    # Set VERCEL env so config.py knows to use /tmp for SQLite
    os.environ["VERCEL"] = "1"

    from main import app
except Exception as e:
    app = create_error_app(traceback.format_exc())
