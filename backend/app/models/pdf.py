from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}

class PDFBase(BaseModel):
    file_name: str
    pdf_id: str
    namespace: str

class PDFCreate(PDFBase):
    user_id: PyObjectId

class PDFInDB(PDFBase):
    id: PyObjectId = None
    user_id: PyObjectId
    created_at: datetime = None

    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class PDFResponse(PDFBase):
    id: str
    user_id: str
    created_at: datetime = None

    model_config = {"from_attributes": True}