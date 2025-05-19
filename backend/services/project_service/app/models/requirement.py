from sqlalchemy import ForeignKey, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime

from db.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from task import TaskModel

class RequirementModel(Base):
    __tablename__ = "requirement"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("task.id"), nullable=False, index=True)
    task: Mapped["TaskModel"] = relationship("TaskModel", back_populates="requirements")

    name: Mapped[str]
    description: Mapped[str]
    is_completed: Mapped[bool]
    completed_at: Mapped[datetime.datetime | None]

    task: Mapped["TaskModel"] = relationship("TaskModel", back_populates="requirements")


# Delayed imports
from models.task import TaskModel