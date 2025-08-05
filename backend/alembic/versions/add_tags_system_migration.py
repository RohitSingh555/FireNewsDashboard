"""add_tags_system_and_verifier_feedback

Revision ID: add_tags_system_migration
Revises: c3a0b4424752
Create Date: 2025-01-27 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_tags_system_migration'
down_revision: Union[str, Sequence[str], None] = '123456789abc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add verifier_feedback column to fire_news table
    op.add_column('fire_news', sa.Column('verifier_feedback', sa.Text(), nullable=True))
    
    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for tags table
    op.create_index(op.f('ix_tags_id'), 'tags', ['id'], unique=False)
    op.create_index(op.f('ix_tags_name'), 'tags', ['name'], unique=True)
    
    # Create fire_news_tags junction table
    op.create_table(
        'fire_news_tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('fire_news_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['fire_news_id'], ['fire_news.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for fire_news_tags table
    op.create_index(op.f('ix_fire_news_tags_id'), 'fire_news_tags', ['id'], unique=False)
    op.create_index(op.f('ix_fire_news_tags_fire_news_id'), 'fire_news_tags', ['fire_news_id'], unique=False)
    op.create_index(op.f('ix_fire_news_tags_tag_id'), 'fire_news_tags', ['tag_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop fire_news_tags table and indexes
    op.drop_index(op.f('ix_fire_news_tags_tag_id'), table_name='fire_news_tags')
    op.drop_index(op.f('ix_fire_news_tags_fire_news_id'), table_name='fire_news_tags')
    op.drop_index(op.f('ix_fire_news_tags_id'), table_name='fire_news_tags')
    op.drop_table('fire_news_tags')
    
    # Drop tags table and indexes
    op.drop_index(op.f('ix_tags_name'), table_name='tags')
    op.drop_index(op.f('ix_tags_id'), table_name='tags')
    op.drop_table('tags')
    
    # Drop verifier_feedback column from fire_news table
    op.drop_column('fire_news', 'verifier_feedback') 