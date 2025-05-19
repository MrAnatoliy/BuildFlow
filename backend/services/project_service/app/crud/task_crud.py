from sqlalchemy.orm import Session, joinedload
from models.task import TaskModel
from schemas.task import TaskCreate, TaskUpdate


def create_task(db: Session, task_data: TaskCreate) -> TaskModel:
    task = TaskModel(**task_data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, task_id: int) -> TaskModel | None:
    return db.query(TaskModel)\
        .options(joinedload(TaskModel.executors))\
        .options(joinedload(TaskModel.requirements))\
        .options(joinedload(TaskModel.volumes))\
        .filter(TaskModel.id == task_id)\
        .first()


def get_tasks_by_stage(db: Session, stage_id: int) -> list[TaskModel]:
    return db.query(TaskModel)\
        .options(joinedload(TaskModel.executors))\
        .options(joinedload(TaskModel.requirements))\
        .options(joinedload(TaskModel.volumes))\
        .filter(TaskModel.stage_id == stage_id)\
        .all()


def update_task(db: Session, task_id: int, updates: TaskUpdate) -> TaskModel | None:
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        return None
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int) -> bool:
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
