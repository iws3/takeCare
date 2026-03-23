from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="TakeCare Clinical AI Engine", version="1.0.0")

class AnalysisRequest(BaseModel):
    clerk_id: str
    record_text: str

class AnalysisResponse(BaseModel):
    summary: str
    severity: str
    recommendations: List[str]

@app.get("/")
async def root():
    return {"status": "active", "engine": "Python Clinical RAG"}

@app.post("/analyze-clinical", response_model=AnalysisResponse)
async def analyze_medical_record(request: AnalysisRequest):
    return AnalysisResponse(
        summary=f"Analysis for {request.clerk_id}",
        severity="MEDIUM",
        recommendations=["Monitor vitals"]
    )
