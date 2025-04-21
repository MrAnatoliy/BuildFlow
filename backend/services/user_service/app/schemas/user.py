from pydantic import BaseModel
from uuid import UUID

class UserBaseSchema(BaseModel):
    keycloak_uuid: UUID

class UserCreateSchema(UserBaseSchema):
    pass

class UserCreatedEventSchema(UserBaseSchema):
    pass