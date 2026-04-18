# services/plagiarism_service.py
# Detects similar answers using:
# - Cosine Similarity (ML algorithm)
# - Sentence Transformers (HuggingFace)

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer
import numpy as np
import os

router = APIRouter()

# Load HuggingFace sentence transformer model
# This converts text to vectors (embeddings)
print("🤗 Loading HuggingFace sentence transformer...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("✅ Sentence transformer loaded!")

# ─────────────────────────────────────────
# COSINE SIMILARITY
# This is the ML algorithm for comparison
# Returns value 0-1 (1 = identical)
# ─────────────────────────────────────────
def cosine_similarity(vec1, vec2):
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot_product / (norm1 * norm2)

# ─────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────
class Submission(BaseModel):
    student_name: str
    student_roll: str
    answer: str

class PlagiarismRequest(BaseModel):
    submissions: List[Submission]
    threshold: float = 0.85  # Flag if similarity > 85%

class PlagiarismResult(BaseModel):
    student1: str
    student2: str
    similarity_score: float
    is_flagged: bool
    severity: str

# ─────────────────────────────────────────
# API ROUTES
# ─────────────────────────────────────────

@router.post("/check")
async def check_plagiarism(request: PlagiarismRequest):
    try:
        submissions = request.submissions

        if len(submissions) < 2:
            return {
                "message": "Need at least 2 submissions to check",
                "flags": []
            }

        print(f"🔍 Checking {len(submissions)} submissions...")

        # Convert all answers to vectors using HuggingFace
        print("🤗 Converting text to embeddings...")
        embeddings = model.encode(
            [s.answer for s in submissions]
        )

        # Compare every pair of submissions
        flags = []
        total_pairs = 0

        for i in range(len(submissions)):
            for j in range(i + 1, len(submissions)):
                total_pairs += 1

                # Calculate similarity score
                similarity = cosine_similarity(
                    embeddings[i],
                    embeddings[j]
                )
                similarity_percent = round(float(similarity) * 100, 2)

                # Determine severity
                if similarity >= 0.95:
                    severity = "critical"
                    is_flagged = True
                elif similarity >= 0.85:
                    severity = "high"
                    is_flagged = True
                elif similarity >= 0.70:
                    severity = "medium"
                    is_flagged = True
                else:
                    severity = "low"
                    is_flagged = False

                if is_flagged:
                    flags.append({
                        "student1": submissions[i].student_name,
                        "roll1": submissions[i].student_roll,
                        "student2": submissions[j].student_name,
                        "roll2": submissions[j].student_roll,
                        "similarity_score": similarity_percent,
                        "is_flagged": is_flagged,
                        "severity": severity
                    })

        print(f"✅ Found {len(flags)} suspicious pairs!")

        return {
            "total_submissions": len(submissions),
            "total_pairs_checked": total_pairs,
            "flags_found": len(flags),
            "flags": sorted(
                flags,
                key=lambda x: x["similarity_score"],
                reverse=True
            )
        }

    except Exception as e:
        print(f"Plagiarism check error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Plagiarism check failed: {str(e)}"
        )