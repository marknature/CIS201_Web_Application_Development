# Architecture

## Module Boundaries

- `frontend/`: user interface, navigation, forms, dashboards, and client-side interaction
- `backend/`: REST API, RBAC, ticket workflow, notifications, and persistence
- `docs/`: architecture, setup, API contract, screenshots, and testing evidence
- `tests/`: cross-module integration, e2e, and API collection assets

## Integration Model

- Frontend communicates with backend over HTTP using `/api/*`
- Backend integrates with the Asset Register through the `ASSET_API` configuration
- Procurement integration is currently represented in the UI and should be implemented as an API-based handoff
- External systems can discover this module through `/api/integration/capabilities`, `/api/integration/openapi.json`, `/health`, and `/ready`
- Every API response includes request metadata so upstream systems can trace calls with `X-Request-Id`

## Backend Layering

- `config/`: environment and database configuration
- `controllers/`: request/response orchestration
- `middleware/`: auth, RBAC, uploads, validation response handling
- `models/`: SQL access layer
- `routes/`: endpoint definitions
- `services/`: ticket workflow and integration logic
- `jobs/`: scheduled escalation processing
- `utils/`: shared helpers and scripts
- `validators/`: reserved location for extracted request schemas/validators
