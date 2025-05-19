from typing import List
from sqlalchemy import ForeignKey, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime

from db.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models.project import ProjectModel
    from ..models.task import TaskModel

class StageModel(Base):
    __tablename__ = "stage"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"), nullable=False, index=True)
    project: Mapped["ProjectModel"] = relationship("ProjectModel", back_populates="stages")

    name: Mapped[str]
    description: Mapped[str]
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    start_date: Mapped[datetime.date]
    end_date: Mapped[datetime.date]
    budget: Mapped[float] = mapped_column(Numeric)

    tasks: Mapped[List["TaskModel"]] = relationship("TaskModel", back_populates="stage", cascade="all, delete-orphan")


# Delayed imports
from models.project import ProjectModel
from models.task import TaskModel