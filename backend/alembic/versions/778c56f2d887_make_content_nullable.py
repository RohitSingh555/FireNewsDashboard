"""make_content_nullable

Revision ID: 778c56f2d887
Revises: 4916b115eefd
Create Date: 2025-07-30 10:34:52.721436

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '778c56f2d887'
down_revision: Union[str, Sequence[str], None] = '4916b115eefd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Make content column nullable
    op.alter_column('fire_news', 'content',
               existing_type=sa.Text(),
               nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    # Make content column not nullable again
    op.alter_column('fire_news', 'content',
               existing_type=sa.Text(),
               nullable=False)
