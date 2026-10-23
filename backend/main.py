import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
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
        predictions,
        sleep,
        medications,
        activity,
        notifications,
        clinics
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
        predictions,
        sleep,
        medications,
        activity,
        notifications,
        clinics
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
app.include_router(sleep.router)
app.include_router(medications.router)
app.include_router(activity.router)
app.include_router(notifications.router)
app.include_router(clinics.router)

@app.get("/")
def root(request: Request):
    accept_header = request.headers.get("accept", "")
    if "text/html" in accept_header:
        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="3; url=http://localhost:5173" />
  <title>FemCare - Welcome</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #ede9fe 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      color: #1e293b;
    }
    .card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 24px;
      padding: 40px;
      max-width: 520px;
      text-align: center;
      box-shadow: 0 20px 40px -15px rgba(219, 39, 119, 0.2), 0 0 0 1px rgba(244, 114, 182, 0.2);
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      background: #fdf2f8;
      border: 1px solid #f472b6;
      border-radius: 999px;
      color: #db2777;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    h1 {
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(to right, #db2777, #be185d, #7c3aed);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #64748b;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(to right, #db2777, #f43f5e);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 15px;
      box-shadow: 0 8px 16px -4px rgba(219, 39, 119, 0.35);
      transition: all 0.2s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -4px rgba(219, 39, 119, 0.45);
    }
    .secondary-link {
      display: block;
      margin-top: 18px;
      color: #94a3b8;
      font-size: 13px;
      text-decoration: none;
    }
    .secondary-link:hover {
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🌸 FemCare System Status: Online</div>
    <h1>FemCare Application</h1>
    <p>You have reached the FastAPI backend server (port 8000). The interactive <strong>FemCare Web Interface & Login</strong> is running on port 5173.</p>
    <a href="http://localhost:5173" class="btn">👉 Open FemCare Login & Dashboard</a>
    <p style="font-size: 12px; margin-top: 14px; margin-bottom: 0;">Automatically redirecting to http://localhost:5173 in 3 seconds...</p>
    <a href="/docs" class="secondary-link">Explore Swagger API Documentation (/docs)</a>
  </div>
</body>
</html>"""
        return HTMLResponse(content=html_content, status_code=200)

    return {
        "status": "online",
        "app": "FemCare Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "database": "Supabase / PostgreSQL (with SQLite Local Fallback)",
        "frontend_url": "http://localhost:5173"
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
