"""rename_created_to_created_at

Revision ID: 9c74207b8438
Revises: 778c56f2d887
Create Date: 2025-07-30 10:46:16.421713

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c74207b8438'
down_revision: Union[str, Sequence[str], None] = '778c56f2d887'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename 'created' column to 'created_at' in excel_uploads table
    op.alter_column('excel_uploads', 'created',
               new_column_name='created_at',
               existing_type=sa.DateTime())


def downgrade() -> None:
    """Downgrade schema."""
    # Rename 'created_at' column back to 'created' in excel_uploads table
    op.alter_column('excel_uploads', 'created_at',
               new_column_name='created',
               existing_type=sa.DateTime())
