from pydantic import BaseModel
from datetime import datetime
from typing import Any


class CriteriaAvg(BaseModel):
    greeting: float | None = None
    speech: float | None = None
    initiative: float | None = None
    programming: float | None = None
    qualification: float | None = None
    pain: float | None = None
    product: float | None = None
    expertise: float | None = None
    closing: float | None = None
    push: float | None = None
    next_step: float | None = None
    framing: float | None = None


class CallTypeStats(BaseModel):
    call_type: str
    count: int
    avg_fg: float | None = None
    total_duration: float = 0


class ManagerStats(BaseModel):
    manager_id: int
    manager_name: str
    total_calls: int
    processed_calls: int
    avg_duration: float | None = None
    avg_compliance: float | None = None
    avg_talk_ratio: float | None = None
    avg_fg_score: float | None = None
    criteria_avg: CriteriaAvg | None = None
    complaints_count: int = 0
    partial_count: int = 0
    non_compliant_count: int = 0
    last_call_at: datetime | None = None
    call_type_breakdown: list[CallTypeStats] = []


class DashboardStats(BaseModel):
    total_calls: int
    processed_calls: int
    pending_calls: int
    failed_calls: int
    avg_compliance_score: float | None = None
    avg_talk_ratio: float | None = None
    avg_fg_score: float | None = None
    compliance_distribution: dict[str, int]
    call_type_distribution: list[CallTypeStats] = []
    warmth_distribution: dict[str, int] = {}
    top_keywords: list[dict[str, Any]] = []
    manager_stats: list[ManagerStats] = []
    recent_calls: list[dict[str, Any]] = []


class ComplianceTrend(BaseModel):
    date: str
    avg_score: float
    calls_count: int


class ManagerDetail(BaseModel):
    manager: dict[str, Any]
    stats: ManagerStats
    compliance_trend: list[ComplianceTrend] = []
    recent_calls: list[dict[str, Any]] = []
