from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..dependencies.project_db import get_db
import crud.task_volume_crud as task_volume_crud
from schemas.task_volume import TaskVolumeCreate, TaskVolumeRead, TaskVolumeUpdate

router = APIRouter(prefix="/volume", tags=["Task Volumes"])


@router.post("/", response_model=TaskVolumeRead)
def create_task_volume(task_id: int, volume: TaskVolumeCreate, db: Session = Depends(get_db)):
    if task_id != volume.task_id:
        raise HTTPException(status_code=400, detail="task_id mismatch")
    return task_volume_crud.create(db, volume)

@router.get("/{volume_id}", response_model=TaskVolumeRead)
def read_task_volume(task_id: int, volume_id: int, db: Session = Depends(get_db)):
    db_volume = task_volume_crud.get(db, volume_id)
    if not db_volume or db_volume.task_id != task_id:
        raise HTTPException(status_code=404, detail="Volume not found")
    return db_volume

@router.put("/{volume_id}", response_model=TaskVolumeRead)
def update_task_volume(task_id: int, volume_id: int, volume_update: TaskVolumeUpdate, db: Session = Depends(get_db)):
    db_volume = task_volume_crud.get(db, volume_id)
    if not db_volume or db_volume.task_id != task_id:
        raise HTTPException(status_code=404, detail="Volume not found")
    return task_volume_crud.update(db, volume_id, volume_update)

@router.delete("/{volume_id}", response_model=TaskVolumeRead)
def delete_task_volume(task_id: int, volume_id: int, db: Session = Depends(get_db)):
    db_volume = task_volume_crud.get(db, volume_id)
    if not db_volume or db_volume.task_id != task_id:
        raise HTTPException(status_code=404, detail="Volume not found")
    return task_volume_crud.delete(db, volume_id)
