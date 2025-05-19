from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies.project_db import get_db
import crud.task_crud as task_crud
import crud.executor_crud as executor_crud
import crud.requirement_crud as requirement_crud
import crud.task_volume_crud as task_volume_crud
from schemas.task import TaskCreate, TaskRead, TaskUpdate
from schemas.executor import ExecutorRead
from schemas.requirement import RequirementRead
from schemas.task_volume import TaskVolumeRead

router = APIRouter(prefix="/task", tags=["Tasks"])


@router.post("/", response_model=TaskRead)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    return task_crud.create_task(db, task_in)


@router.get("/{task_id}", response_model=TaskRead)
def read_task(task_id: int, db: Session = Depends(get_db)):
    task = task_crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, updates: TaskUpdate, db: Session = Depends(get_db)):
    task = task_crud.update_task(db, task_id, updates)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/{task_id}/requirements", response_model=list[RequirementRead])
def read_requirements_by_task(task_id: int, db: Session = Depends(get_db)):
    return requirement_crud.get_requirements_by_task(db, task_id)


@router.get("/{task_id}/volumes", response_model=List[TaskVolumeRead])
def read_task_volumes(task_id: int, db: Session = Depends(get_db)):
    return task_volume_crud.get_all_by_task(db, task_id)

@router.get("/{task_id}/executors", response_model=list[ExecutorRead])
def read_executors_by_task(task_id: int, db: Session = Depends(get_db)):
    return executor_crud.get_executors_by_task(db, task_id)


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    success = task_crud.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}
