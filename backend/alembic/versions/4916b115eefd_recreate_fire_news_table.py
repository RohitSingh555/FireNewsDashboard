"""recreate_fire_news_table

Revision ID: 4916b115eefd
Revises: 2dbe3b241500
Create Date: 2025-07-30 09:45:16.144735

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4916b115eefd'
down_revision: Union[str, Sequence[str], None] = '2dbe3b241500'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'fire_news',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('published_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('url', sa.String(500), nullable=True),
        sa.Column('source', sa.String(255), nullable=True),
        sa.Column('fire_related_score', sa.Float, nullable=True),
        sa.Column('verification_result', sa.String(100), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('county', sa.String(100), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('province', sa.String(100), nullable=True),
        sa.Column('country', sa.String(100), nullable=True),
        sa.Column('latitude', sa.Float, nullable=True),
        sa.Column('longitude', sa.Float, nullable=True),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('tags', sa.String(255), nullable=True),
        sa.Column('reporter_name', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('fire_news')
