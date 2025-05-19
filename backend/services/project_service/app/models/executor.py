import uuid
from sqlalchemy import ForeignKey, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
import datetime

from db.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from task import TaskModel
    from localUser import LocalUserModel

class ExecutorModel(Base):
    __tablename__ = "executor"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("task.id"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("local_user.id"), nullable=False, index=True)
    
    task: Mapped["TaskModel"] = relationship("TaskModel", back_populates="executors")
    user: Mapped["LocalUserModel"] = relationship("LocalUserModel")

    role: Mapped[str]

    task: Mapped["TaskModel"] = relationship("TaskModel", back_populates="executors")
    executor: Mapped["LocalUserModel"] = relationship("LocalUserModel", back_populates="executions")

# Delayed imports
from models.task import TaskModel
from models.localUser import LocalUserModel