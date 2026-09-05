from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os

from .database import engine, Base, get_db
from .models import Entity, Alert, Finding
from .schemas import EntityOut, AlertOut, IsolationForestRequest, IsolationForestResponse
from .analytics import run_multivariate_isolation_forest

# Create tables in SQLite / PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SAT-SA Supervisory Analytics API",
    description="Offline-capable SOC supervisory assessment API adhering to SIH 26157 specifications",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SAT-SA FastAPI Backend",
        "database": os.getenv("DATABASE_URL", "sqlite:///./sat_sa.db")
    }

@app.get("/api/v1/entities", response_model=List[EntityOut])
def get_entities(db: Session = Depends(get_db)):
    return db.query(Entity).all()

@app.get("/api/v1/alerts", response_model=List[AlertOut])
def get_alerts(entity_id: str = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if entity_id:
        query = query.filter(Alert.entity_id == entity_id)
    return query.limit(limit).all()

@app.post("/api/v1/analytics/isolation-forest", response_model=IsolationForestResponse)
def compute_isolation_forest(req: IsolationForestRequest):
    result = run_multivariate_isolation_forest(req.features, contamination=req.contamination)
    return IsolationForestResponse(**result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
