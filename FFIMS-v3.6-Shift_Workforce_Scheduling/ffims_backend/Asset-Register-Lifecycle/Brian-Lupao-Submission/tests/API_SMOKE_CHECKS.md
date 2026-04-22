# API Smoke Checks

## Auth
- POST /api/v1/auth/login -> expected 200 with valid credentials
- GET /api/v1/auth/me -> expected 200 with valid bearer token

## Dashboard and Analytics
- GET /api/v1/analytics/dashboard -> expected 200
- expected planning fields: replacementPriorities, capitalPlanningSummary

## Assets
- GET /api/v1/assets -> expected 200
- POST /api/v1/assets -> expected successful creation with valid payload

## Lifecycle
- GET /api/v1/lifecycle/recent -> expected 200

## Depreciation
- GET /api/v1/depreciation -> expected 200

## Documents
- GET /api/v1/documents/all -> expected 200
- GET /api/v1/documents/:assetId -> expected 200 for assets with linked documents

## Reports
- GET /api/v1/reports/asset-summary -> expected 200
- GET /api/v1/reports/depreciation -> expected 200
- GET /api/v1/reports/maintenance -> expected 200
- GET /api/v1/reports/utilization -> expected 200
- GET /api/v1/reports/transfer-history -> expected 200

## AI
- POST /api/v1/chat/stream -> expected streamed response or fallback summary
