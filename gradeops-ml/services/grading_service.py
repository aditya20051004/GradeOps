# services/grading_service.py
# This is the CORE AI grading pipeline
# Uses Langchain + Langgraph as required!

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.graph import StateGraph, END
from typing import TypedDict
import os
import json

router = APIRouter()

# Initialize Groq LLM via Langchain
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.1-8b-instant",
    temperature=0.2  # Low temperature = consistent grading
)

# ─────────────────────────────────────────
# LANGGRAPH STATE
# This tracks the state of our grading pipeline
# Think of it as memory that flows through each step
# ─────────────────────────────────────────
class GradingState(TypedDict):
    student_answer: str
    rubric: str
    total_marks: int
    extracted_answers: str
    individual_grades: str
    final_score: int
    justification: str
    strengths: str
    improvements: str
    plagiarism_flag: bool

# ─────────────────────────────────────────
# LANGCHAIN PROMPTS
# These are the instructions we give to the AI
# ─────────────────────────────────────────

# Step 1: Extract individual answers
extract_prompt = ChatPromptTemplate.from_template("""
You are an expert at analyzing student exam answers.

Given this student answer:
{student_answer}

And this rubric:
{rubric}

Extract and organize each question's answer separately.
Format as JSON:
{{
  "answers": [
    {{"question": "Q1", "student_response": "..."}},
    {{"question": "Q2", "student_response": "..."}}
  ]
}}

Only respond with JSON, nothing else.
""")

# Step 2: Grade each answer
grade_prompt = ChatPromptTemplate.from_template("""
You are a strict but fair exam grader.

Rubric: {rubric}
Total Marks: {total_marks}
Extracted Answers: {extracted_answers}

Grade each answer based on the rubric.
Be precise and fair.

Respond in JSON:
{{
  "grades": [
    {{
      "question": "Q1",
      "marks_awarded": 8,
      "max_marks": 10,
      "reason": "Good explanation but missing..."
    }}
  ],
  "total_score": 32,
  "percentage": 64
}}

Only respond with JSON, nothing else.
""")

# Step 3: Generate feedback
feedback_prompt = ChatPromptTemplate.from_template("""
Based on these grades: {individual_grades}

Write constructive feedback for the student.
Be encouraging but honest.

Respond in JSON:
{{
  "justification": "Overall assessment...",
  "strengths": "What student did well...",
  "improvements": "What student needs to improve..."
}}

Only respond with JSON, nothing else.
""")

# ─────────────────────────────────────────
# LANGGRAPH NODES
# Each node is one step in our pipeline
# ─────────────────────────────────────────



# Node 1: Extract answers from student response
def extract_answers_node(state: GradingState):
    print("📝 Step 1: Extracting answers...")
    try:
        chain = extract_prompt | llm | StrOutputParser()
        result = chain.invoke({
            "student_answer": state["student_answer"],
            "rubric": state["rubric"]
        })
        # Clean JSON response
        json_str = result.strip()
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0]
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0]
        
        return {"extracted_answers": json_str}
    except Exception as e:
        print(f"Extract error: {e}")
        return {"extracted_answers": state["student_answer"]}

# Node 2: Grade each extracted answer
def grade_answers_node(state: GradingState):
    print("🤖 Step 2: Grading answers with AI...")
    try:
        chain = grade_prompt | llm | StrOutputParser()
        result = chain.invoke({
            "rubric": state["rubric"],
            "total_marks": state["total_marks"],
            "extracted_answers": state["extracted_answers"]
        })
        # Clean JSON
        json_str = result.strip()
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0]
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0]

        # Get total score
        grades_data = json.loads(json_str)
        total_score = grades_data.get("total_score", 0)

        return {
            "individual_grades": json_str,
            "final_score": total_score
        }
    except Exception as e:
        print(f"Grade error: {e}")
        return {
            "individual_grades": "{}",
            "final_score": 0
        }

# Node 3: Generate detailed feedback
def generate_feedback_node(state: GradingState):
    print("💬 Step 3: Generating feedback...")
    try:
        chain = feedback_prompt | llm | StrOutputParser()
        result = chain.invoke({
            "individual_grades": state["individual_grades"]
        })
        # Clean JSON
        json_str = result.strip()
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0]
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0]

        feedback_data = json.loads(json_str)

        return {
            "justification": feedback_data.get("justification", ""),
            "strengths": feedback_data.get("strengths", ""),
            "improvements": feedback_data.get("improvements", "")
        }
    except Exception as e:
        print(f"Feedback error: {e}")
        return {
            "justification": "Could not generate feedback",
            "strengths": "",
            "improvements": ""
        }

# ─────────────────────────────────────────
# BUILD LANGGRAPH PIPELINE
# This connects all nodes together
# Like a flowchart of AI steps!
# ─────────────────────────────────────────
def build_grading_pipeline():
    # Create the graph
    workflow = StateGraph(GradingState)

    # Add nodes (steps)
    workflow.add_node("extract", extract_answers_node)
    workflow.add_node("grade", grade_answers_node)
    workflow.add_node("feedback", generate_feedback_node)

    # Connect nodes in order
    # extract → grade → feedback → END
    workflow.set_entry_point("extract")
    workflow.add_edge("extract", "grade")
    workflow.add_edge("grade", "feedback")
    workflow.add_edge("feedback", END)

    # Compile and return
    return workflow.compile()

# Build pipeline once when server starts
print("🔧 Building Langgraph grading pipeline...")
grading_pipeline = build_grading_pipeline()
print("✅ Grading pipeline ready!")


# Threshold-based marking using embeddings
def threshold_based_score(
    student_answer: str,
    rubric: str,
    total_marks: int
) -> dict:
    try:
        from sentence_transformers import SentenceTransformer
        import numpy as np
        
        print("🧮 Running threshold-based scoring...")
        
        # Load model
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Get embeddings
        student_embedding = model.encode([student_answer])[0]
        rubric_embedding = model.encode([rubric])[0]
        
        # Cosine similarity
        similarity = np.dot(
            student_embedding, 
            rubric_embedding
        ) / (
            np.linalg.norm(student_embedding) * 
            np.linalg.norm(rubric_embedding)
        )
        
        # Threshold-based marking
        if similarity >= 0.85:
            score = total_marks          # Full marks
            level = "Excellent"
        elif similarity >= 0.70:
            score = int(total_marks * 0.8)  # 80%
            level = "Good"
        elif similarity >= 0.60:
            score = int(total_marks * 0.6)  # 60%
            level = "Partial"
        elif similarity >= 0.40:
            score = int(total_marks * 0.4)  # 40%
            level = "Below Average"
        else:
            score = int(total_marks * 0.2)  # 20%
            level = "Poor"
        
        print(f"✅ Similarity: {similarity:.2f} → Score: {score}/{total_marks}")
        
        return {
            "score": score,
            "similarity": round(float(similarity), 3),
            "level": level,
            "method": "threshold_embedding"
        }
        
    except Exception as e:
        print(f"Threshold scoring error: {e}")
        return {
            "score": 0,
            "similarity": 0,
            "level": "Error",
            "method": "failed"
        }
# ─────────────────────────────────────────
# REQUEST/RESPONSE MODELS
# ─────────────────────────────────────────
class GradeRequest(BaseModel):
    student_answer: str
    rubric: str
    total_marks: int
    student_name: Optional[str] = "Unknown"
    student_roll: Optional[str] = "Unknown"

    class Config:
        # Allow extra fields without error
        extra = "allow"

class GradeResponse(BaseModel):
    student_name: str
    student_roll: str
    final_score: int
    total_marks: int
    percentage: float
    justification: str
    strengths: str
    improvements: str
    individual_grades: dict
    pipeline_steps: List[str]

# ─────────────────────────────────────────
# API ROUTES
# ─────────────────────────────────────────

@router.post("/answer", response_model=GradeResponse)
async def grade_answer(request: GradeRequest):
    try:
        print(f"\n🎯 Grading for: {request.student_name}")

        # Run through Langgraph pipeline
        result = grading_pipeline.invoke({
            "student_answer": request.student_answer,
            "rubric": request.rubric,
            "total_marks": request.total_marks,
            "extracted_answers": "",
            "individual_grades": "",
            "final_score": 0,
            "justification": "",
            "strengths": "",
            "improvements": "",
            "plagiarism_flag": False
        })

        # Parse individual grades
        try:
            grades_data = json.loads(result["individual_grades"])
        except:
            grades_data = {}

        percentage = (result["final_score"] / request.total_marks) * 100

        print(f"✅ Grading complete! Score: {result['final_score']}/{request.total_marks}")

        return GradeResponse(
            student_name=request.student_name,
            student_roll=request.student_roll,
            final_score=result["final_score"],
            total_marks=request.total_marks,
            percentage=round(percentage, 2),
            justification=result["justification"],
            strengths=result["strengths"],
            improvements=result["improvements"],
            individual_grades=grades_data,
            pipeline_steps=[
                "✅ Step 1: Answers extracted",
                "✅ Step 2: AI graded each answer",
                "✅ Step 3: Feedback generated"
            ]
        )

    except Exception as e:
        print(f"Grading pipeline error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Grading failed: {str(e)}"
        )
