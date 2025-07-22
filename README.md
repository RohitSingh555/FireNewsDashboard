# FireNewsDashboard Monorepo

## Stack
- **Backend:** FastAPI, SQLAlchemy, MySQL, JWT Auth, Alembic, Docker
- **Frontend:** Next.js (TypeScript), Tailwind CSS, shadcn/ui, Docker
- **Monorepo:** docker-compose for orchestration

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js & npm (for local frontend dev)
- Python 3.11+ & pip (for local backend dev)

### Environment Variables
- Edit `backend/.env` and `frontend/.env` as needed for your environment.

### Development
#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
alembic upgrade head  # Run DB migrations
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Production (Docker Compose)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- MySQL: localhost:3306

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "init"
alembic upgrade head
```

## Auth Example
- Register: `POST /register` (JSON: `{ "username": "user", "password": "pass" }`)
- Login: `POST /login` (form: `username`, `password`)
- Get current user: `GET /me` (Bearer token)

## Notes
- CORS is enabled for frontend-backend communication.
- All services use environment variables for config.
- For production, set `APP_ENV=production` in `.env` files.
