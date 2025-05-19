from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID


class UserBaseSchema(BaseModel):
    keycloak_uuid: UUID


class UserCreateSchema(UserBaseSchema):
    pass


class UserReadSchema(UserBaseSchema):
    pass


class UserCreatedEventSchema(UserBaseSchema):
    pass


class UserDetailsReadSchema(BaseModel):
    id: str
    username: str
    email: str
    firstName: Optional[str]
    lastName: Optional[str]


class UsersDetailsReadSchema(BaseModel):
    users: List[UserDetailsReadSchema] = []