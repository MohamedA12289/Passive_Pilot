"""Add deal scoring fields

Revision ID: 0007_deal_scoring_fields
Revises: 0006a_deals_table
Create Date: 2025-12-24 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0007_deal_scoring_fields'
down_revision = '0006a_deals_table'
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
    op.add_column('deals', sa.Column('arv', sa.Float(), nullable=True))
    op.add_column('deals', sa.Column('repair_estimate', sa.Float(), nullable=True))
    op.add_column('deals', sa.Column('mao', sa.Float(), nullable=True))
    op.add_column('deals', sa.Column('deal_score', sa.Float(), nullable=True))
    
    # Note: equity_percent, mortgage_amount, owner_occupied, absentee_owner,
    # provider_name, provider_id already added in 0006a_deals_table


def downgrade():
    # Remove deal scoring fields
    op.drop_column('deals', 'deal_score')
    op.drop_column('deals', 'mao')
    op.drop_column('deals', 'repair_estimate')
    op.drop_column('deals', 'arv')
    
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
