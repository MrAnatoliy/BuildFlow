import uuid
from pydantic import BaseModel, Field


class ExecutorBase(BaseModel):
    task_id: int
    user_id: uuid.UUID
    role: str


class ExecutorCreate(ExecutorBase):
    pass


class ExecutorUpdate(BaseModel):
    role: str


class ExecutorRead(ExecutorBase):
    id: int

    class Config:
        orm_mode = True
