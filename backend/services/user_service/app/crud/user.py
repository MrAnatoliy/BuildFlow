import logging
from sqlalchemy.orm import Session

from schemas.user import UserCreateSchema, UserCreatedEventSchema
from models.user import UserModel
from core.config import settings

logger = logging.getLogger(settings.service_name)

# ------------------- CREATE -------------------


def create_user(db: Session, user_data: UserCreateSchema):
    logger.info(f"Creating user in DB : {user_data}")
    user = UserModel(**user_data.model_dump())
    db.add(user)
    db.commit()
    logger.info(f"Successfully created new user representation")
    db.refresh(user)

    return user


def create_user_from_event(db: Session, user_data: UserCreatedEventSchema):
    logger.info(f"Creating user in DB : {user_data}")
    user = UserModel(**user_data.model_dump())
    db.add(user)
    db.commit()
    logger.info(f"Successfully created new user representation")
    db.refresh(user)

    return user


# ----------------------------------------------
