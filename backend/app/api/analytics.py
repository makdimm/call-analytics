from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.api.deps import get_current_user, require_admin
from app.models.user import User, UserRole
from app.models.call import Call, CallStatus, ScriptCompliance
from app.schemas.analytics import (
    DashboardStats, ManagerStats, ManagerDetail,
    ComplianceTrend, CriteriaAvg, CallTypeStats
)
from datetime import datetime, timedelta, timezone
from collections import defaultdict

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

CRITERIA_KEYS = [
    "greeting", "speech", "initiative", "programming",
    "qualification", "pain", "product", "expertise",
    "closing", "push", "next_step", "framing",
]


def _extract_analysis_metrics(analysis: dict | None) -> dict:
    """Extract structured metrics from the analysis JSON."""
    if not analysis:
        return {}
    
    cs = analysis.get("criteria_scores", {})
    emotions = analysis.get("emotions") or {}
    fg = analysis.get("fg_score")
    call_type = analysis.get("call_type")
    warmth = analysis.get("warmth")
    obj_count = analysis.get("objection_count", 0)
    manager_tone = analysis.get("manager_tone")
    client_tone = analysis.get("client_tone")
    
    # Emotions might have manager_speech_ratio inside
    talk_ratio = emotions.get("manager_speech_ratio") if isinstance(emotions, dict) else None
    
    return {
        "criteria_scores": cs,
        "fg_score": fg,
        "call_type": call_type,
        "warmth": warmth,
        "objection_count": obj_count,
        "manager_tone": manager_tone,
        "client_tone": client_tone,
        "talk_ratio": talk_ratio,
    }


def _avg_criteria(criteria_list: list[dict]) -> dict:
    """Compute average for each criteria across multiple calls."""
    sums = defaultdict(float)
    counts = defaultdict(int)
    for c in criteria_list:
        if not c:
            continue
        for key in CRITERIA_KEYS:
            val = c.get(key)
            if val is not None and isinstance(val, (int, float)):
                sums[key] += val
                counts[key] += 1
    result = {}
    for key in CRITERIA_KEYS:
        if counts.get(key, 0) > 0:
            result[key] = round(sums[key] / counts[key], 2)
    return result


def _build_call_type_stats(calls_data: list) -> list[CallTypeStats]:
    """Aggregate calls by call_type."""
    groups = defaultdict(lambda: {"count": 0, "fg_sum": 0, "fg_count": 0, "dur_sum": 0})
    for c in calls_data:
        ct = c.get("call_type", "unknown")
        groups[ct]["count"] += 1
        groups[ct]["dur_sum"] += c.get("duration_seconds") or 0
        fg = c.get("fg_score")
        if fg is not None:
            groups[ct]["fg_sum"] += fg
            groups[ct]["fg_count"] += 1
    result = []
    for ct, data in sorted(groups.items()):
        avg_fg = round(data["fg_sum"] / data["fg_count"], 1) if data["fg_count"] > 0 else None
        result.append(CallTypeStats(
            call_type=ct,
            count=data["count"],
            avg_fg=avg_fg,
            total_duration=round(data["dur_sum"], 1),
        ))
    return result


def _build_warmth_distribution(calls_data: list) -> dict[str, int]:
    dist = defaultdict(int)
    for c in calls_data:
        w = c.get("warmth", "unknown")
        dist[w] += 1
    return dict(sorted(dist.items()))


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Base filter
    base = select(Call).where(Call.created_at >= since)
    if current_user.role != UserRole.ADMIN:
        base = base.where(Call.manager_id == current_user.id)

    # Total counts
    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0

    processed = (await db.execute(
        select(func.count()).select_from(base.where(Call.status == CallStatus.ANALYZED).subquery())
    )).scalar() or 0

    pending = (await db.execute(
        select(func.count()).select_from(base.where(Call.status.in_([CallStatus.UPLOADED, CallStatus.PROCESSING])).subquery())
    )).scalar() or 0

    failed = (await db.execute(
        select(func.count()).select_from(base.where(Call.status == CallStatus.FAILED).subquery())
    )).scalar() or 0

    # Avg compliance
    analyzed_base = base.where(
        Call.status == CallStatus.ANALYZED,
        Call.compliance_score.isnot(None),
    )
    avg_compliance = (await db.execute(
        select(func.avg(Call.compliance_score)).select_from(analyzed_base.subquery())
    )).scalar()

    avg_talk = (await db.execute(
        select(func.avg(Call.talk_ratio)).select_from(analyzed_base.subquery())
    )).scalar()

    # Compliance distribution
    dist = {}
    for level in ScriptCompliance:
        cnt = (await db.execute(
            select(func.count()).select_from(
                base.where(Call.script_compliance == level, Call.status == CallStatus.ANALYZED).subquery()
            )
        )).scalar() or 0
        dist[level.value] = cnt

    # Keywords
    all_analyzed = await db.execute(
        select(Call.keywords_found).select_from(analyzed_base.subquery()).limit(100)
    )
    keyword_count = {}
    for row in all_analyzed:
        if row[0]:
            for kw in row[0]:
                keyword_count[kw] = keyword_count.get(kw, 0) + 1
    top_keywords = [{"word": k, "count": v} for k, v in sorted(keyword_count.items(), key=lambda x: -x[1])[:20]]

    # Fetch all analyzed calls for criteria aggregation
    analyzed_calls_q = await db.execute(
        select(Call).options(selectinload(Call.manager)).where(
            Call.created_at >= since,
            Call.status == CallStatus.ANALYZED,
        )
    )
    analyzed_calls = analyzed_calls_q.scalars().all()

    # Extract analysis metrics per call
    calls_metrics = []
    all_criteria = []
    all_fg = []
    for c in analyzed_calls:
        metrics = _extract_analysis_metrics(c.analysis)
        criteria = metrics.get("criteria_scores", {})
        if criteria:
            all_criteria.append(criteria)
        fg = metrics.get("fg_score")
        if fg is not None:
            all_fg.append(fg)
        calls_metrics.append(metrics)

    # Compute avg FG score
    avg_fg = round(sum(all_fg) / len(all_fg), 1) if all_fg else None

    # Call type distribution
    call_type_dist = _build_call_type_stats(calls_metrics)

    # Warmth distribution
    warmth_dist = _build_warmth_distribution(calls_metrics)

    # Manager stats
    manager_stats = []
    if current_user.role == UserRole.ADMIN:
        managers = await db.execute(select(User).where(User.role == UserRole.MANAGER, User.is_active == True))
        for mgr in managers.scalars().all():
            mgr_calls = [c for c in analyzed_calls if c.manager_id == mgr.id]

            mgr_metrics = []
            mgr_criteria = []
            mgr_fg = []
            mgr_objects_count = 0
            mgr_objects_total = 0
            for c in mgr_calls:
                m = _extract_analysis_metrics(c.analysis)
                cs = m.get("criteria_scores", {})
                if cs:
                    mgr_criteria.append(cs)
                fg = m.get("fg_score")
                if fg is not None:
                    mgr_fg.append(fg)
                mgr_metrics.append(m)
                mgr_objects_count += m.get("objection_count", 0)
                mgr_objects_total += 1

            mgr_base = select(Call).where(Call.manager_id == mgr.id, Call.created_at >= since)
            mgr_total = (await db.execute(select(func.count()).select_from(mgr_base.subquery()))).scalar() or 0
            mgr_avg_comp = (await db.execute(
                select(func.avg(Call.compliance_score)).select_from(
                    mgr_base.where(Call.status == CallStatus.ANALYZED, Call.compliance_score.isnot(None)).subquery()
                )
            )).scalar()
            mgr_avg_talk = (await db.execute(
                select(func.avg(Call.talk_ratio)).select_from(
                    mgr_base.where(Call.status == CallStatus.ANALYZED).subquery()
                )
            )).scalar()
            mgr_avg_dur = (await db.execute(
                select(func.avg(Call.duration_seconds)).select_from(
                    mgr_base.where(Call.status == CallStatus.ANALYZED).subquery()
                )
            )).scalar()
            last_call = (await db.execute(
                select(Call.created_at).where(
                    Call.manager_id == mgr.id, Call.status == CallStatus.ANALYZED
                ).order_by(desc(Call.created_at)).limit(1)
            )).scalar()

            non_comp = (await db.execute(
                select(func.count()).select_from(
                    mgr_base.where(Call.script_compliance == ScriptCompliance.NON_COMPLIANT).subquery()
                )
            )).scalar() or 0
            partial = (await db.execute(
                select(func.count()).select_from(
                    mgr_base.where(Call.script_compliance == ScriptCompliance.PARTIAL).subquery()
                )
            )).scalar() or 0

            # Avg criteria per manager
            mgr_criteria_avg = CriteriaAvg(**_avg_criteria(mgr_criteria)) if mgr_criteria else None
            avg_mgr_fg = round(sum(mgr_fg) / len(mgr_fg), 1) if mgr_fg else None

            # Call type breakdown per manager
            mgr_ct_stats = _build_call_type_stats(mgr_metrics)

            manager_stats.append(ManagerStats(
                manager_id=mgr.id,
                manager_name=mgr.username,
                total_calls=mgr_total,
                processed_calls=len(mgr_calls),
                avg_duration=mgr_avg_dur,
                avg_compliance=mgr_avg_comp,
                avg_talk_ratio=mgr_avg_talk,
                avg_fg_score=avg_mgr_fg,
                criteria_avg=mgr_criteria_avg,
                non_compliant_count=non_comp,
                partial_count=partial,
                last_call_at=last_call,
                call_type_breakdown=mgr_ct_stats,
            ))

    # Recent calls
    recent_q = await db.execute(
        select(Call).options(selectinload(Call.manager)).where(Call.created_at >= since).order_by(desc(Call.created_at)).limit(10)
    )
    recent = []
    for c in recent_q.scalars().all():
        m = _extract_analysis_metrics(c.analysis)
        recent.append({
            "id": c.id,
            "manager_name": c.manager.username if c.manager else None,
            "status": c.status.value,
            "compliance": c.script_compliance.value if c.script_compliance else None,
            "compliance_score": c.compliance_score,
            "fg_score": m.get("fg_score"),
            "call_type": m.get("call_type"),
            "warmth": m.get("warmth"),
            "duration": c.duration_seconds,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })

    return DashboardStats(
        total_calls=total,
        processed_calls=processed,
        pending_calls=pending,
        failed_calls=failed,
        avg_compliance_score=avg_compliance,
        avg_talk_ratio=avg_talk,
        avg_fg_score=avg_fg,
        compliance_distribution=dist,
        call_type_distribution=call_type_dist,
        warmth_distribution=warmth_dist,
        top_keywords=top_keywords,
        manager_stats=manager_stats,
        recent_calls=recent,
    )


@router.get("/managers/{manager_id}", response_model=ManagerDetail)
async def get_manager_detail(
    manager_id: int,
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mgr = await db.get(User, manager_id)
    if not mgr:
        raise HTTPException(status_code=404, detail="Менеджер не найден")

    since = datetime.now(timezone.utc) - timedelta(days=days)
    base = select(Call).where(Call.manager_id == manager_id, Call.created_at >= since)

    # Stats
    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0
    processed = (await db.execute(
        select(func.count()).select_from(base.where(Call.status == CallStatus.ANALYZED).subquery())
    )).scalar() or 0
    avg_score = (await db.execute(
        select(func.avg(Call.compliance_score)).select_from(
            base.where(Call.status == CallStatus.ANALYZED, Call.compliance_score.isnot(None)).subquery()
        )
    )).scalar()
    avg_talk = (await db.execute(
        select(func.avg(Call.talk_ratio)).select_from(
            base.where(Call.status == CallStatus.ANALYZED).subquery()
        )
    )).scalar()
    avg_dur = (await db.execute(
        select(func.avg(Call.duration_seconds)).select_from(
            base.where(Call.status == CallStatus.ANALYZED).subquery()
        )
    )).scalar()
    last_call = (await db.execute(
        select(Call.created_at).where(Call.manager_id == manager_id).order_by(desc(Call.created_at)).limit(1)
    )).scalar()

    non_comp = (await db.execute(
        select(func.count()).select_from(base.where(Call.script_compliance == ScriptCompliance.NON_COMPLIANT).subquery())
    )).scalar() or 0
    partial = (await db.execute(
        select(func.count()).select_from(base.where(Call.script_compliance == ScriptCompliance.PARTIAL).subquery())
    )).scalar() or 0

    # Get analyzed calls for criteria
    analyzed_calls_q = await db.execute(
        select(Call).options(selectinload(Call.manager)).where(
            Call.manager_id == manager_id,
            Call.created_at >= since,
            Call.status == CallStatus.ANALYZED,
        )
    )
    analyzed_calls = analyzed_calls_q.scalars().all()
    mgr_criteria = []
    mgr_fg = []
    mgr_metrics = []
    for c in analyzed_calls:
        m = _extract_analysis_metrics(c.analysis)
        mgr_metrics.append(m)
        cs = m.get("criteria_scores", {})
        if cs:
            mgr_criteria.append(cs)
        fg = m.get("fg_score")
        if fg is not None:
            mgr_fg.append(fg)

    mgr_criteria_avg = CriteriaAvg(**_avg_criteria(mgr_criteria)) if mgr_criteria else None
    avg_mgr_fg = round(sum(mgr_fg) / len(mgr_fg), 1) if mgr_fg else None
    mgr_ct_stats = _build_call_type_stats(mgr_metrics)

    stats = ManagerStats(
        manager_id=mgr.id,
        manager_name=mgr.username,
        total_calls=total,
        processed_calls=processed,
        avg_duration=avg_dur,
        avg_compliance=avg_score,
        avg_talk_ratio=avg_talk,
        avg_fg_score=avg_mgr_fg,
        criteria_avg=mgr_criteria_avg,
        non_compliant_count=non_comp,
        partial_count=partial,
        last_call_at=last_call,
        call_type_breakdown=mgr_ct_stats,
    )

    # Recent calls
    recent_q = await db.execute(
        select(Call).options(selectinload(Call.manager)).where(Call.manager_id == manager_id).order_by(desc(Call.created_at)).limit(20)
    )
    recent = []
    for c in recent_q.scalars().all():
        m = _extract_analysis_metrics(c.analysis)
        recent.append({
            "id": c.id,
            "filename": c.original_filename,
            "status": c.status.value,
            "compliance": c.script_compliance.value if c.script_compliance else None,
            "compliance_score": c.compliance_score,
            "fg_score": m.get("fg_score"),
            "call_type": m.get("call_type"),
            "warmth": m.get("warmth"),
            "duration": c.duration_seconds,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })

    return ManagerDetail(
        manager={"id": mgr.id, "username": mgr.username, "email": mgr.email, "role": mgr.role.value},
        stats=stats,
        recent_calls=recent,
    )
