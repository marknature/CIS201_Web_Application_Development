# Setup Guide

## Frontend

```bash
cd fault-ticketing-system/frontend
npm install
npm run dev
```

The main FFIMS frontend is live-backed and talks to the API through `/api`. The older browser-only demo module still exists in `src/fault-ticket-module/`, but the active app in `src/App.tsx` is the live workspace.

Optional frontend environment:

```bash
cd fault-ticketing-system/frontend
copy .env.example .env
```

- `VITE_API_BASE_URL=/api`: backend base path for the live app
- `VITE_DEMO_USER_EMAIL` / `VITE_DEMO_USER_PASSWORD`: quick login for the seeded reporter account
- `VITE_TECH_EMAIL` / `VITE_TECH_PASSWORD`: quick login for the seeded technician account
- `VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD`: quick login for the seeded admin account

The legacy mock module still honours `VITE_APP_MODE`, but it is separate from the live workspace used by this project.

The Vite dev server proxies `/api` and `/health` to `http://localhost:5000`.

## Backend

1. Copy the module-level `.env.example` values into `backend/.env`
2. Set `MONGODB_URI` and `JWT_SECRET`
3. Set `PUBLIC_SERVICE_URL`, `FRONTEND_URL`, and `CORS_ORIGIN` if the service will be consumed by other systems
4. Set `ASSET_API` and `PROCUREMENT_API` to advertise upstream/downstream integration URLs
5. Optionally override the demo login accounts if you want different local credentials

Atlas note:

- `backend/.env` now expects the MongoDB Atlas connection through `MONGODB_URI`
- if the URI still contains `NEW_PASSWORD`, replace that placeholder with the actual Atlas database user password before starting the backend
- if the Atlas password contains reserved URL characters, URL-encode it before saving

```bash
cd fault-ticketing-system/backend
npm install
npm run db:init
npm run dev
```

`db:init` and backend startup both seed the demo service accounts plus a small set of tickets, comments, notifications, and logs so the live dashboards are populated immediately.

If you do not have a MongoDB server running locally, use the built-in in-memory MongoDB runtime instead:

```bash
cd fault-ticketing-system/backend
npm run dev:memory
```

## Verification

Frontend:

```bash
cd fault-ticketing-system/frontend
npm run test
npm run build
```

Backend:

```bash
cd fault-ticketing-system/backend
npm run smoke
```

The smoke test now verifies the seeded demo user can see live ticket data before it creates an additional test fault.
