"""
CoastGuard-AI: Root Server Launch Script
Allows executing `python main.py` directly from the workspace root.
"""

import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("=================================================================")
    print("  CoastGuard-AI Realtime Backend Engine Launching on :8000")
    print("  Live APIs: Open-Meteo Weather, Marine, Flood (GloFAS)")
    print("  ML Surrogate: LightGBM Multi-Quantile (17 Features)")
    print("  Network Routing: NetworkX Cutoff Engine (Safety Depth: 0.30m)")
    print("  Regions: Mangaluru & Udupi")
    print("  Swagger Documentation: http://127.0.0.1:8000/docs")
    print("=================================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
