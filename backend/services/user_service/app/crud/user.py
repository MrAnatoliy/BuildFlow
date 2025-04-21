from sqlalchemy.orm import Session

from schemas.user import UserCreateSchema, UserCreatedEventSchema
from models.user import UserModel


# ------------------- CREATE -------------------

def create_user(db: Session, user_data: UserCreateSchema):
    user = UserModel(**user_data.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def create_user_from_event(db: Session, user_data: UserCreatedEventSchema):
    user = UserModel(**user_data.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)

    return user

# ----------------------------------------------