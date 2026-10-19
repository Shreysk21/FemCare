import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Ensure backend directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

load_dotenv()

try:
    from .database import init_db, SessionLocal
    from .seed import seed_initial_data
    from .routes import (
        auth,
        profile,
        cycles,
        symptoms,
        moods,
        hydration,
        circle_care,
        feedback,
        conditions,
        predictions
    )
except (ImportError, ValueError):
    from database import init_db, SessionLocal
    from seed import seed_initial_data
    from routes import (
        auth,
        profile,
        cycles,
        symptoms,
        moods,
        hydration,
        circle_care,
        feedback,
        conditions,
        predictions
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed initial data
    init_db()
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield
    # Shutdown logic (if any)

app = FastAPI(
    title="FemCare Backend API",
    description="FastAPI Persistent Backend for FemCare Women's Health & Wellness Application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration for Frontend Integration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(cycles.router)
app.include_router(symptoms.router)
app.include_router(moods.router)
app.include_router(hydration.router)
app.include_router(circle_care.router)
app.include_router(feedback.router)
app.include_router(conditions.router)
app.include_router(predictions.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "FemCare Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "database": "Supabase / PostgreSQL (with SQLite Local Fallback)"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app_module = "main:app" if os.path.exists("main.py") else "backend.main:app"
    uvicorn.run(app_module, host="127.0.0.1", port=port, reload=True)
