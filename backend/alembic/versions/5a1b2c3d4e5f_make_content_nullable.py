"""make content nullable

Revision ID: 5a1b2c3d4e5f
Revises: 4e39582f61fa
Create Date: 2025-07-29 12:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5a1b2c3d4e5f'
down_revision: Union[str, Sequence[str], None] = '4e39582f61fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Make content column nullable
    op.alter_column('fire_news', 'content',
                    existing_type=sa.Text(),
                    nullable=True)


def downgrade():
    # Make content column non-nullable again
    op.alter_column('fire_news', 'content',
                    existing_type=sa.Text(),
                    nullable=False) 