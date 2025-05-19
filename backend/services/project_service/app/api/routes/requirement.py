from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies.project_db import get_db
import crud.requirement_crud as requirement_crud
import schemas.requirement as schema

router = APIRouter(prefix="/requirement", tags=["Requirements"])


@router.post("/", response_model=schema.RequirementRead)
def create_requirement(requirement: schema.RequirementCreate, db: Session = Depends(get_db)):
    return requirement_crud.create_requirement(db, requirement)


@router.get("/{requirement_id}", response_model=schema.RequirementRead)
def read_requirement(requirement_id: int, db: Session = Depends(get_db)):
    db_req = requirement_crud.get_requirement(db, requirement_id)
    if not db_req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return db_req


@router.put("/{requirement_id}", response_model=schema.RequirementRead)
def update_requirement(requirement_id: int, req_data: schema.RequirementUpdate, db: Session = Depends(get_db)):
    updated = requirement_crud.update_requirement(db, requirement_id, req_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return updated

@router.delete("/{requirement_id}", status_code=204)
def delete_requirement(requirement_id: int, db: Session = Depends(get_db)):
    if not requirement_crud.delete_requirement(db, requirement_id):
        raise HTTPException(status_code=404, detail="Requirement not found")