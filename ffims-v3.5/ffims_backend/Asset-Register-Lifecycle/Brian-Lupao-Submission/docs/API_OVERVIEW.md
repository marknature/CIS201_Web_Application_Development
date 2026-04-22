# API Overview

## Base Path
/api/v1

## Main Endpoint Groups
- /auth
- /assets
- /lifecycle
- /depreciation
- /documents
- /analytics
- /reports
- /chat

## Key Endpoints Used by the Module
- POST /auth/login
- GET /auth/me
- GET /assets
- POST /assets
- GET /lifecycle/recent
- GET /depreciation
- GET /documents/all
- GET /analytics/dashboard
- GET /reports/asset-summary
- GET /reports/depreciation
- GET /reports/maintenance
- GET /reports/utilization
- GET /reports/transfer-history
- POST /chat/stream

## Executive Planning Addition
GET /analytics/dashboard now also returns:
- replacementPriorities
- capitalPlanningSummary

These fields support the replacement-priority planning board used in the dashboard and executive reports.
