from sqlalchemy.orm import Session
from models.task_volume import TaskVolumeModel
from schemas.task_volume import TaskVolumeCreate, TaskVolumeUpdate

def get_all_by_task(db: Session, task_id: int):
    return db.query(TaskVolumeModel).filter(TaskVolumeModel.task_id == task_id).all()

def get(db: Session, volume_id: int):
    return db.query(TaskVolumeModel).filter(TaskVolumeModel.id == volume_id).first()

def create(db: Session, volume: TaskVolumeCreate):
    db_volume = TaskVolumeModel(**volume.dict())
    db.add(db_volume)
    db.commit()
    db.refresh(db_volume)
    return db_volume

def update(db: Session, volume_id: int, volume_update: TaskVolumeUpdate):
    db_volume = get(db, volume_id)
    if not db_volume:
        return None
    for field, value in volume_update.dict(exclude_unset=True).items():
        setattr(db_volume, field, value)
    db.commit()
    db.refresh(db_volume)
    return db_volume

def delete(db: Session, volume_id: int):
    db_volume = get(db, volume_id)
    if not db_volume:
        return None
    db.delete(db_volume)
    db.commit()
    return db_volume
