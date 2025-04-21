from sqlalchemy import Column, Integer
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base

class UserModel(Base):
    __tablename__ = 'users'

    keycloak_uuid = Column(UUID(as_uuid=True), primary_key=True)