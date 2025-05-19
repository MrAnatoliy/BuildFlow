from typing import List
import uuid
import datetime

from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column,relationship

from db.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models.localUser import LocalUserModel
    from ..models.stage import StageModel

class ProjectModel(Base):
    __tablename__ = "project"

    id: Mapped[int] = mapped_column(primary_key=True)

    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("local_user.id"), nullable=False,index=True)
    owner: Mapped["LocalUserModel"] = relationship("LocalUserModel", back_populates="projects")

    name: Mapped[str]
    description: Mapped[str]
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        default= lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False
    )

    stages: Mapped[List["StageModel"]] = relationship("StageModel", back_populates="project", cascade="all, delete-orphan")


# Delayed imports
from models.stage import StageModel
from models.localUser import LocalUserModel