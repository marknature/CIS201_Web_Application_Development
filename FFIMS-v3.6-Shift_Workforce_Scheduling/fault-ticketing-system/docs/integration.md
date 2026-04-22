# Integration Guide

## FFIMS Routing

The frontend module is integrated using the FFIMS route structure:

- `/fault-ticketing`
- `/fault-ticketing/report`
- `/fault-ticketing/tickets`
- `/fault-ticketing/:id`

The shared FFIMS home dashboard at `/` includes the pending tickets card and quick links into the module.

## Authentication

Protected endpoints use Bearer JWTs.

1. `POST /api/auth/login`
2. Read the token from `data.token`
3. Send `Authorization: Bearer <token>` on subsequent requests

## Role Model

- `user`: fault reporting, ticket tracking, comments, own record updates
- `technician`: assignment handling, workflow status updates, analytics visibility
- `admin`: full oversight, deletion, analytics, assignment

## Module Integration Points

- Dashboard metrics:
  - `GET /api/analytics`
  - surfaces pending/open/in-progress/resolved counts in FFIMS cards
- Asset register:
  - `GET /api/assets`
  - validates `asset_id` and enriches tickets with category, location, and maintenance references
- Maintenance linkage:
  - tickets carry `maintenance_link` when provided by the asset source
- Notifications:
  - assignment and status transitions create notification records

## Discovery Endpoints

- `GET /health`
- `GET /ready`
- `GET /api/integration/capabilities`
- `GET /api/integration/openapi.json`
- `GET /.well-known/ffims-fault-ticketing.json`

## Recommended Contribution Flow

1. Create branch: `feature/fault-ticketing-system`
2. Implement and verify frontend/backend integration locally
3. Commit with clear scope-based messages:
   - `feat: add fault reporting ui`
   - `feat: implement ticket api`
   - `fix: improve validation`
4. Push the branch to the FFIMS repository remote
5. Open a pull request against the FFIMS main integration branch
