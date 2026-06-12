from pydantic import BaseModel
from datetime import datetime
from typing import Any
from app.models.call import CallStatus, ScriptCompliance


class CallResponse(BaseModel):
    id: int
    manager_id: int
    manager_name: str | None = None
    original_filename: str
    duration_seconds: float | None = None
    status: CallStatus
    transcript: str | None = None
    transcript_confidence: float | None = None
    analysis: dict[str, Any] | None = None
    script_compliance: ScriptCompliance | None = None
    compliance_score: float | None = None
    talk_ratio: float | None = None
    emotions: dict | None = None
    keywords_found: list | None = None
    objections_handled: list | None = None
    source: str | None = "upload"
    created_at: datetime
    processed_at: datetime | None = None

    model_config = {"from_attributes": True}


class CallListResponse(BaseModel):
    items: list[CallResponse]
    total: int
    page: int
    page_size: int


class CallUpdate(BaseModel):
    manager_id: int | None = None


class CallFilterParams(BaseModel):
    manager_id: int | None = None
    status: CallStatus | None = None
    compliance: ScriptCompliance | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None
    page: int = 1
    page_size: int = 20
