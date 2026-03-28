"""Vercel Serverless Function entry point.
This file bridges Vercel's api/ directory convention with our backend/ FastAPI app.
"""
import sys
import os

# Add the backend directory to Python's module search path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.insert(0, backend_dir)

# Set VERCEL env so config.py knows to use /tmp for SQLite
os.environ["VERCEL"] = "1"

from main import app
