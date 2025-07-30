"""add verified and hidden fields

Revision ID: 123456789abc
Revises: c3a0b4424752
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '123456789abc'
down_revision = 'c3a0b4424752'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_verified column to fire_news table
    op.add_column('fire_news', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='0'))
    
    # Add is_hidden column to fire_news table
    op.add_column('fire_news', sa.Column('is_hidden', sa.Boolean(), nullable=False, server_default='0'))


def downgrade():
    # Remove is_hidden column from fire_news table
    op.drop_column('fire_news', 'is_hidden')
    
    # Remove is_verified column from fire_news table
    op.drop_column('fire_news', 'is_verified') 