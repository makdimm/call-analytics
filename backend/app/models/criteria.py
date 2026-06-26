from sqlalchemy import Column, Integer, String, Float, Text, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Criteria(Base):
    """Критерий оценки звонка (управляется РОПом)."""
    __tablename__ = "criteria"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    key = Column(String(50), unique=True, nullable=False, index=True)  # machine key: greeting, speech...
    label = Column(String(200), nullable=False)  # human label: Приветствие
    description = Column(Text, nullable=True)  # описание для оценки
    what_to_check = Column(Text, nullable=True)  # на что смотреть
    bad_example = Column(Text, nullable=True)  # когда НЕТ
    partial_example = Column(Text, nullable=True)  # когда ПОЛУДА
    good_example = Column(Text, nullable=True)  # когда ДА
    max_score = Column(Float, default=1.0, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class CallTypeCriteria(Base):
    """Связь типов звонков с критериями (макс баллы)."""
    __tablename__ = "call_type_criteria"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    call_type = Column(String(50), nullable=False, index=True)  # new_lead, acceleration, etc.
    criteria_id = Column(Integer, ForeignKey("criteria.id", ondelete="CASCADE"), nullable=False)
    max_score = Column(Float, default=1.0, nullable=False)  # вес критерия для этого типа
    sort_order = Column(Integer, default=0, nullable=False)

    criteria = relationship("Criteria")


class CallCriteriaScore(Base):
    """Оценка звонка по каждому критерию."""
    __tablename__ = "call_criteria_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    call_id = Column(Integer, ForeignKey("calls.id", ondelete="CASCADE"), nullable=False, index=True)
    criteria_id = Column(Integer, ForeignKey("criteria.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, default=0, nullable=False)  # 0 / 0.5 / 1
    max_score = Column(Float, default=1.0, nullable=False)
    comment = Column(Text, nullable=True)

    call = relationship("Call", backref="criteria_scores_rel")
    criteria = relationship("Criteria")
