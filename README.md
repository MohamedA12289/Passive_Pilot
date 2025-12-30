# PassivePilot v3

**Real Estate Wholesaling Software - Made Simple**

PassivePilot v3 is a comprehensive SaaS platform for real estate wholesalers to find deals, analyze properties, manage campaigns, and close transactions efficiently.

## 🚀 Current Status: Phase 1 Complete

Phase 1 implements the core property data integration and deal scoring features:

✅ **ATTOM Property API Integration**  
✅ **Deal Scoring Engine** (ARV, MAO, Repair Estimates)  
✅ **Advanced Property Search** with filters  
✅ **Campaign Management System**  
✅ **Role-Based Access Control** (Developer, Admin, Client)  
✅ **Stripe Billing Integration**  
✅ **REST API with OpenAPI docs**

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

## ✨ Features

### Property Search & Analysis
- **ATTOM Integration**: Access nationwide property data
- **Advanced Filters**: Beds, baths, sqft, lot size, year built, owner occupancy
- **Deal Scoring**: Automated ARV, MAO, and repair cost calculations
- **Smart Recommendations**: 0-100 deal score with detailed breakdown

### Campaign Management
- **8-Step Campaign Flow**: From search to contract
- **Property Selection**: Interactive map and list views
- **Lead Organization**: Track properties across multiple campaigns
- **Deal Pipeline**: Lead → Under Contract → Closed → Dead

### User Management
- **3 User Roles**: Developer (full access), Admin (manage users), Client (standard user)
- **Multi-tenant Architecture**: Secure data isolation per organization
- **Active Subscription**: Stripe-powered billing

### Developer Tools
- **REST API**: Full-featured API with authentication
- **OpenAPI/Swagger**: Interactive API documentation at `/docs`
- **Provider Abstraction**: Easy integration of new data sources
- **Background Jobs**: Scalable async processing (ready)

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL (SQLite for development)
- **ORM**: SQLAlchemy + Alembic migrations
- **Authentication**: JWT tokens
- **Validation**: Pydantic v2
- **Testing**: pytest + httpx

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: shadcn/ui
- **State**: React hooks + Context
- **Maps**: Leaflet.js

### Infrastructure
- **Payments**: Stripe
- **Data**: ATTOM Property API
- **Hosting**: Ready for AWS/Vercel/Railway
- **CI/CD**: GitHub Actions (ready)

## 🚀 Quick Start

Follow these steps to run PassivePilot locally with both backend and frontend:

### 1) Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or use SQLite for local development)
- ATTOM API key ([Get one here](https://api.developer.attomdata.com/))

### 2) Clone the repository

```bash
git clone https://github.com/MohamedA12289/Passive_Pilot.git
cd Passive_Pilot
```

### 3) Start the backend (FastAPI)

```bash
cd code/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (includes ATTOM_API_KEY and DATABASE_URL)
cp .env.example .env
# Edit .env with your credentials; for SQLite use: DATABASE_URL=sqlite:///./passive_pilot.db

# Apply database migrations
alembic upgrade head

# Run the API server
uvicorn app.main:app --reload
```

Backend available at http://localhost:8000 (Swagger UI at http://localhost:8000/docs).

### 4) Start the frontend (Next.js)

Open a new terminal (keeping the backend running) and run:

```bash
cd Passive_Pilot/code/frontend

# Install dependencies
npm install

# Configure environment with backend URL
cp .env.example .env.local
# Edit .env.local to set NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the web app
npm run dev
```

Frontend available at http://localhost:3000.

## ⚙️ Configuration

### Backend Environment Variables

Create `code/backend/.env`:

```bash
# Application
APP_NAME=Passive Pilot
ENV=dev
DEBUG=true
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/passive_pilot
# Or for development:
# DATABASE_URL=sqlite:///./passive_pilot.db

# ATTOM API
ATTOM_API_KEY=your_attom_api_key_here
ATTOM_BASE_URL=https://api.gateway.attomdata.com/propertyapi/v1.0.0

# Stripe (optional for development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Deal Scoring (optional - defaults provided)
MAO_MULTIPLIER=0.70
DEFAULT_CLOSING_COST_BUFFER=3000.0
DEFAULT_ASSIGNMENT_FEE=5000.0
```

See full configuration options in [`docs/phase1.md`](docs/phase1.md#configuration).

### Frontend Environment Variables

Create `code/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 API Documentation

### Interactive API Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

#### Properties & Deals
```http
GET  /api/providers/list        # List available data providers
GET  /api/providers/configured  # Check provider configuration

POST /api/deals/analyze         # Analyze property deal
GET  /api/deals                 # List user's deals
POST /api/deals                 # Create new deal
GET  /api/deals/{id}            # Get deal details
PATCH /api/deals/{id}           # Update deal
```

#### Campaigns
```http
GET  /api/campaigns             # List campaigns
POST /api/campaigns             # Create campaign
GET  /api/campaigns/{id}        # Get campaign details
PATCH /api/campaigns/{id}       # Update campaign
```

### Example: Analyze a Deal

```bash
curl -X POST "http://localhost:8000/api/deals/analyze" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip_code": "78704",
    "bedrooms": 3,
    "bathrooms": 2.0,
    "sqft": 1800,
    "year_built": 1985,
    "estimated_value": 350000,
    "asking_price": 270000
  }'
```

Response:
```json
{
  "arv": 350000.0,
  "repair_estimate": 45000.0,
  "mao": 222000.0,
  "deal_score": 78.5,
  "recommendation": "Good Deal",
  "spread": -48000.0,
  "spread_percent": -13.7,
  "score_breakdown": {
    "spread": 70.0,
    "arv": 85.0,
    "equity": 75.0
  },
  "notes": [
    "ARV calculated using: avm",
    "Property condition: average",
    "Good spread: 13.7%"
  ]
}
```

See full API reference in [`docs/phase1.md`](docs/phase1.md#api-reference).

## 💻 Development

### Project Structure

```
passive_pilot/
├── code/
│   ├── backend/              # FastAPI backend
│   │   ├── app/
│   │   │   ├── core/        # Settings, DB, security
│   │   │   ├── models/      # SQLAlchemy models
│   │   │   ├── schemas/     # Pydantic schemas
│   │   │   ├── routers/     # API endpoints
│   │   │   ├── services/    # Business logic
│   │   │   └── providers/   # Data provider integrations
│   │   ├── alembic/         # Database migrations
│   │   ├── tests/           # Unit tests
│   │   └── requirements.txt
│   └── frontend/            # Next.js frontend
│       ├── app/             # Pages (App Router)
│       ├── components/      # React components
│       ├── lib/             # Utilities
│       └── public/
├── docs/                    # Documentation
│   └── phase1.md           # Phase 1 detailed docs
└── README.md               # This file
```

### Running Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# See migration history
alembic history
```

### Code Style

Backend (Python):
- PEP 8 style guide
- Type hints for all functions
- Docstrings for public APIs

Frontend (TypeScript):
- ESLint + Prettier
- TypeScript strict mode
- Component documentation

## 🧪 Testing

### Backend Tests

```bash
cd code/backend

# Run all tests
pytest

# Run specific test file
pytest tests/test_deal_scoring.py

# Run with coverage
pytest --cov=app tests/

# Run with verbose output
pytest -v
```

### Frontend Tests

```bash
cd code/frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 🚢 Deployment

### Backend Deployment

**Option 1: Docker**
```bash
cd code/backend
docker build -t passive-pilot-api .
docker run -p 8000:8000 --env-file .env passive-pilot-api
```

**Option 2: Platform Specific**
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **AWS ECS**: Use included Dockerfile

### Frontend Deployment

**Vercel (Recommended)**:
```bash
cd code/frontend
vercel
```

**Alternative Platforms**:
- Netlify: `netlify deploy`
- AWS Amplify: Connect GitHub
- Docker: `docker build -t passive-pilot-web .`

### Environment Variables for Production

Remember to set all required environment variables in your deployment platform:
- Database connection string (PostgreSQL)
- ATTOM API key
- Stripe keys (if using billing)
- SECRET_KEY (generate a strong random key)

## 🗺 Roadmap

### ✅ Phase 1: ATTOM Integration & Deal Scoring (Current)
- ATTOM Property API integration
- Deal scoring engine (ARV, MAO, repairs)
- Enhanced database schema
- API endpoints for deal analysis

### 📍 Phase 1.5: Frontend Integration (Next)
- Wire ATTOM provider into campaign flow
- Display deal analysis in UI
- Property sorting by deal score
- Visual deal quality indicators

### 🔜 Phase 2: Skip Tracing
- BatchLeads integration
- Owner contact information
- Contact enrichment pipeline
- Do-not-call list management

### 🔜 Phase 3: Contract Generation
- Template management
- Automated field population
- E-signature integration (DocuSign)
- Contract versioning

### 🔜 Phase 4: Buyer Management
- Buyer database
- Buyer matching algorithm
- Assignment workflow
- Buyer portal

### 🔜 Phase 5: Communication
- SMS campaign automation
- Email sequences
- Call tracking
- Follow-up reminders

### 🔜 Phase 6: Analytics & Reporting
- Deal funnel analytics
- ROI tracking
- Performance dashboards
- Custom reports

## 🤝 Contributing

This is a private project. For internal team members:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit with clear messages: `git commit -m "Add feature X"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request for review

## 📄 License

Copyright © 2024 PassivePilot. All rights reserved.

This is proprietary software. Unauthorized copying, modification, or distribution is prohibited.

## 📞 Support

For questions or issues:
- **Documentation**: See [`docs/phase1.md`](docs/phase1.md)
- **API Issues**: Check http://localhost:8000/docs
- **Bug Reports**: Open a GitHub issue
- **Team Contact**: mohamed@passivepilot.com

---

**PassivePilot v3** - Built with ❤️ for real estate wholesalers
