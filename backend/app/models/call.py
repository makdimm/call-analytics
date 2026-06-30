from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class CallStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    TRANSCRIBED = "transcribed"
    ANALYZED = "analyzed"
    FAILED = "failed"


class ScriptCompliance(str, enum.Enum):
    COMPLIANT = "compliant"
    PARTIAL = "partial"
    NON_COMPLIANT = "non_compliant"


class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    original_filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=True)
    duration_seconds = Column(Float, nullable=True)
    status = Column(SAEnum(CallStatus), default=CallStatus.UPLOADED, nullable=False)

    # Progress (0-100) for real-time tracking
    progress = Column(Integer, default=0, nullable=False)

    # Transcrição
    transcript = Column(Text, nullable=True)
    transcript_confidence = Column(Float, nullable=True)
    whisper_model = Column(String(50), nullable=True)

    # GPT analysis
    analysis = Column(JSON, nullable=True)
    script_compliance = Column(SAEnum(ScriptCompliance), nullable=True)
    compliance_score = Column(Float, nullable=True)

    # Manager speech metrics
    talk_ratio = Column(Float, nullable=True)  # % времени говорит менеджер
    emotions = Column(JSON, nullable=True)
    keywords_found = Column(JSON, nullable=True)
    objections_handled = Column(JSON, nullable=True)

    # Source
    source = Column(String(50), default="upload")  # upload / google_drive
    source_file_id = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    # Relations
    manager = relationship("User", backref="calls")
