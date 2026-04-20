# 🎓 GradeOps - AI-Powered Exam Grading System

An intelligent Human-in-the-Loop (HITL) grading pipeline 
that uses Vision-Language Models and Agentic LLMs to 
evaluate scanned exams against strict rubrics.

## 🚀 Tech Stack

- **Frontend**: React.js + Vite
- **Backend**: Node.js + Express
- **ML Service**: Python + FastAPI
- **Database**: MongoDB Atlas
- **AI**: Langchain + Langgraph + Groq
- **API**: Groq,Ngroq
- **OCR**: HuggingFace TrOCR + PyMuPDF + Nougat + Qwen/Qwen2-VL-2B-Instruct
- **Plagiarism**: Cosine Similarity + Sentence Transformers

## 📋 Prerequisites

- Node.js v18+
- Python 3.10+
- MongoDB Atlas account (free)
- Groq API key (free)

## ⚙️ Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/gradeops.git
cd gradeops
```

### 2. Setup Frontend
```bash
cd grade_ops_cc_club
npm install
npm run dev
```

### 3. Setup Backend
```bash
cd gradeops-backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your keys

node server.js
```

### 4. Setup Python ML
```bash
cd gradeops-ml
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your Groq key

python3 main.py
```

### 5. Google Collab Set up
1. Go to GoogleCollab.txt and read this document to get idea
2. After Running you will get a url in collab result shell
3. copy that
4. add to your .env file as .env.example is written

## 🔑 Required API Keys

### MongoDB Atlas (Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string

### Groq API (Free)
1. Go to https://console.groq.com
2. Create free account
3. Generate API key



## 🌐 Running the App

Start all 3 services:

| Service | Command | Port |
|---------|---------|------|
| Frontend | `npm run dev` | 5173 |
| Backend | `node server.js` | 5001 |
| Python ML | `python3 main.py` | 8000 |

Then open: http://localhost:5173

## 👤 Default Login
Instructor:
Email: aditya@test.com
Password: 123456
TA:
Email: ta@test.com
Password: 123456

## 📊 Evaluation Results

### System Performance
| Metric | Score | Benchmark |
|--------|-------|-----------|
| MAE | 3.9 marks | Human: 2-4 marks ✅ |
| Accuracy (±1) | 40% | Acceptable ✅ |
| Accuracy (±2) | 50% | Good ✅ |
| Consistency | 100% | Perfect 🏆 |
| OCR WER | 0.0% | Perfect 🏆 |
| Throughput | 7.5/min | Fast ✅ |
| Failed Samples | 0/10 | Perfect 🏆 |

### Key Findings
- 🏆 100% consistency (same input = same output)
- 🏆 0% OCR error rate
- ✅ MAE within human inter-rater range
- ✅ 100% grading success rate

### Future Update
1. Improving the Pipeline For Better Accuracy
2. LIVE DEMO DEPLOY 😊

## architecture
React Frontend (5173)
↓
Node.js Backend (5001)
↓
Python FastAPI ML (8000)
↓
MongoDB Atlas (Cloud)

## 👨‍💻 Developer

Aditya Majumder
