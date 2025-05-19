from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RequirementCreate(BaseModel):
    task_id: int
    name: str
    description: str
    is_completed: bool = False
    completed_at: Optional[datetime] = None

class RequirementUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[datetime] = None

class RequirementRead(BaseModel):
    id: int
    task_id: int
    name: str
    description: str
    is_completed: bool
    completed_at: Optional[datetime]

    class Config:
        orm_mode = True
