from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies.project_db import get_db
from schemas.executor import ExecutorCreate, ExecutorUpdate, ExecutorRead
import crud.executor_crud as executor_crud

router = APIRouter(prefix="/executor", tags=["Executors"])


@router.get("/{executor_id}", response_model=ExecutorRead)
def read_executor(executor_id: int, db: Session = Depends(get_db)):
    executor = executor_crud.get_executor(db, executor_id)
    if not executor:
        raise HTTPException(status_code=404, detail="Executor not found")
    return executor


@router.post("/", response_model=ExecutorRead)
def create_executor(executor_data: ExecutorCreate, db: Session = Depends(get_db)):
    return executor_crud.create_executor(db, executor_data)


@router.put("/{executor_id}", response_model=ExecutorRead)
def update_executor(executor_id: int, executor_data: ExecutorUpdate, db: Session = Depends(get_db)):
    executor = executor_crud.update_executor(db, executor_id, executor_data)
    if not executor:
        raise HTTPException(status_code=404, detail="Executor not found")
    return executor


@router.delete("/{executor_id}", response_model=ExecutorRead)
def delete_executor(executor_id: int, db: Session = Depends(get_db)):
    executor = executor_crud.delete_executor(db, executor_id)
    if not executor:
        raise HTTPException(status_code=404, detail="Executor not found")
    return executor
