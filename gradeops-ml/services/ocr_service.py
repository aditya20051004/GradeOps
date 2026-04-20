# services/ocr_service.py
# Complete Multi-Model OCR Pipeline
# Local: PyMuPDF, Tesseract, TrOCR
# Cloud: Nougat, Qwen2-VL (Google Colab)

from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import pytesseract
import pypdf
import io
import os
import requests
import base64

router = APIRouter()

# ─────────────────────────────────────────
# COLAB API URL
# Update this when Colab is running!
# ─────────────────────────────────────────
COLAB_API_URL = os.getenv(
    "COLAB_API_URL", 
    ""  # Empty = Colab not connected
)

# ─────────────────────────────────────────
# MODEL 1: DIGITAL PDF
# Fastest - for typed PDFs
# ─────────────────────────────────────────
def extract_text_from_digital_pdf(pdf_bytes):
    try:
        pdf_reader = pypdf.PdfReader(
            io.BytesIO(pdf_bytes)
        )
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Digital PDF error: {e}")
        return ""

# ─────────────────────────────────────────
# MODEL 2: PyMuPDF
# Good for scanned PDFs
# ─────────────────────────────────────────
def extract_with_pymupdf(pdf_bytes):
    try:
        import fitz
        print("📄 Using PyMuPDF...")
        
        pdf_document = fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        )
        
        all_text = ""
        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            page_text = page.get_text()
            
            if page_text and len(page_text.strip()) > 20:
                all_text += page_text + "\n"
            else:
                mat = fitz.Matrix(2.0, 2.0)
                pix = page.get_pixmap(matrix=mat)
                img_bytes = pix.tobytes("png")
                image = Image.open(io.BytesIO(img_bytes))
                page_text = extract_with_tesseract(image)
                all_text += page_text + "\n"
        
        pdf_document.close()
        return all_text.strip()
        
    except Exception as e:
        print(f"PyMuPDF error: {e}")
        return ""

# ─────────────────────────────────────────
# MODEL 3: TESSERACT
# Open source OCR
# ─────────────────────────────────────────
def extract_with_tesseract(image):
    try:
        print("🔍 Using Tesseract...")
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(
            image,
            config=custom_config
        )
        return text.strip()
    except Exception as e:
        print(f"Tesseract error: {e}")
        return ""

# ─────────────────────────────────────────
# MODEL 4: TrOCR (HuggingFace)
# Microsoft handwriting model
# ─────────────────────────────────────────
def extract_with_trocr(image):
    try:
        from transformers import pipeline
        print("🤗 Using TrOCR (Microsoft)...")
        
        ocr_pipeline = pipeline(
            "image-to-text",
            model="microsoft/trocr-base-handwritten"
        )
        result = ocr_pipeline(image)
        return result[0]['generated_text']
    except Exception as e:
        print(f"TrOCR error: {e}")
        return ""

# ─────────────────────────────────────────
# MODEL 5: NOUGAT (Meta) via Google Colab
# Best for academic papers
# ─────────────────────────────────────────
def extract_with_nougat_colab(image_path):
    try:
        if not COLAB_API_URL:
            print("⚠️ Colab not connected, skipping Nougat")
            return ""
            
        print("☁️ Using Nougat via Google Colab...")
        
        # Convert image to base64
        with open(image_path, 'rb') as f:
            image_base64 = base64.b64encode(
                f.read()
            ).decode('utf-8')
        
        # Call Colab API
        response = requests.post(
            f"{COLAB_API_URL}/nougat",
            json={"image_base64": image_base64},
            timeout=60
        )
        
        if response.ok:
            result = response.json()
            text = result.get("extracted_text", "")
            print(f"✅ Nougat: {len(text)} chars!")
            return text
        else:
            print(f"❌ Nougat API failed: {response.status_code}")
            return ""
            
    except Exception as e:
        print(f"Nougat Colab error: {e}")
        return ""

# ─────────────────────────────────────────
# MODEL 6: QWEN2-VL (Alibaba) via Google Colab
# Best for handwritten content
# ─────────────────────────────────────────
def extract_with_qwen_vl_colab(image_path):
    try:
        if not COLAB_API_URL:
            print("⚠️ Colab not connected, skipping Qwen-VL")
            return ""
            
        print("☁️ Using Qwen2-VL via Google Colab...")
        
        # Convert image to base64
        with open(image_path, 'rb') as f:
            image_base64 = base64.b64encode(
                f.read()
            ).decode('utf-8')
        
        # Call Colab API
        response = requests.post(
            f"{COLAB_API_URL}/ocr",
            json={"image_base64": image_base64},
            timeout=60
        )
        
        if response.ok:
            result = response.json()
            text = result.get("extracted_text", "")
            print(f"✅ Qwen2-VL: {len(text)} chars!")
            return text
        else:
            print(f"❌ Qwen-VL API failed: {response.status_code}")
            return ""
            
    except Exception as e:
        print(f"Qwen-VL Colab error: {e}")
        return ""

# ─────────────────────────────────────────
# SMART OCR PIPELINE
# Tries each model automatically
# ─────────────────────────────────────────
def smart_ocr(pdf_bytes):
    
    # STEP 1: Digital PDF (fastest)
    print("📄 Step 1: Digital PDF extraction...")
    text = extract_text_from_digital_pdf(pdf_bytes)
    if text and len(text.strip()) > 50:
        print("✅ Digital PDF successful!")
        return {
            "text": text,
            "method": "digital_pdf",
            "confidence": "high"
        }
    
    # STEP 2: PyMuPDF
    print("📄 Step 2: PyMuPDF...")
    text = extract_with_pymupdf(pdf_bytes)
    if text and len(text.strip()) > 20:
        print("✅ PyMuPDF successful!")
        return {
            "text": text,
            "method": "pymupdf",
            "confidence": "high"
        }
    
    # STEP 3: Tesseract
    print("🔍 Step 3: Tesseract OCR...")
    try:
        import fitz
        pdf_doc = fitz.open(
            stream=pdf_bytes, 
            filetype="pdf"
        )
        page = pdf_doc[0]
        pix = page.get_pixmap(
            matrix=fitz.Matrix(2, 2)
        )
        image = Image.open(
            io.BytesIO(pix.tobytes("png"))
        )
        pdf_doc.close()
        
        text = extract_with_tesseract(image)
        if text and len(text.strip()) > 20:
            print("✅ Tesseract successful!")
            return {
                "text": text,
                "method": "tesseract",
                "confidence": "medium"
            }
    except Exception as e:
        print(f"Tesseract pipeline error: {e}")
    
    # STEP 4: TrOCR
    print("🤗 Step 4: TrOCR (HuggingFace)...")
    try:
        import fitz
        pdf_doc = fitz.open(
            stream=pdf_bytes, 
            filetype="pdf"
        )
        page = pdf_doc[0]
        pix = page.get_pixmap(
            matrix=fitz.Matrix(2, 2)
        )
        image = Image.open(
            io.BytesIO(pix.tobytes("png"))
        )
        pdf_doc.close()
        
        text = extract_with_trocr(image)
        if text and len(text.strip()) > 10:
            print("✅ TrOCR successful!")
            return {
                "text": text,
                "method": "trocr_microsoft",
                "confidence": "high"
            }
    except Exception as e:
        print(f"TrOCR pipeline error: {e}")

    # STEP 5: Nougat via Colab
    print("☁️ Step 5: Nougat (Meta) via Colab...")
    try:
        import fitz
        import tempfile
        
        pdf_doc = fitz.open(
            stream=pdf_bytes, 
            filetype="pdf"
        )
        page = pdf_doc[0]
        pix = page.get_pixmap(
            matrix=fitz.Matrix(2, 2)
        )
        
        with tempfile.NamedTemporaryFile(
            suffix='.png', 
            delete=False
        ) as tmp:
            tmp.write(pix.tobytes("png"))
            tmp_path = tmp.name
        
        pdf_doc.close()
        
        text = extract_with_nougat_colab(tmp_path)
        os.unlink(tmp_path)
        
        if text and len(text.strip()) > 10:
            print("✅ Nougat successful!")
            return {
                "text": text,
                "method": "nougat_meta_colab",
                "confidence": "high"
            }
    except Exception as e:
        print(f"Nougat pipeline error: {e}")

    # STEP 6: Qwen2-VL via Colab
    print("☁️ Step 6: Qwen2-VL (Alibaba) via Colab...")
    try:
        import fitz
        import tempfile
        
        pdf_doc = fitz.open(
            stream=pdf_bytes, 
            filetype="pdf"
        )
        page = pdf_doc[0]
        pix = page.get_pixmap(
            matrix=fitz.Matrix(2, 2)
        )
        
        with tempfile.NamedTemporaryFile(
            suffix='.png', 
            delete=False
        ) as tmp:
            tmp.write(pix.tobytes("png"))
            tmp_path = tmp.name
        
        pdf_doc.close()
        
        text = extract_with_qwen_vl_colab(tmp_path)
        os.unlink(tmp_path)
        
        if text and len(text.strip()) > 10:
            print("✅ Qwen2-VL successful!")
            return {
                "text": text,
                "method": "qwen2_vl_alibaba_colab",
                "confidence": "very_high"
            }
    except Exception as e:
        print(f"Qwen-VL pipeline error: {e}")

    # ALL FAILED
    print("❌ All OCR methods failed!")
    return {
        "text": "Could not extract text from PDF",
        "method": "failed",
        "confidence": "none"
    }

# ─────────────────────────────────────────
# API ROUTES
# ─────────────────────────────────────────
@router.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()
        print(f"📄 Processing: {file.filename}")
        result = smart_ocr(pdf_bytes)
        
        return {
            "filename": file.filename,
            "extracted_text": result["text"],
            "method_used": result["method"],
            "confidence": result["confidence"],
            "word_count": len(result["text"].split()),
            "colab_connected": bool(COLAB_API_URL)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR failed: {str(e)}"
        )

@router.post("/extract-from-path")
async def extract_from_path(data: dict):
    try:
        file_path = data.get("file_path", "")
        
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(
                status_code=400,
                detail=f"File not found: {file_path}"
            )
        
        print(f"📄 Processing: {file_path}")
        
        with open(file_path, 'rb') as f:
            pdf_bytes = f.read()
        
        result = smart_ocr(pdf_bytes)
        
        return {
            "extracted_text": result["text"],
            "method_used": result["method"],
            "confidence": result["confidence"],
            "colab_connected": bool(COLAB_API_URL)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Extraction failed: {str(e)}"
        )

@router.post("/extract-text")
async def extract_from_text(data: dict):
    try:
        text = data.get("text", "")
        return {
            "extracted_text": text,
            "method_used": "direct_text",
            "confidence": "high",
            "word_count": len(text.split())
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/status")
async def ocr_status():
    return {
        "local_models": [
            "digital_pdf",
            "pymupdf", 
            "tesseract",
            "trocr_microsoft"
        ],
        "cloud_models": [
            "nougat_meta",
            "qwen2_vl_alibaba"
        ],
        "colab_connected": bool(COLAB_API_URL),
        "colab_url": COLAB_API_URL or "Not connected"
    }
