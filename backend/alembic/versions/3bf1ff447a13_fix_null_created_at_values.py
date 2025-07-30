"""fix_null_created_at_values

Revision ID: 3bf1ff447a13
Revises: 9c74207b8438
Create Date: 2025-07-30 10:48:57.140283

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3bf1ff447a13'
down_revision: Union[str, Sequence[str], None] = '9c74207b8438'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Update NULL created_at values to current timestamp
    op.execute("""
        UPDATE excel_uploads 
        SET created_at = NOW() 
        WHERE created_at IS NULL
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # This is a data fix, no downgrade needed
    pass
