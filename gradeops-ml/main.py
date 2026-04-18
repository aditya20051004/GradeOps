# gradeops-ml/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="GradeOps ML Service",
    description="AI grading using Langchain + Langgraph + HuggingFace",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routes
from services.ocr_service import router as ocr_router
from services.grading_service import router as grading_router
from services.plagiarism_service import router as plagiarism_router

app.include_router(ocr_router, prefix="/ocr", tags=["OCR"])
app.include_router(grading_router, prefix="/grade", tags=["Grading"])
app.include_router(plagiarism_router, prefix="/plagiarism", tags=["Plagiarism"])

@app.get("/")
async def root():
    return {
        "message": "GradeOps ML Service Running! 🤖",
        "endpoints": [
            "POST /ocr/extract - Extract text from PDF",
            "POST /grade/answer - Grade with Langchain+Langgraph",
            "POST /plagiarism/check - Detect plagiarism"
        ]
    }

@app.get("/health")
async def health():
    return {"status": "healthy ✅"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )