"""migrate_password_hash_to_hashed_password

Revision ID: 92d209a05030
Revises: 2f496ac46585
Create Date: 2025-07-30 20:02:24.859955

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '92d209a05030'
down_revision: Union[str, Sequence[str], None] = '2f496ac46585'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Copy data from password_hash to hashed_password
    op.execute("UPDATE users SET hashed_password = password_hash WHERE password_hash IS NOT NULL")
    
    # Drop the old password_hash column
    op.drop_column('users', 'password_hash')
    
    # Update role enum to include EDITOR and fix existing roles
    op.execute("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'reporter', 'editor', 'admin') DEFAULT 'user'")
    
    # Set default role for users with NULL or invalid roles
    op.execute("UPDATE users SET role = 'user' WHERE role IS NULL OR role NOT IN ('user', 'reporter', 'editor', 'admin')")


def downgrade() -> None:
    """Downgrade schema."""
    # Add back the password_hash column
    op.add_column('users', sa.Column('password_hash', sa.String(length=128), nullable=False, server_default=''))
    
    # Copy data back from hashed_password to password_hash
    op.execute("UPDATE users SET password_hash = hashed_password WHERE hashed_password IS NOT NULL")
    
    # Revert role enum to original values
    op.execute("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'reporter', 'admin') DEFAULT 'user'")
