# services/ocr_service.py
# This service extracts text from PDF exam scans
# Uses Hugging Face models (as required in project spec)

from fastapi import APIRouter, UploadFile, File, HTTPException
from transformers import pipeline
import pytesseract
from PIL import Image
import pypdf
import io
import os
import tempfile

router = APIRouter()

# ─────────────────────────────────────────
# SIMPLE PDF TEXT EXTRACTOR
# For typed/digital PDFs
# ─────────────────────────────────────────
def extract_text_from_digital_pdf(pdf_bytes):
    try:
        pdf_reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Digital PDF extraction error: {e}")
        return ""

# ─────────────────────────────────────────
# TESSERACT OCR
# For scanned/handwritten PDFs
# ─────────────────────────────────────────
def extract_text_with_tesseract(image):
    try:
        # Configure tesseract for handwritten text
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(
            image, 
            config=custom_config
        )
        return text.strip()
    except Exception as e:
        print(f"Tesseract OCR error: {e}")
        return ""

# ─────────────────────────────────────────
# HUGGING FACE OCR PIPELINE
# More accurate for handwritten text
# ─────────────────────────────────────────
def extract_with_huggingface(image):
    try:
        # Using TrOCR - Microsoft's handwriting recognition model
        # This is on Hugging Face and works great for handwritten text
        ocr_pipeline = pipeline(
            "image-to-text",
            model="microsoft/trocr-base-handwritten"
        )
        result = ocr_pipeline(image)
        return result[0]['generated_text']
    except Exception as e:
        print(f"HuggingFace OCR error: {e}")
        return ""

# ─────────────────────────────────────────
# SMART OCR - Tries best method automatically
# ─────────────────────────────────────────
def smart_ocr(pdf_bytes):
    # Step 1: Try digital PDF first
    text = extract_text_from_digital_pdf(pdf_bytes)
    
    if text and len(text.strip()) > 50:
        print("✅ Digital PDF extracted!")
        return {
            "text": text,
            "method": "digital_pdf",
            "confidence": "high"
        }
    
    # Step 2: Use PyMuPDF (no poppler needed!)
    print("🖼️ Using PyMuPDF for OCR...")
    try:
        import fitz  # PyMuPDF
        import io
        
        # Open PDF from bytes
        pdf_document = fitz.open(
            stream=pdf_bytes, 
            filetype="pdf"
        )
        
        all_text = ""
        
        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            
            # First try direct text extraction
            page_text = page.get_text()
            
            if page_text and len(page_text.strip()) > 20:
                all_text += page_text + "\n"
            else:
                # Convert page to image for OCR
                mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for quality
                clip = page.rect
                pix = page.get_pixmap(matrix=mat)
                
                # Convert to PIL Image
                img_bytes = pix.tobytes("png")
                image = Image.open(io.BytesIO(img_bytes))
                
                # Run Tesseract OCR
                page_text = extract_text_with_tesseract(image)
                all_text += page_text + "\n"
        
        pdf_document.close()
        
        if all_text.strip():
            print(f"✅ PyMuPDF extracted: {len(all_text)} chars")
            return {
                "text": all_text,
                "method": "pymupdf_ocr",
                "confidence": "high"
            }
            
    except Exception as e:
        print(f"PyMuPDF error: {e}")
    
    # Step 3: Try HuggingFace as last resort
    print("🤗 Trying HuggingFace...")
    try:
        import fitz
        import io
        pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page = pdf_doc[0]
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        text = extract_with_huggingface(img)
        pdf_doc.close()
        if text:
            return {
                "text": text,
                "method": "huggingface_trocr",
                "confidence": "high"
            }
    except Exception as e:
        print(f"HuggingFace error: {e}")
    
    return {
        "text": "Could not extract text",
        "method": "failed", 
        "confidence": "none"
    }
# ─────────────────────────────────────────
# API ROUTES
# ─────────────────────────────────────────

# Extract text from uploaded PDF
@router.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    try:
        # Check file type
        if not (file.filename.lower().endswith('.pdf') or file.filename.lower().endswith('.txt')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload a PDF or txt file."
            )

        # Read file bytes
        pdf_bytes = await file.read()
        
        print(f"📄 Processing: {file.filename}")
        
        # Run smart OCR
        result = smart_ocr(pdf_bytes)
        
        return {
            "filename": file.filename,
            "extracted_text": result["text"],
            "method_used": result["method"],
            "confidence": result["confidence"],
            "word_count": len(result["text"].split())
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR failed: {str(e)}"
        )

# Extract from text directly (for testing)
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
    
# ─────────────────────────────────────────
# EXTRACT FROM FILE PATH
# Called by Node.js with file path
# ─────────────────────────────────────────
@router.post("/extract-from-path")
async def extract_from_path(data: dict):
    try:
        file_path = data.get("file_path", "")
        
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(
                status_code=400,
                detail=f"File not found: {file_path}"
            )
        
        print(f"📄 Processing file: {file_path}")
        
        # Read file as bytes
        with open(file_path, 'rb') as f:
            pdf_bytes = f.read()
        
        # Try smart OCR
        result = smart_ocr(pdf_bytes)
        
        return {
            "extracted_text": result["text"],
            "method_used": result["method"],
            "confidence": result["confidence"],
            "file_path": file_path
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Extraction failed: {str(e)}"
        )    