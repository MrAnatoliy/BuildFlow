from sqlalchemy.orm import Session, joinedload
from models.stage import StageModel
from schemas.stage import StageCreate, StageUpdate


def get_stage(db: Session, stage_id: int) -> StageModel | None:
    return db.query(StageModel)\
        .options(joinedload(StageModel.tasks))\
        .filter(StageModel.id == stage_id)\
        .first()


def get_stages_by_project(db: Session, project_id: int) -> list[StageModel]:
    return db.query(StageModel)\
        .options(joinedload(StageModel.tasks))\
        .filter(StageModel.project_id == project_id)\
        .all()


def create_stage(db: Session, stage: StageCreate) -> StageModel:
    db_stage = StageModel(**stage.model_dump())
    db.add(db_stage)
    db.commit()
    db.refresh(db_stage)
    return db_stage


def update_stage(db: Session, stage_id: int, stage_update: StageUpdate) -> StageModel | None:
    db_stage = db.query(StageModel).filter(StageModel.id == stage_id).first()
    if not db_stage:
        return None
    for key, value in stage_update.model_dump().items():
        setattr(db_stage, key, value)
    db.commit()
    db.refresh(db_stage)
    return db_stage


def delete_stage(db: Session, stage_id: int) -> bool:
    db_stage = db.query(StageModel).filter(StageModel.id == stage_id).first()
    if not db_stage:
        return False
    db.delete(db_stage)
    db.commit()
    return True
