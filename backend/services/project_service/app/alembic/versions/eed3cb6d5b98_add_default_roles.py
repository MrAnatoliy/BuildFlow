"""Add default roles

Revision ID: eed3cb6d5b98
Revises: b22fb7272a1c
Create Date: 2025-05-18 14:09:56.438763

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eed3cb6d5b98'
down_revision: Union[str, None] = 'b22fb7272a1c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    role_table = sa.table(
        "role",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("description", sa.String),
    )

    op.bulk_insert(
        role_table,
        [
            {"id": 1, "name": "project_manager", "description": "User responsible for managing projects"},
            {"id": 2, "name": "executor", "description": "User responsible for executing tasks"},
        ]
    )


def downgrade():
    op.execute("DELETE FROM role WHERE name IN ('project_manager', 'executor')")