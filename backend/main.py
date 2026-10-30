import os
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, timezone
from agent import explain_alert
from fastapi import HTTPException

app = FastAPI(
    title="Sentinel Habitat",
    description="Environmental risk intelligence and early warning platform",
    version="0.1.0"
)


class RiskInput(BaseModel):
    module: str
    temperature: float = 25
    humidity: float = 60
    wind_speed: float = 10
    rainfall: float = 0
    water_level: float = 0
    turbidity: float = 0


@app.get("/api")
def home():
    return {
        "project": "Sentinel Habitat",
        "status": "online",
        "modules": [
            "Sentinel Fire",
            "Sentinel Water",
            "Sentinel Biodiversity",
            "Sentinel Seismic"
        ]
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze")
def analyze(data: RiskInput):
    module = data.module.lower()
    risk = "low"
    evidence = []

    if module == "fire":
        score = 0

        if data.temperature >= 35:
            score += 2
            evidence.append("High temperature")

        if data.humidity <= 25:
            score += 2
            evidence.append("Low humidity")

        if data.wind_speed >= 30:
            score += 1
            evidence.append("Strong wind")

        if data.rainfall == 0:
            score += 1
            evidence.append("No recorded rainfall")

    elif module == "water":
        score = 0

        if data.water_level >= 80:
            score += 2
            evidence.append("High water level")

        if data.rainfall >= 50:
            score += 1
            evidence.append("Heavy rainfall")

        if data.turbidity >= 100:
            score += 2
            evidence.append("High turbidity")

    elif module in ["biodiversity", "seismic"]:
        return {
            "module": module,
            "risk": "not_evaluated",
            "message": "This module is not yet connected to an analysis model.",
            "data_type": "not_configured"
        }

    else:
        return {
            "error": "Unknown module",
            "available_modules": ["fire", "water", "biodiversity", "seismic"]
        }

    if score >= 4:
        risk = "high"
    elif score >= 2:
        risk = "medium"

    return {
        "module": module,
        "risk": risk,
        "score": score,
        "evidence": evidence,
        "data_type": "simulated_or_user_supplied",
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "notice": "This is a preliminary demonstration, not an official emergency warning."
    }
@app.post("/analyze-with-agent")
def analyze_with_agent(data: RiskInput):
    analysis = analyze(data)

    if "error" in analysis or analysis.get("risk") == "not_evaluated":
        return analysis

    try:
        explanation = explain_alert(analysis)

        return {
            "project": "Sentinel Habitat",
            "analysis": analysis,
            "sentinel_agent": {
                "model": os.getenv("NEBIUS_MODEL"),
                "explanation": explanation
            }
        }

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Nemotron connection error: {str(error)}"
        )

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

app.mount(
    "/",
    StaticFiles(directory=str(FRONTEND_DIR), html=True),
    name="frontend"
)