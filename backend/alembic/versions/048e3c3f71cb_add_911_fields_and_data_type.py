"""add_911_fields_and_data_type

Revision ID: 048e3c3f71cb
Revises: add_tags_system_migration
Create Date: 2025-08-05 08:34:20.660997

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '048e3c3f71cb'
down_revision: Union[str, Sequence[str], None] = 'add_tags_system_migration'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add data_type field to distinguish between fire news and 911 emergency data
    op.add_column('fire_news', sa.Column('data_type', sa.String(50), nullable=False, server_default='fire_news'))
    
    # Add incident_date field for 911 emergency data
    op.add_column('fire_news', sa.Column('incident_date', sa.DateTime(timezone=True), nullable=True))
    
    # Add 911 Emergency specific fields
    op.add_column('fire_news', sa.Column('station_name', sa.String(255), nullable=True))
    op.add_column('fire_news', sa.Column('address', sa.String(500), nullable=True))
    op.add_column('fire_news', sa.Column('context', sa.Text(), nullable=True))
    op.add_column('fire_news', sa.Column('verified_address', sa.String(500), nullable=True))
    op.add_column('fire_news', sa.Column('address_accuracy_score', sa.Float(), nullable=True))
    op.add_column('fire_news', sa.Column('incident_type', sa.String(100), nullable=True))
    op.add_column('fire_news', sa.Column('priority_level', sa.String(50), nullable=True))
    op.add_column('fire_news', sa.Column('response_time', sa.Integer(), nullable=True))
    op.add_column('fire_news', sa.Column('units_dispatched', sa.String(255), nullable=True))
    op.add_column('fire_news', sa.Column('status', sa.String(50), nullable=True))
    op.add_column('fire_news', sa.Column('notes', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove 911 Emergency specific fields
    op.drop_column('fire_news', 'notes')
    op.drop_column('fire_news', 'status')
    op.drop_column('fire_news', 'units_dispatched')
    op.drop_column('fire_news', 'response_time')
    op.drop_column('fire_news', 'priority_level')
    op.drop_column('fire_news', 'incident_type')
    op.drop_column('fire_news', 'address_accuracy_score')
    op.drop_column('fire_news', 'verified_address')
    op.drop_column('fire_news', 'context')
    op.drop_column('fire_news', 'address')
    op.drop_column('fire_news', 'station_name')
    
    # Remove incident_date field
    op.drop_column('fire_news', 'incident_date')
    
    # Remove data_type field
    op.drop_column('fire_news', 'data_type')
