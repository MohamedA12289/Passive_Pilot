"""
Lightning Leads API endpoints
- GET /lightning-leads - Search leads with filters
- POST /ai/offer-email - Generate AI offer email draft
"""

from __future__ import annotations
from typing import Optional, List
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()


class LeadPropertyOut(BaseModel):
    id: str
    address: str
    city: str
    state: str
    zipCode: str
    beds: int
    baths: int
    sqft: int
    listPrice: float
    balance: float
    offerPrice: float
    piti: float
    rent: float
    equityPercent: float
    interestRate: float
    monthlyCashflow: float
    latitude: float
    longitude: float
    images: List[str]
    onMarket: bool
    mortgageTakeover: bool
    propertyType: str
    dealType: str
    inDashboard: bool
    agentName: Optional[str] = None
    agentPhone: Optional[str] = None
    agentEmail: Optional[str] = None


class OfferEmailRequest(BaseModel):
    propertyAddress: str
    propertyCity: str
    propertyState: str
    propertyZip: str
    purchasePrice: float
    downPayment: float
    piti: float
    agentName: Optional[str] = None


class OfferEmailResponse(BaseModel):
    emailText: str


# Mock data for demo
MOCK_LEADS = [
    LeadPropertyOut(
        id="1",
        address="1815 E La Salle Rd",
        city="Phoenix",
        state="AZ",
        zipCode="85086",
        beds=3,
        baths=2,
        sqft=2160,
        listPrice=550000,
        balance=368000,
        offerPrice=397440,
        piti=2754.58,
        rent=3248,
        equityPercent=20.0,
        interestRate=7.1,
        monthlyCashflow=-2114.58,
        latitude=33.7126,
        longitude=-112.0851,
        images=[],
        onMarket=True,
        mortgageTakeover=True,
        propertyType="single_family",
        dealType="sub_to",
        inDashboard=False,
        agentName="John Smith",
        agentPhone="(555) 123-4567",
        agentEmail="john.smith@realty.com",
    ),
    LeadPropertyOut(
        id="2",
        address="4521 W Desert Hills Dr",
        city="Glendale",
        state="AZ",
        zipCode="85304",
        beds=4,
        baths=3,
        sqft=2850,
        listPrice=625000,
        balance=412000,
        offerPrice=468750,
        piti=3125.00,
        rent=3800,
        equityPercent=25.0,
        interestRate=6.5,
        monthlyCashflow=675.00,
        latitude=33.5387,
        longitude=-112.1860,
        images=[],
        onMarket=True,
        mortgageTakeover=False,
        propertyType="single_family",
        dealType="wholesale",
        inDashboard=True,
        agentName="Sarah Johnson",
        agentPhone="(555) 987-6543",
        agentEmail="sarah.j@homes.com",
    ),
    LeadPropertyOut(
        id="3",
        address="789 N Scottsdale Rd",
        city="Scottsdale",
        state="AZ",
        zipCode="85257",
        beds=2,
        baths=2,
        sqft=1450,
        listPrice=385000,
        balance=290000,
        offerPrice=308000,
        piti=2100.00,
        rent=2400,
        equityPercent=18.5,
        interestRate=7.25,
        monthlyCashflow=300.00,
        latitude=33.4942,
        longitude=-111.9261,
        images=[],
        onMarket=False,
        mortgageTakeover=True,
        propertyType="condo",
        dealType="creative",
        inDashboard=False,
        agentName="Mike Davis",
        agentPhone="(555) 456-7890",
        agentEmail="mike.d@azrealty.com",
    ),
]


@router.get("/", response_model=List[LeadPropertyOut])
def get_lightning_leads(
    location: Optional[str] = Query(None, description="City, state, or zip code filter"),
    onMarket: Optional[str] = Query(None, description="'yes' or 'no'"),
    propertyType: Optional[str] = Query(None, description="Property type filter"),
    dealType: Optional[str] = Query(None, description="Deal type filter"),
    priceMin: Optional[float] = Query(None, description="Minimum price"),
    priceMax: Optional[float] = Query(None, description="Maximum price"),
    bedsMin: Optional[int] = Query(None, description="Minimum beds"),
    bathsMin: Optional[int] = Query(None, description="Minimum baths"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """
    Get lightning leads with optional filters.
    Returns mock data for now - integrate with real data providers later.
    """
    results = MOCK_LEADS.copy()

    if location:
        loc = location.lower()
        results = [
            p for p in results
            if loc in p.city.lower() or loc in p.state.lower() or loc in p.zipCode
        ]

    if onMarket == "yes":
        results = [p for p in results if p.onMarket]
    elif onMarket == "no":
        results = [p for p in results if not p.onMarket]

    if propertyType:
        results = [p for p in results if p.propertyType == propertyType]

    if dealType:
        results = [p for p in results if p.dealType == dealType]

    if priceMin is not None:
        results = [p for p in results if p.listPrice >= priceMin]

    if priceMax is not None:
        results = [p for p in results if p.listPrice <= priceMax]

    if bedsMin is not None:
        results = [p for p in results if p.beds >= bedsMin]

    if bathsMin is not None:
        results = [p for p in results if p.baths >= bathsMin]

    return results[offset : offset + limit]


@router.post("/offer-email", response_model=OfferEmailResponse)
def generate_offer_email(request: OfferEmailRequest):
    """
    Generate an AI offer email draft.
    TODO: Integrate with OpenAI when API key is available.
    For now, returns a template-based email.
    """
    agent_name = request.agentName or "Listing Agent"

    email_text = f"""Dear {agent_name},

I hope this message finds you well. I am writing to express my strong interest in the property located at:

{request.propertyAddress}
{request.propertyCity}, {request.propertyState} {request.propertyZip}

After careful consideration, I would like to submit the following offer:

• Purchase Price: ${request.purchasePrice:,.0f}
• Down Payment: ${request.downPayment:,.0f}
• Monthly PITI: ${request.piti:,.2f}

I am a serious buyer and ready to move quickly on this transaction. I would appreciate the opportunity to discuss this offer with you and your client at your earliest convenience.

Please feel free to reach out if you have any questions or if there is any additional information you need from me.

Thank you for your time and consideration.

Best regards,
[Your Name]
[Your Phone]
[Your Email]"""

    return OfferEmailResponse(emailText=email_text)
