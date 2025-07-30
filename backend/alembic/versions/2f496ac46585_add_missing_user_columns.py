"""add_missing_user_columns

Revision ID: 2f496ac46585
Revises: 3bf1ff447a13
Create Date: 2025-07-30 20:00:50.991869

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f496ac46585'
down_revision: Union[str, Sequence[str], None] = '3bf1ff447a13'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add missing columns to users table
    op.add_column('users', sa.Column('username', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('hashed_password', sa.String(length=255), nullable=False, server_default=''))
    op.add_column('users', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Create index for username
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    # Remove the added columns
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'hashed_password')
    op.drop_column('users', 'username')
