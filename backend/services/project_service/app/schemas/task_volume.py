from pydantic import BaseModel, Field
from typing import Optional

class TaskVolumeBase(BaseModel):
    name: str
    current_volume: float
    whole_volume: float
    metrics: str

class TaskVolumeCreate(TaskVolumeBase):
    task_id: int

class TaskVolumeUpdate(BaseModel):
    name: Optional[str] = None
    current_volume: Optional[float] = None
    whole_volume: Optional[float] = None
    metrics: Optional[str] = None

class TaskVolumeRead(TaskVolumeBase):
    id: int
    task_id: int

    class Config:
        orm_mode = True
