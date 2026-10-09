"""
CoastGuard-AI: Real-Time Operational Backend Engine
FastAPI production application serving hydrodynamic intelligence,
NetworkX emergency access routing, LightGBM multi-quantile inference,
SHAP explainability, and bilingual alert dispatch.
"""

import sys
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

# Add backend directory to sys.path so running directly from backend/app/ works
_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.v1.environment import router as env_router
from app.api.v1.zones import router as zones_router
from app.api.v1.forecast import router as forecast_router
from app.api.v1.infrastructure import router as infra_router
from app.api.v1.routing import router as routing_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.emergency import router as emergency_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.operational import router as operational_router
from app.api.v1.demo import router as demo_router
from app.services.live_monitor import run_live_monitor


@asynccontextmanager
async def lifespan(_: FastAPI):
    monitor_task = asyncio.create_task(run_live_monitor())
    try:
        yield
    finally:
        monitor_task.cancel()
        try:
            await monitor_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="CoastGuard-AI Realtime Backend Engine",
    description="Real-time coastal flood intelligence, ML quantile surrogates, and NetworkX emergency routing for Mangaluru & Udupi",
    version="1.0.0",
    lifespan=lifespan,
)

# Comprehensive CORS Middleware for Frontend Development & Production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /api/v1 prefix
app.include_router(env_router, prefix="/api/v1", tags=["Environment"])
app.include_router(zones_router, prefix="/api/v1", tags=["Zones"])
app.include_router(forecast_router, prefix="/api/v1", tags=["Forecast"])
app.include_router(infra_router, prefix="/api/v1", tags=["Infrastructure"])
app.include_router(routing_router, prefix="/api/v1", tags=["Routing & Access"])
app.include_router(analysis_router, prefix="/api/v1", tags=["Analysis"])
app.include_router(emergency_router, prefix="/api/v1", tags=["Emergency Response"])
app.include_router(alerts_router, prefix="/api/v1", tags=["Alerts"])
app.include_router(operational_router, prefix="/api/v1", tags=["Operational Blueprint"])
app.include_router(demo_router, prefix="/api/v1", tags=["Demo & Officer Inbox"])

# Dual-mount without /api/v1 prefix as well for flexible direct path access
app.include_router(env_router, tags=["Environment (Root)"])
app.include_router(zones_router, tags=["Zones (Root)"])
app.include_router(forecast_router, tags=["Forecast (Root)"])
app.include_router(infra_router, tags=["Infrastructure (Root)"])
app.include_router(routing_router, tags=["Routing (Root)"])
app.include_router(analysis_router, tags=["Analysis (Root)"])
app.include_router(emergency_router, tags=["Emergency (Root)"])
app.include_router(alerts_router, tags=["Alerts (Root)"])
app.include_router(operational_router, tags=["Operational (Root)"])
app.include_router(demo_router, tags=["Demo & Officer Inbox (Root)"])

@app.get("/health", tags=["System"])
@app.get("/api/v1/health", tags=["System"])
def health_check():
    return {
        "status": "operational",
        "service": "CoastGuard-AI Realtime Backend Engine",
        "regions_supported": ["mangaluru", "udupi"],
        "model_engine": "LightGBM Multi-Quantile Surrogate (17 Features)",
        "routing_engine": "NetworkX Cutoff Dijkstra"
    }

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to CoastGuard-AI Realtime Backend Engine",
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
