"""V4 add county to fire_news

Revision ID: 4e39582f61fa
Revises: 674d25fa57ba
Create Date: 2025-07-22 12:43:37.154959

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e39582f61fa'
down_revision: Union[str, Sequence[str], None] = '674d25fa57ba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('fire_news', sa.Column('county', sa.String(length=100), nullable=True))

def downgrade():
    op.drop_column('fire_news', 'county')
