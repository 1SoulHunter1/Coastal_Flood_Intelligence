"""
CoastGuard-AI: Backend Directory Launch Script
Allows executing `python main.py` from within the backend/ folder.
"""

import sys
import os
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("=================================================================")
    print("  CoastGuard-AI Realtime Backend Engine Launching on :8000")
    print("  Live APIs: Open-Meteo Weather, Marine, Flood (GloFAS)")
    print("  Swagger Documentation: http://127.0.0.1:8000/docs")
    print("=================================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
