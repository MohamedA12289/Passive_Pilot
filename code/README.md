# PassivePilot v3 - Real Estate Wholesaling SaaS

PassivePilot is a comprehensive real estate wholesaling platform that helps investors find, analyze, and manage property deals efficiently.

## Project Structure

```
code/
├── backend/          # FastAPI backend
├── frontend/         # Next.js 14 frontend
└── docs/             # Documentation
```

## Features

### Phase 1 (✅ Complete)
- ATTOM API integration for property data
- Deal scoring and analysis
- User authentication and authorization
- Campaign management
- Property search and filtering

### Phase 2 (🚧 In Progress)
- Dashboard redesign with black & gold theme
- Mapbox GL JS integration for interactive maps
- Enhanced deal analysis views
- Property search with visual map interface

## Dashboard Redesign

The latest dashboard redesign features:

- **Modern Black & Gold Theme**: Professional color scheme with `#0a0a0a` background, `#d4af37` gold accents
- **Three Main Pages**:
  - `/dashboard` - Main command center with stats, property grid, and map
  - `/properties/search` - Property search with filters and interactive map
  - `/deals/analyze/[id]` - Detailed deal analysis with ARV, scoring, and metadata
- **Mapbox Integration**: Interactive maps with custom markers and popups
- **Responsive Design**: Mobile-first approach with Tailwind CSS

For detailed documentation, see [Frontend Dashboard Documentation](./docs/frontend_dashboard.md)

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT
- **External APIs**: ATTOM

## Getting Started

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- PostgreSQL 14+
- Mapbox account (for maps)
- ATTOM API key (for property data)

### Frontend Setup

```bash
cd code/frontend
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend Setup

```bash
cd code/backend
pip install -r requirements.txt
```

Create `.env`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/passivepilot
ATTOM_API_KEY=your_attom_api_key
JWT_SECRET=your_secret_key
```

Run development server:

```bash
uvicorn main:app --reload
```

API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Environment Variables

### Required

#### Frontend
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox API token for maps

#### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `ATTOM_API_KEY` - ATTOM property data API key
- `JWT_SECRET` - Secret key for JWT tokens

### Optional

#### Frontend
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: http://127.0.0.1:8000)

## Development Workflow

### Quality Gates

Before committing, ensure:

```bash
# Frontend
cd code/frontend
npm run lint        # Check for linting errors
npm run build       # Ensure build succeeds
```

```bash
# Backend
cd code/backend
pytest              # Run tests
black .             # Format code
flake8 .            # Lint code
```

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: your feature"`
3. Push to GitHub: `git push origin feature/your-feature`
4. Open Pull Request
5. Wait for review and merge

## API Documentation

### Backend API

Full API documentation available at: http://127.0.0.1:8000/docs (when backend running)

### Key Endpoints

- `GET /api/deals` - List all deals
- `GET /api/deals/{id}` - Get deal details
- `POST /api/deals/analyze` - Analyze a deal
- `GET /api/properties/search` - Search properties
- `GET /api/campaigns` - List campaigns
- `GET /api/dashboard/stats` - Dashboard statistics

## Documentation

- [Frontend Dashboard Documentation](./docs/frontend_dashboard.md) - Detailed guide to dashboard pages and components
- [Backend API Documentation](http://127.0.0.1:8000/docs) - Interactive API documentation (Swagger UI)

## Deployment

### Frontend (Vercel)

```bash
vercel --prod
```

### Backend (Docker)

```bash
cd code/backend
docker build -t passivepilot-backend .
docker run -p 8000:8000 --env-file .env passivepilot-backend
```

## Testing

### Frontend

```bash
cd code/frontend
npm run test         # Run tests
npm run test:watch   # Watch mode
```

### Backend

```bash
cd code/backend
pytest
pytest --cov        # With coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues or questions:
- GitHub Issues: [Repository Issues](https://github.com/MohamedA12289/Passive_Pilot/issues)
- Email: support@passivepilot.com
