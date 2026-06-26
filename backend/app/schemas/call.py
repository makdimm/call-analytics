from pydantic import BaseModel
from datetime import datetime
from typing import Any


class CriteriaScores(BaseModel):
    greeting: float = 0
    speech: float = 0
    initiative: float = 0
    programming: float = 0
    qualification: float = 0
    pain: float = 0
    product: float = 0
    expertise: float = 0
    closing: float = 0
    push: float = 0
    next_step: float = 0
    framing: float = 0


class CallResponse(BaseModel):
    id: int
    manager_id: int
    manager_name: str | None = None
    original_filename: str
    duration_seconds: float | None = None
    status: str
    transcript: str | None = None
    transcript_confidence: float | None = None
    analysis: dict[str, Any] | None = None
    script_compliance: str | None = None
    compliance_score: float | None = None
    talk_ratio: float | None = None
    emotions: dict | None = None
    keywords_found: list | None = None
    objections_handled: dict | list | None = None
    progress: int = 0
    source: str | None = "upload"
    created_at: datetime
    processed_at: datetime | None = None

    # New competitor-inspired fields
    call_type: str | None = None
    warmth: str | None = None
    fg_score: float | None = None
    criteria_scores: dict[str, float] | None = None
    objection_count: int | None = None
    objection_types: list[str] | None = None
    manager_tone: str | None = None
    client_tone: str | None = None
    strengths: list[str] | None = None
    growth_areas: list[str] | None = None
    exclude_from_rating: bool = False
    client_data: dict | None = None
    conversation: list[dict] | None = None

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
    status: str | None = None
    compliance: str | None = None
    call_type: str | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None
    page: int = 1
    page_size: int = 20
