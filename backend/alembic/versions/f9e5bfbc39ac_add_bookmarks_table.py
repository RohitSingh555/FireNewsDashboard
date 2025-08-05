"""add_bookmarks_table

Revision ID: f9e5bfbc39ac
Revises: 048e3c3f71cb
Create Date: 2025-08-05 12:23:58.815298

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f9e5bfbc39ac'
down_revision: Union[str, Sequence[str], None] = '048e3c3f71cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'bookmarks',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('news_id', sa.Integer, sa.ForeignKey('fire_news.id'), nullable=False),
        sa.Column('data_type', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('user_id', 'news_id', 'data_type', name='uq_user_news_type')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('bookmarks')
