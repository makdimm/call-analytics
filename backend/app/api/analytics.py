from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.core.database import get_db
from app.api.deps import get_current_user, require_admin
from app.models.user import User, UserRole
from app.models.call import Call, CallStatus, ScriptCompliance
from app.schemas.analytics import DashboardStats, ManagerStats, ManagerDetail, ComplianceTrend
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


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

    # Manager stats
    manager_stats = []
    if current_user.role == UserRole.ADMIN:
        managers = await db.execute(select(User).where(User.role == UserRole.MANAGER, User.is_active == True))
        for mgr in managers.scalars().all():
            mgr_base = select(Call).where(Call.manager_id == mgr.id, Call.created_at >= since)
            mgr_total = (await db.execute(select(func.count()).select_from(mgr_base.subquery()))).scalar() or 0
            mgr_processed = (await db.execute(
                select(func.count()).select_from(mgr_base.where(Call.status == CallStatus.ANALYZED).subquery())
            )).scalar() or 0
            mgr_avg = (await db.execute(
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

            # Compliance counts
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

            manager_stats.append(ManagerStats(
                manager_id=mgr.id,
                manager_name=mgr.username,
                total_calls=mgr_total,
                processed_calls=mgr_processed,
                avg_duration=mgr_avg_dur,
                avg_compliance=mgr_avg,
                avg_talk_ratio=mgr_avg_talk,
                non_compliant_count=non_comp,
                partial_count=partial,
                last_call_at=last_call,
            ))

    # Recent calls
    recent_q = await db.execute(
        select(Call).where(Call.created_at >= since).order_by(desc(Call.created_at)).limit(10)
    )
    recent = []
    for c in recent_q.scalars().all():
        recent.append({
            "id": c.id,
            "manager_name": c.manager.username if c.manager else None,
            "status": c.status.value,
            "compliance": c.script_compliance.value if c.script_compliance else None,
            "compliance_score": c.compliance_score,
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
        compliance_distribution=dist,
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
        from fastapi import HTTPException
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

    stats = ManagerStats(
        manager_id=mgr.id,
        manager_name=mgr.username,
        total_calls=total,
        processed_calls=processed,
        avg_duration=avg_dur,
        avg_compliance=avg_score,
        avg_talk_ratio=avg_talk,
        non_compliant_count=non_comp,
        partial_count=partial,
        last_call_at=last_call,
    )

    # Recent calls
    recent_q = await db.execute(
        select(Call).where(Call.manager_id == manager_id).order_by(desc(Call.created_at)).limit(20)
    )
    recent = []
    for c in recent_q.scalars().all():
        recent.append({
            "id": c.id,
            "filename": c.original_filename,
            "status": c.status.value,
            "compliance": c.script_compliance.value if c.script_compliance else None,
            "compliance_score": c.compliance_score,
            "duration": c.duration_seconds,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })

    return ManagerDetail(
        manager={"id": mgr.id, "username": mgr.username, "email": mgr.email, "role": mgr.role.value},
        stats=stats,
        recent_calls=recent,
    )
