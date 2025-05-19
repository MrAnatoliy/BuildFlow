from sqlalchemy.orm import Session
from models.requirement import RequirementModel
from schemas.requirement import RequirementCreate, RequirementUpdate

def create_requirement(db: Session, data: RequirementCreate) -> RequirementModel:
    requirement = RequirementModel(**data.model_dump())
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement

def get_requirements_by_task(db: Session, task_id: int):
    return db.query(RequirementModel).filter(RequirementModel.task_id == task_id).all()

def get_requirement(db: Session, requirement_id: int) -> RequirementModel | None:
    return db.query(RequirementModel).filter(RequirementModel.id == requirement_id).first()

def update_requirement(db: Session, requirement_id: int, data: RequirementUpdate) -> RequirementModel | None:
    requirement = db.query(RequirementModel).filter(RequirementModel.id == requirement_id).first()
    if requirement:
        for field, value in data.dict(exclude_unset=True).items():
            setattr(requirement, field, value)
        db.commit()
        db.refresh(requirement)
    return requirement

def delete_requirement(db: Session, requirement_id: int) -> bool:
    requirement = db.query(RequirementModel).filter(RequirementModel.id == requirement_id).first()
    if requirement:
        db.delete(requirement)
        db.commit()
        return True
    return False
