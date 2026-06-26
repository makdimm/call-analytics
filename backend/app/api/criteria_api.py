from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.api.deps import get_current_user, require_admin
from app.models.user import User
from app.models.criteria import Criteria, CallTypeCriteria
from pydantic import BaseModel
from typing import Any

router = APIRouter(prefix="/api/criteria", tags=["criteria"])

# ---------- Schemas ----------

class CriteriaCreate(BaseModel):
    key: str
    label: str
    description: str | None = None
    what_to_check: str | None = None
    bad_example: str | None = None
    partial_example: str | None = None
    good_example: str | None = None
    max_score: float = 1.0
    sort_order: int = 0
    is_active: bool = True


class CriteriaUpdate(BaseModel):
    key: str | None = None
    label: str | None = None
    description: str | None = None
    what_to_check: str | None = None
    bad_example: str | None = None
    partial_example: str | None = None
    good_example: str | None = None
    max_score: float | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CallTypeCriteriaSchema(BaseModel):
    criteria_id: int
    max_score: float = 1.0
    sort_order: int = 0


class CallTypeCriteriaUpdate(BaseModel):
    call_type: str
    criteria: list[CallTypeCriteriaSchema]


# ---------- Endpoints ----------

@router.get("/")
async def list_criteria(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Criteria).order_by(Criteria.sort_order, Criteria.label))
    items = []
    for c in result.scalars().all():
        items.append({
            "id": c.id,
            "key": c.key,
            "label": c.label,
            "description": c.description,
            "what_to_check": c.what_to_check,
            "bad_example": c.bad_example,
            "partial_example": c.partial_example,
            "good_example": c.good_example,
            "max_score": c.max_score,
            "sort_order": c.sort_order,
            "is_active": c.is_active,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return {"items": items, "total": len(items)}


@router.post("/", status_code=201)
async def create_criteria(
    data: CriteriaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    existing = await db.execute(select(Criteria).where(Criteria.key == data.key))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Критерий с key '{data.key}' уже существует")

    c = Criteria(**data.model_dump())
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return {"id": c.id, "key": c.key, "label": c.label}


@router.get("/{criteria_id}")
async def get_criteria(
    criteria_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    c = await db.get(Criteria, criteria_id)
    if not c:
        raise HTTPException(status_code=404, detail="Критерий не найден")
    return {
        "id": c.id,
        "key": c.key,
        "label": c.label,
        "description": c.description,
        "what_to_check": c.what_to_check,
        "bad_example": c.bad_example,
        "partial_example": c.partial_example,
        "good_example": c.good_example,
        "max_score": c.max_score,
        "sort_order": c.sort_order,
        "is_active": c.is_active,
    }


@router.put("/{criteria_id}")
async def update_criteria(
    criteria_id: int,
    data: CriteriaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    c = await db.get(Criteria, criteria_id)
    if not c:
        raise HTTPException(status_code=404, detail="Критерий не найден")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(c, field, value)
    await db.commit()
    await db.refresh(c)
    return {"id": c.id, "key": c.key, "label": c.label, "updated": True}


@router.delete("/{criteria_id}")
async def delete_criteria(
    criteria_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    c = await db.get(Criteria, criteria_id)
    if not c:
        raise HTTPException(status_code=404, detail="Критерий не найден")
    await db.delete(c)
    await db.commit()
    return {"deleted": True}


# ---------- Call Type Criteria mapping ----------

@router.get("/mapping/{call_type}")
async def get_call_type_mapping(
    call_type: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(CallTypeCriteria).options(selectinload(CallTypeCriteria.criteria))
        .where(CallTypeCriteria.call_type == call_type)
        .order_by(CallTypeCriteria.sort_order)
    )
    items = []
    for ct in result.scalars().all():
        items.append({
            "id": ct.id,
            "criteria_id": ct.criteria_id,
            "criteria_key": ct.criteria.key if ct.criteria else None,
            "criteria_label": ct.criteria.label if ct.criteria else None,
            "max_score": ct.max_score,
            "sort_order": ct.sort_order,
        })
    return {"items": items, "total": len(items)}


@router.put("/mapping/{call_type}")
async def update_call_type_mapping(
    call_type: str,
    data: CallTypeCriteriaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # Remove existing mappings for this call_type
    await db.execute(delete(CallTypeCriteria).where(CallTypeCriteria.call_type == call_type))
    # Add new mappings
    for item in data.criteria:
        ct = CallTypeCriteria(
            call_type=call_type,
            criteria_id=item.criteria_id,
            max_score=item.max_score,
            sort_order=item.sort_order,
        )
        db.add(ct)
    await db.commit()
    return {"updated": True, "call_type": call_type, "count": len(data.criteria)}
