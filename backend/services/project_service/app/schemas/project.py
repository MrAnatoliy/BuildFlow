from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

from schemas.stage import StageRead


class ProjectCreate(BaseModel):
    name: str
    description: str


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectRead(BaseModel):
    id: int
    name: str
    description: str
    owner_id: UUID
    created_at: datetime
    stages: List[StageRead] = []  # ← добавляем список этапов

    class Config:
        orm_mode = True  # важно для работы с SQLAlchemy-моделями


class ProjectReadShort(BaseModel):
    id: int
    name: str
    description: str
    owner_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True  # важно для работы с SQLAlchemy-моделями
