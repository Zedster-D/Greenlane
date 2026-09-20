"""
GreenLane AI — Core Configuration

Database connection, environment variables, application settings.
"""

from __future__ import annotations
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR.parent / "data"  # Original CSV data
if not DATA_DIR.exists():
    # Try the original project's data folder
    DATA_DIR = BASE_DIR.parent.parent / "data"

# Database
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'greenlane.db'}")

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

# Carbon pricing
DEFAULT_CARBON_PRICE = float(os.getenv("CARBON_PRICE", "50.0"))
DEFAULT_CURRENCY = os.getenv("DEFAULT_CURRENCY", "EUR")

# AI
AI_PROVIDER = os.getenv("AI_PROVIDER", "demo")  # demo | openai | gemini
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4")

# App
APP_NAME = "GreenLane AI"
APP_VERSION = "1.0.0"
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
