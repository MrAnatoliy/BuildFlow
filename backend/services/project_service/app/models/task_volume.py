from sqlalchemy import ForeignKey, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from task import TaskModel

class TaskVolumeModel(Base):
    __tablename__ = "task_volume"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("task.id"), nullable=False, index=True)
    task: Mapped["TaskModel"] = relationship("TaskModel", back_populates="volumes")

    name: Mapped[str]
    current_volume: Mapped[float]
    whole_volume: Mapped[float]
    metrics: Mapped[str]

    task: Mapped["TaskModel"] = relationship("TaskModel", back_populates="volumes")


# Delayed imports
from models.task import TaskModel