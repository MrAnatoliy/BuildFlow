from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from schemas.stage import StageCreate, StageUpdate, StageRead
from schemas.task import TaskRead
import crud.task_crud as task_crud
import crud.stage_crud as stage_crud
from ..dependencies.project_db import get_db
from ..dependencies.auth import get_current_user_id

router = APIRouter(prefix="/stage", tags=["Stages"])



@router.get("/{stage_id}", response_model=StageRead)
def get_stage(stage_id: int, db: Session = Depends(get_db)):
    db_stage = stage_crud.get_stage(db, stage_id)
    if not db_stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return db_stage


@router.get("/{stage_id}/tasks/", response_model=list[TaskRead])
def list_tasks(stage_id: int, db: Session = Depends(get_db)):
    return task_crud.get_tasks_by_stage(db, stage_id)


@router.post("/", response_model=StageRead, status_code=201)
def create_stage(stage: StageCreate, db: Session = Depends(get_db)):
    return stage_crud.create_stage(db, stage)


@router.put("/{stage_id}", response_model=StageRead)
def update_stage(stage_id: int, stage: StageUpdate, db: Session = Depends(get_db)):
    db_stage = stage_crud.update_stage(db, stage_id, stage)
    if not db_stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return db_stage


@router.delete("/{stage_id}", status_code=204)
def delete_stage(stage_id: int, db: Session = Depends(get_db)):
    success = stage_crud.delete_stage(db, stage_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stage not found")
