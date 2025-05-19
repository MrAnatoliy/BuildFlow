from pydantic import BaseModel
from typing import List, Optional
from datetime import date

from schemas.requirement import RequirementRead
from schemas.task_volume import TaskVolumeRead
from schemas.executor import ExecutorRead


class TaskBase(BaseModel):
    name: str
    description: str
    start_date: date
    end_date: date
    priority: int


class TaskCreate(TaskBase):
    stage_id: int


class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    priority: Optional[int] = None


class TaskRead(TaskBase):
    id: int
    stage_id: int
    requirements: List[RequirementRead] = []
    volumes: List[TaskVolumeRead] = []
    executors: List[ExecutorRead] = []

    class Config:
        orm_mode = True
