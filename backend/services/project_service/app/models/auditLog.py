import uuid
from sqlalchemy import ForeignKey, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
import datetime

from db.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from localUser import LocalUserModel

class AuditLogModel(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    redactor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("local_user.id"), nullable=False, index=True)
    redactor: Mapped["LocalUserModel"] = relationship("LocalUserModel")

    changed_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    entity_type: Mapped[str]
    entity_id: Mapped[int]
    diff: Mapped[dict] = mapped_column(JSONB)

    redactor: Mapped["LocalUserModel"] = relationship("LocalUserModel", back_populates="audit_logs")

# Delayed imports
from models.localUser import LocalUserModel