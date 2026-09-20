"""
Vercel Serverless Function — FastAPI entrypoint

This file wraps the FastAPI app so Vercel can serve it as a serverless function.
All /api/* requests are routed here.
"""

import sys
import os

# Add the backend directory to Python path so imports work
backend_dir = os.path.join(os.path.dirname(__file__), "..", "supply-chain-sustainability-main", "greenlane-ai", "backend")
sys.path.insert(0, os.path.abspath(backend_dir))

# Set environment for Vercel (use /tmp for writable SQLite)
os.environ.setdefault("DATABASE_URL", f"sqlite:////tmp/greenlane.db")
os.environ.setdefault("DEMO_MODE", "true")

from app.main import app  # noqa: E402

# Vercel expects a variable named 'app' or a handler
# FastAPI/Starlette apps are ASGI-compatible, which Vercel supports
