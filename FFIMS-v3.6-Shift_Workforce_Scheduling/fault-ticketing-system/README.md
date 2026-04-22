# Fault Ticketing System

Fault Reporting & Ticketing module for the Fleet & Facilities Integrated Management System (FFIMS).

## Integration scope

- Live frontend aligned to the FFIMS design system
- JWT authentication with `user`, `technician`, and `admin` role handling
- FFIMS route structure:
  - `/fault-ticketing`
  - `/fault-ticketing/report`
  - `/fault-ticketing/tickets`
  - `/fault-ticketing/workspace`
  - `/fault-ticketing/:id`
- Backend API for faults, tickets, comments, analytics, notifications, and asset lookups
- Automatic local demo data seeding for user, technician, and admin accounts plus a small ticket set

## Structure

```text
fault-ticketing-system/
|-- frontend/
|-- backend/
|-- docs/
`-- tests/
```

## Frontend

- Stack: React + TypeScript + Vite + Tailwind
- FFIMS UI tokens:
  - Primary Red: `#CC0000`
  - Dark/Nav: `#1A1A1A`
  - Font: `Inter`, `Calibri`
- The main app in `frontend/src/App.tsx` uses the live API. The legacy demo module remains in `frontend/src/fault-ticket-module/` for reference.
- Run:

```bash
cd frontend
npm install
npm run dev
```

## Backend

- Stack: Node.js + Express + MongoDB
- Core collections:
  - `users`
  - `faults`
  - `tickets`
  - `comments`
  - `notifications`
  - `ticket_logs`
- Run:

```bash
cd backend
npm install
npm run db:init
npm run dev
```

For local development without a running MongoDB instance:

```bash
cd backend
set MONGODB_IN_MEMORY=true
node server.js
```

The backend seeds these demo accounts automatically when the database starts:

- User: `demo.user@ffims.local` / `DemoUser123!`
- Technician: `technician@ffims.local` / `Technician123!`
- Admin: `admin@ffims.local` / `Admin123!`

It also seeds a small set of live tickets, comments, notifications, and status transitions so the dashboards are populated immediately.

## Key API endpoints

- `POST /api/faults`
- `GET /api/tickets`
- `GET /api/tickets/:id`
- `PUT /api/tickets/:id`
- `DELETE /api/tickets/:id`
- `POST /api/tickets/:id/comments`
- `GET /api/auth/assignable-users`
- `GET /api/analytics`

## Documentation

- Architecture: `docs/architecture.md`
- API contract: `docs/api-contract.md`
- Integration guide: `docs/integration.md`
- Setup guide: `docs/setup.md`
- Test report: `docs/test-report.md`
- UI design guide: `docs/ui-design.md`

## Verification

- Frontend build: `npm run build`
- Frontend tests: `npm test`
- Frontend lint: `npm run lint`
- Backend smoke: `npm run smoke`
