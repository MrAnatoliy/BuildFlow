from typing import List
from sqlalchemy.orm import Mapped, mapped_column,relationship

from db.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from localUser import LocalUserModel

class RoleModel(Base):
    __tablename__ = "role"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    users: Mapped[List["LocalUserModel"]] = relationship(
        "LocalUserModel",
        back_populates="role",
        cascade="all, delete-orphan"
    )


# Delayed imports
from models.localUser import LocalUserModel