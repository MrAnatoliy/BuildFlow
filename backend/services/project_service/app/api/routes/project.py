# routers/project_router.py
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from schemas.stage import StageRead
import crud.project_crud as project_crud
import crud.stage_crud as stage_crud
from schemas.project import ProjectCreate, ProjectUpdate, ProjectRead, ProjectReadShort
from ..dependencies.project_db import get_db
from ..dependencies.auth import get_current_user_id

router = APIRouter(prefix="/project", tags=["Projects"])

# Create endpooints ---------------------------------------------------------------
@router.post("/", response_model=ProjectRead)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    project = project_crud.create_project(db, project_data, owner_id=user_id)
    return project


# Read endpooints -----------------------------------------------------------------

# full read
@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    project = project_crud.get_project_by_id(db, project_id)
    if not project or project.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# short read
@router.get("/short/{project_id}", response_model=ProjectReadShort)
def get_project_short(
    project_id: int,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    project = project_crud.get_project_by_id_short(db, project_id)
    if not project or project.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# full read
@router.get("/", response_model=list[ProjectRead])
def get_user_projects(
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return project_crud.get_projects_by_owner(db, user_id)


# short read
@router.get("/short/", response_model=list[ProjectReadShort])
def get_user_projects(
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return project_crud.get_projects_by_owner_short(db, user_id)


@router.get("/{project_id}/stages", response_model=list[StageRead])
def get_stages(project_id: int, db: Session = Depends(get_db)):
    return stage_crud.get_stages_by_project(db, project_id)


# Update endpooints ---------------------------------------------------------------
@router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int,
    update_data: ProjectUpdate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    project = project_crud.get_project_by_id(db, project_id)
    if not project or project.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Project not found")

    updated_project = project_crud.update_project(db, project_id, update_data.dict(exclude_unset=True))
    return updated_project


# Update endpooints ---------------------------------------------------------------
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    project = project_crud.get_project_by_id(db, project_id)
    if not project or project.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Project not found")

    project_crud.delete_project(db, project_id)
    return None  # 204 No Content doesn't require a body