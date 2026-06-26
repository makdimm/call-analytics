from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.api.deps import get_current_user, require_admin
from app.models.user import User
from app.models.knowledge_base import KnowledgeBase
from pydantic import BaseModel

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


# ---------- Schemas ----------

class KBCreate(BaseModel):
    title: str
    content: str
    category: str = "general"
    sort_order: int = 0
    is_active: bool = True


class KBUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


# ---------- Endpoints ----------

@router.get("/")
async def list_knowledge(
    category: str | None = None,
    search: str | None = Query(None, min_length=2),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(KnowledgeBase).order_by(KnowledgeBase.sort_order, KnowledgeBase.title)

    if category:
        query = query.where(KnowledgeBase.category == category)
    if search:
        query = query.where(
            or_(
                KnowledgeBase.title.ilike(f"%{search}%"),
                KnowledgeBase.content.ilike(f"%{search}%"),
            )
        )

    result = await db.execute(query)
    items = []
    for kb in result.scalars().all():
        items.append({
            "id": kb.id,
            "title": kb.title,
            "content": kb.content,
            "category": kb.category,
            "sort_order": kb.sort_order,
            "is_active": kb.is_active,
            "created_at": kb.created_at.isoformat() if kb.created_at else None,
            "updated_at": kb.updated_at.isoformat() if kb.updated_at else None,
        })
    return {"items": items, "total": len(items)}


@router.post("/", status_code=201)
async def create_knowledge(
    data: KBCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    kb = KnowledgeBase(**data.model_dump())
    db.add(kb)
    await db.commit()
    await db.refresh(kb)
    return {"id": kb.id, "title": kb.title, "category": kb.category}


@router.get("/{kb_id}")
async def get_knowledge(
    kb_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    kb = await db.get(KnowledgeBase, kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    return {
        "id": kb.id,
        "title": kb.title,
        "content": kb.content,
        "category": kb.category,
        "sort_order": kb.sort_order,
        "is_active": kb.is_active,
    }


@router.put("/{kb_id}")
async def update_knowledge(
    kb_id: int,
    data: KBUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    kb = await db.get(KnowledgeBase, kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Запись не найдена")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(kb, field, value)
    await db.commit()
    await db.refresh(kb)
    return {"id": kb.id, "title": kb.title, "updated": True}


@router.delete("/{kb_id}")
async def delete_knowledge(
    kb_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    kb = await db.get(KnowledgeBase, kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    await db.delete(kb)
    await db.commit()
    return {"deleted": True}


@router.get("/categories/list")
async def list_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(KnowledgeBase.category).distinct().order_by(KnowledgeBase.category))
    categories = [row[0] for row in result.all()]
    return {"categories": categories}
