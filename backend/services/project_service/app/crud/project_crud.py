# crud/project.py
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from models.project import ProjectModel
from models.localUser import LocalUserModel
from models.role import RoleModel
from schemas.project import ProjectCreate

import uuid
import datetime


# create -------------------------------------------------------------------------
def create_project(db: Session, project_data: ProjectCreate, owner_id: uuid.UUID) -> ProjectModel:
    user = db.query(LocalUserModel).filter(LocalUserModel.id == owner_id).first()

    if user is None:
        # Поиск роли project_manager
        role = db.query(RoleModel).filter(RoleModel.name.ilike("project_manager")).first()
        if role is None:
            raise HTTPException(status_code=500, detail="Role 'project_manager' not found")

        user = LocalUserModel(
            id=owner_id,
            role_id=role.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    elif user.role.name.lower() != "project_manager":
        raise HTTPException(status_code=403, detail="User must have role 'project_manager'")

    new_project = ProjectModel(
        name=project_data.name,
        description=project_data.description,
        owner_id=owner_id,
        created_at=datetime.datetime.now(datetime.timezone.utc),
        stages=[]
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

# full read
def get_project_by_id(db: Session, project_id: int) -> ProjectModel | None:
    return db.query(ProjectModel)\
        .options(joinedload(ProjectModel.stages))\
        .filter(ProjectModel.id == project_id)\
        .first()


def get_projects_by_owner(db: Session, owner_id: uuid.UUID) -> list[ProjectModel]:
    return db.query(ProjectModel)\
        .options(joinedload(ProjectModel.stages))\
        .filter(ProjectModel.owner_id == owner_id)\
        .all()

# short read
def get_project_by_id_short(db: Session, project_id: int) -> ProjectModel | None:
    return db.query(ProjectModel)\
        .filter(ProjectModel.id == project_id)\
        .first()


def get_projects_by_owner_short(db: Session, owner_id: uuid.UUID) -> list[ProjectModel]:
    return db.query(ProjectModel)\
        .filter(ProjectModel.owner_id == owner_id)\
        .all()

# delete -------------------------------------------------------------------------
def delete_project(db: Session, project_id: int) -> bool:
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        return False

    db.delete(project)
    db.commit()
    return True

# update -------------------------------------------------------------------------
def update_project(db: Session, project_id: int, data: dict) -> ProjectModel | None:
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        return None

    for key, value in data.items():
        if hasattr(project, key):
            setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return project

