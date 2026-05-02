from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from ..database import get_db
from ..models.user import UserInDB
from ..routers.auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import io
from PyPDF2 import PdfReader

router = APIRouter()

@router.get("/profile")
async def get_profile(current_user: UserInDB = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "id": str(current_user.id),
            "name": current_user.name,
            "email": current_user.email
        }
    }

@router.post("/uploadpdf")
async def upload_pdf(
    pdf: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        if not pdf.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        file_name = pdf.filename
        user_id = current_user.id

        # Check if PDF already exists for this user
        existing_pdf = await db.pdfs.find_one({"user_id": user_id, "file_name": file_name})
        if existing_pdf:
            return {
                "message": "Agent is ready to chat (cached)",
                "pdf_id": existing_pdf["pdf_id"],
                "namespace": existing_pdf["namespace"]
            }

        # Read PDF content
        content = await pdf.read()

        # Extract text from PDF
        pdf_reader = PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        # For now, just store basic info without embeddings
        # TODO: Add vector processing when dependencies are installed

        # Create namespace
        pdf_id = file_name
        namespace = f"user_{user_id}_pdf_{pdf_id.replace(' ', '_')}"

        # Save PDF metadata to database
        pdf_doc = {
            "user_id": user_id,
            "file_name": file_name,
            "pdf_id": pdf_id,
            "namespace": namespace,
            "content": text[:5000],  # Store first 5000 chars for basic chat
            "created_at": datetime.utcnow()
        }

        result = await db.pdfs.insert_one(pdf_doc)

        return {
            "message": "PDF uploaded successfully (basic processing)",
            "pdf_id": pdf_id,
            "namespace": namespace
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.get("/pdfs")
async def get_pdfs(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        pdfs_cursor = db.pdfs.find(
            {"user_id": current_user.id}
        ).sort("created_at", -1)

        pdfs = []
        async for pdf_doc in pdfs_cursor:
            pdfs.append({
                "id": str(pdf_doc["_id"]),
                "file_name": pdf_doc["file_name"],
                "pdf_id": pdf_doc["pdf_id"],
                "namespace": pdf_doc["namespace"],
                "created_at": pdf_doc["created_at"]
            })

        return {"success": True, "pdfs": pdfs}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching PDFs: {str(e)}")

@router.delete("/pdfs/{pdf_id}")
async def delete_pdf(
    pdf_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        result = await db.pdfs.delete_one({"user_id": current_user.id, "pdf_id": pdf_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="PDF not found")

        return {
            "success": True,
            "message": "PDF deleted successfully",
            "pdf_id": pdf_id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting PDF: {str(e)}")

@router.post("/chat")
async def chat(
    question: str = Form(...),
    pdf_id: str = Form(...),
    history: str = Form("[]"),  # JSON string of chat history
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        import json
        history_list = json.loads(history)

        if not question or not pdf_id:
            raise HTTPException(status_code=400, detail="question and pdf_id are required")

        user_id = current_user.id

        # Find PDF document
        pdf_doc = await db.pdfs.find_one({"user_id": user_id, "pdf_id": pdf_id})
        if not pdf_doc:
            raise HTTPException(status_code=404, detail="PDF not found")

        # Get stored content
        context = pdf_doc.get("content", "")

        if not context:
            return {"answer": "No content available for this PDF."}

        # Simple keyword-based response (TODO: Replace with AI when dependencies are ready)
        question_lower = question.lower()
        context_lower = context.lower()

        # Basic keyword matching
        if any(keyword in context_lower for keyword in question_lower.split()):
            answer = f"Based on the PDF content, I found relevant information. Here's a summary: {context[:500]}..."
        else:
            answer = "I couldn't find specific information about that in the PDF. Please try rephrasing your question or ask about general topics."

        return {"answer": answer}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")