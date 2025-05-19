from typing import List
from sqlalchemy import ForeignKey, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime

from db.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from stage import StageModel
    from requirement import RequirementModel
    from app.models.task_volume import TaskVolumeModel
    from executor import ExecutorModel

class TaskModel(Base):
    __tablename__ = "task"

    id: Mapped[int] = mapped_column(primary_key=True)
    stage_id: Mapped[int] = mapped_column(ForeignKey("stage.id"), nullable=False, index=True)
    stage: Mapped["StageModel"] = relationship("StageModel", back_populates="tasks")

    name: Mapped[str]
    description: Mapped[str]
    start_date: Mapped[datetime.date]
    end_date: Mapped[datetime.date]
    priority: Mapped[int]

    requirements: Mapped[List["RequirementModel"]] = relationship("RequirementModel", back_populates="task", cascade="all, delete-orphan")
    volumes: Mapped[List["TaskVolumeModel"]] = relationship("TaskVolumeModel", back_populates="task", cascade="all, delete-orphan")
    executors: Mapped[List["ExecutorModel"]] = relationship("ExecutorModel", back_populates="task", cascade="all, delete-orphan")


# Delayed imports
from models.stage import StageModel
from models.requirement import RequirementModel
from models.task_volume import TaskVolumeModel
from models.executor import ExecutorModel