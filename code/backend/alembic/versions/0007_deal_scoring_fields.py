"""Add deal scoring fields

Revision ID: 0007_deal_scoring_fields
Revises: 0006_audit_events
Create Date: 2025-12-24 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0007_deal_scoring_fields'
down_revision = '0006_audit_events'
branch_labels = None
depends_on = None


def upgrade():
    # Add property detail fields to deals table
    op.add_column('deals', sa.Column('bedrooms', sa.Integer(), nullable=True))
    op.add_column('deals', sa.Column('bathrooms', sa.Float(), nullable=True))
    op.add_column('deals', sa.Column('sqft', sa.Integer(), nullable=True))
    op.add_column('deals', sa.Column('lot_size', sa.Integer(), nullable=True))
    op.add_column('deals', sa.Column('year_built', sa.Integer(), nullable=True))
    op.add_column('deals', sa.Column('property_type', sa.String(), nullable=True))
    
    # Add financial data fields
    op.add_column('deals', sa.Column('list_price', sa.Float(), nullable=True))
    op.add_column('deals', sa.Column('estimated_value', sa.Float(), nullable=True))
    op.add_column('deals', sa.Column('assessed_value', sa.Float(), nullable=True))
    op.add_column('deals', sa.Column('last_sale_price', sa.Float(), nullable=True))
    
    # Add deal scoring fields
    op.add_column('deals', sa.Column('mao', sa.Float(), nullable=True))
    op.add_column('deals', sa.Column('deal_score', sa.Float(), nullable=True))
    
    # Add owner/equity info fields
    op.add_column('deals', sa.Column('equity_percent', sa.Float(), nullable=True))
    op.add_column('deals', sa.Column('mortgage_amount', sa.Float(), nullable=True))
    op.add_column('deals', sa.Column('owner_occupied', sa.Boolean(), nullable=True))
    op.add_column('deals', sa.Column('absentee_owner', sa.Boolean(), nullable=True))
    
    # Add provider metadata fields
    op.add_column('deals', sa.Column('provider_name', sa.String(), nullable=True))
    op.add_column('deals', sa.Column('provider_id', sa.String(), nullable=True))


def downgrade():
    # Remove provider metadata fields
    op.drop_column('deals', 'provider_id')
    op.drop_column('deals', 'provider_name')
    
    # Remove owner/equity info fields
    op.drop_column('deals', 'absentee_owner')
    op.drop_column('deals', 'owner_occupied')
    op.drop_column('deals', 'mortgage_amount')
    op.drop_column('deals', 'equity_percent')
    
    # Remove deal scoring fields
    op.drop_column('deals', 'deal_score')
    op.drop_column('deals', 'mao')
    
    # Remove financial data fields
    op.drop_column('deals', 'last_sale_price')
    op.drop_column('deals', 'assessed_value')
    op.drop_column('deals', 'estimated_value')
    op.drop_column('deals', 'list_price')
    
    # Remove property detail fields
    op.drop_column('deals', 'property_type')
    op.drop_column('deals', 'year_built')
    op.drop_column('deals', 'lot_size')
    op.drop_column('deals', 'sqft')
    op.drop_column('deals', 'bathrooms')
    op.drop_column('deals', 'bedrooms')
