from typing import List
import uuid
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from role import RoleModel
    from project import ProjectModel
    from auditLog import AuditLogModel
    from executor import ExecutorModel

class LocalUserModel(Base):
    __tablename__ = "local_user"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),primary_key=True, nullable=False
    )

    role_id: Mapped[int] = mapped_column(ForeignKey("role.id"), nullable=False,index=True)
    role: Mapped["RoleModel"] = relationship("RoleModel", back_populates="users")

    projects: Mapped[List["ProjectModel"]] = relationship("ProjectModel", back_populates="owner", cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLogModel"]] = relationship("AuditLogModel", back_populates="redactor", cascade="all, delete-orphan")
    executions: Mapped[List["ExecutorModel"]] = relationship("ExecutorModel", back_populates="executor", cascade="all, delete-orphan")


# Delayed imports
from models.role import RoleModel
from models.project import ProjectModel
from models.auditLog import AuditLogModel
from models.executor import ExecutorModel