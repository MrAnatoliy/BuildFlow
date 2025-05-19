import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.user import UserModel

from schemas.user import UsersDetailsReadSchema, UserDetailsReadSchema
from ..dependencies.user_db import get_db
from messages.rpc import rpc_get_users_info
from core.config import settings

router = APIRouter(prefix="/user", tags=["Users"])

logger = logging.getLogger(settings.service_name)

@router.get("/all", response_model=UsersDetailsReadSchema)
async def get_all_users_details(db: Session = Depends(get_db)):
    users = db.query(UserModel).all()
    user_ids = [user.keycloak_uuid for user in users]

    user_details = await rpc_get_users_info(user_ids)

    logger.info(user_details)

    valid_users = []
    for user in user_details:
        if "error" not in user:
            try:
                valid_users.append(UserDetailsReadSchema(**user))
            except Exception as e:
                logger.warning(f"Failed to parse user: {user}, error: {e}")

    return UsersDetailsReadSchema(users=valid_users)