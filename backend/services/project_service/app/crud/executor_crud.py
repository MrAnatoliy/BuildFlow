from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.executor import ExecutorModel
from models.localUser import LocalUserModel
from models.role import RoleModel
from schemas.executor import ExecutorCreate, ExecutorUpdate
from uuid import UUID


def get_executor(db: Session, executor_id: int):
    return db.query(ExecutorModel).filter(ExecutorModel.id == executor_id).first()


def get_executors_by_task(db: Session, task_id: int):
    return db.query(ExecutorModel).filter(ExecutorModel.task_id == task_id).all()


def create_executor(db: Session, executor_data: ExecutorCreate):
    # Проверка на существование пользователя
    user = db.query(LocalUserModel).filter(LocalUserModel.id == executor_data.user_id).first()

    if user is None:
        # Поиск роли executor
        role = db.query(RoleModel).filter(RoleModel.name.ilike("executor")).first()
        if role is None:
            raise HTTPException(status_code=500, detail="Role 'executor' not found")

        user = LocalUserModel(
            id=executor_data.user_id,
            role_id=role.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    elif user.role.name.lower() != "executor":
        raise HTTPException(status_code=403, detail="User must have role 'executor'")

    executor = ExecutorModel(**executor_data.model_dump())
    db.add(executor)
    db.commit()
    db.refresh(executor)
    return executor


def update_executor(db: Session, executor_id: int, executor_data: ExecutorUpdate):
    executor = db.query(ExecutorModel).filter(ExecutorModel.id == executor_id).first()
    if executor:
        executor.role = executor_data.role
        db.commit()
        db.refresh(executor)
    return executor


def delete_executor(db: Session, executor_id: int):
    executor = db.query(ExecutorModel).filter(ExecutorModel.id == executor_id).first()
    if executor:
        db.delete(executor)
        db.commit()
    return executor
