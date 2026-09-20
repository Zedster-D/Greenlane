"""
GreenLane AI — FastAPI Main Application
"""

from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import APP_NAME, APP_VERSION, CORS_ORIGINS
from app.core.database import init_db, SessionLocal
from app.data.seed import seed_emission_factors, seed_original_dataset, seed_vastraglobal_demo_dataset

# API Routers
from app.api.dashboard import router as dashboard_router
from app.api.emissions import router as emissions_router
from app.api.network import router as network_router
from app.api.shipments import router as shipments_router
from app.api.scenarios import router as scenarios_router
from app.api.optimizer import router as optimizer_router
from app.api.disruptions import router as disruptions_router
from app.api.ai import router as ai_router
from app.api.suppliers import router as suppliers_router
from app.api.reports import router as reports_router
from app.api.settings import router as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables & initial data exist
    init_db()
    db = SessionLocal()
    try:
        seed_emission_factors(db)
        seed_original_dataset(db)
        seed_vastraglobal_demo_dataset(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="GreenLane AI — Enterprise Supply Chain Decarbonization & Control Tower",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev & demo convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(dashboard_router, prefix="/api")
app.include_router(emissions_router, prefix="/api")
app.include_router(network_router, prefix="/api")
app.include_router(shipments_router, prefix="/api")
app.include_router(scenarios_router, prefix="/api")
app.include_router(optimizer_router, prefix="/api")
app.include_router(disruptions_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(suppliers_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(settings_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "healthy", "app": APP_NAME, "version": APP_VERSION}


@app.get("/")
def root():
    return {
        "message": f"Welcome to {APP_NAME} API. Access API docs at /docs",
        "version": APP_VERSION,
        "tagline": "See the carbon. Understand the risk. Simulate the future. Make better logistics decisions."
    }
