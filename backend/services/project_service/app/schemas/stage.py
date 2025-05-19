from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

from schemas.task import TaskRead


class StageBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    budget: float


class StageCreate(StageBase):
    project_id: int


class StageUpdate(StageBase):
    pass


class StageRead(StageBase):
    id: int
    project_id: int
    created_at: datetime
    tasks: List[TaskRead] = []  # ← добавляем список этапов

    class Config:
        orm_mode = True
