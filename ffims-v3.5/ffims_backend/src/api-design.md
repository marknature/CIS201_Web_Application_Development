# FFIMS API Design

## Purpose

This document defines the first shared API contract for FFIMS so the team can build module backends, frontend integration, and security controls against the same structure.

It is aligned to the current backend conventions:

- Base prefix: `/api`
- Auth: JWT bearer token
- Backend stack: Express + MongoDB
- Existing route style: plural REST resources under `/api/<module>`
- Existing role middleware: route-level RBAC

## API Layers

FFIMS should use four API layers, each with a distinct purpose.

### 1. Public REST API

Used by the frontend and approved external clients.

Characteristics:

- JSON over HTTPS
- Versioned under `/api/v1`
- Resource-oriented endpoints
- JWT required for protected routes
- File uploads use `multipart/form-data`

Examples:

- `/api/v1/auth/login`
- `/api/v1/fault-tickets`
- `/api/v1/fleet/vehicles`

### 2. Internal Service API

Used only between backend modules and scheduled jobs.

Characteristics:

- Never exposed directly to the frontend
- Can remain REST-style HTTP internally or move to message/event-driven integration later
- Protected by service authentication and network restrictions
- Uses stable contracts for cross-module actions

Examples:

- `POST /internal/v1/auth/validate-token`
- `POST /internal/v1/fault-tickets/escalations/run`
- `POST /internal/v1/facilities/{facilityId}/trigger-ticket`

### 3. WebSocket API

Used for real-time events.

Characteristics:

- JWT validated during socket handshake
- Event names use module prefixes
- Only used for notifications, live status, alerts, dashboards
- CRUD still belongs to REST

Examples:

- `auth.session.revoked`
- `fault-ticket.updated`
- `notification.created`
- `dashboard.metric.updated`

### 4. GraphQL Gateway

Optional unified read layer for frontend screens that need data from several modules in one call.

Use GraphQL for:

- dashboards
- executive views
- cross-module summaries
- complex list/detail pages pulling from multiple services

Do not use GraphQL for:

- authentication
- file upload as the primary path
- simple CRUD already covered well by REST
- internal command workflows

## Versioning And Naming Rules

- Public REST: `/api/v1/...`
- Internal API: `/internal/v1/...`
- Resource names are plural and kebab-case
- Use nouns for resources, not verbs
- Use action endpoints only when the action is not a normal CRUD update

Examples:

- `GET /api/v1/users`
- `POST /api/v1/fault-tickets`
- `PATCH /api/v1/fault-tickets/{ticketId}/status`
- `POST /api/v1/fault-tickets/{ticketId}/assignments`

## Standard Response Contract

All public APIs should return a consistent envelope.

### Success

```json
{
  "success": true,
  "message": "Ticket created successfully.",
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 145
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "priority",
        "message": "Priority must be one of low, medium, high, critical."
      }
    ]
  }
}
```

## Authentication API

Authentication stays REST-first and remains the source of truth for identity across all modules.

### Public endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/request-password-reset`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

### Internal endpoints

- `POST /internal/v1/auth/validate-token`
- `GET /internal/v1/auth/users/{userId}/permissions`
- `POST /internal/v1/auth/audit-events`

### WebSocket events

- `auth.session.revoked`
- `auth.password.changed`

### JWT claims

JWT should minimally include:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "Admin",
  "permissions": ["tickets:create", "tickets:update:own"],
  "iat": 1710000000,
  "exp": 1710086400
}
```

## Role And Permission Model

The current backend uses role names directly. For FFIMS scale, keep role-based route checks but define permissions underneath them so shared contracts remain stable even if role names evolve.

### Roles required immediately

- `Admin`
- `Technician`
- `User`
- `Fleet Staff`
- `Facilities Staff`
- `Operations Staff`
- `Approver`
- `Auditor`

### Core permission naming pattern

- `<module>:read`
- `<module>:read:own`
- `<module>:create`
- `<module>:update`
- `<module>:update:own`
- `<module>:delete`
- `<module>:assign`
- `<module>:approve`
- `<module>:report`
- `<module>:manage`

### Ticketing RBAC

#### Admin

- full CRUD on tickets
- assign technicians
- update any ticket status or priority
- manage ticket categories and SLA rules
- view all ticket reports

#### Technician

- view assigned tickets
- update assigned ticket status
- add work notes
- upload resolution evidence

#### User (Reporter)

- create tickets
- view only own tickets
- add attachments to own tickets before closure

## API Gateway Rules

The gateway is mandatory for public traffic.

Responsibilities:

- route requests to module services
- validate JWT before forwarding protected requests
- enforce rate limits
- attach request correlation IDs
- centralize request logging
- normalize error responses
- expose GraphQL read gateway if enabled

Recommended public routes at gateway:

- `/api/v1/auth/*`
- `/api/v1/users/*`
- `/api/v1/fleet/*`
- `/api/v1/assets/*`
- `/api/v1/maintenance/*`
- `/api/v1/fault-tickets/*`
- `/api/v1/inventory/*`
- `/api/v1/procurement/*`
- `/api/v1/projects/*`
- `/api/v1/facilities/*`
- `/api/v1/utilities/*`
- `/api/v1/compliance/*`
- `/api/v1/shifts/*`
- `/api/v1/bookings/*`
- `/api/v1/billing/*`
- `/api/v1/dashboards/*`
- `/api/v1/reports/*`
- `/api/v1/approvals/*`
- `/api/v1/notifications/*`

## Module Route Map

This section defines the recommended top-level route map by module.

### Platform And Core

#### P1 Authentication And User Management

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/request-password-reset`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/users`
- `GET /api/v1/users/{userId}`
- `POST /api/v1/users`
- `PATCH /api/v1/users/{userId}`
- `PATCH /api/v1/users/{userId}/status`
- `PATCH /api/v1/users/{userId}/role`
- `GET /api/v1/roles`

#### API Gateway And Integration Layer

- `GET /api/v1/health`
- `GET /api/v1/gateway/routes`
- `POST /internal/v1/gateway/token-introspection`
- `POST /internal/v1/gateway/security/rate-limit-check`

### Core Operational Systems

#### A1 Fleet Management

- `GET /api/v1/fleet/vehicles`
- `POST /api/v1/fleet/vehicles`
- `GET /api/v1/fleet/vehicles/{vehicleId}`
- `PATCH /api/v1/fleet/vehicles/{vehicleId}`
- `GET /api/v1/fleet/trips`
- `POST /api/v1/fleet/trips`
- `GET /api/v1/fleet/fuel-records`
- `POST /api/v1/fleet/fuel-records`

#### A2 Asset Register And Lifecycle

- `GET /api/v1/assets`
- `POST /api/v1/assets`
- `GET /api/v1/assets/{assetId}`
- `PATCH /api/v1/assets/{assetId}`
- `GET /api/v1/assets/{assetId}/documents`
- `POST /api/v1/assets/{assetId}/documents`
- `GET /api/v1/assets/{assetId}/transactions`

#### A3 Maintenance Planning And Scheduling

- `GET /api/v1/maintenance/tasks`
- `POST /api/v1/maintenance/tasks`
- `GET /api/v1/maintenance/tasks/{taskId}`
- `PATCH /api/v1/maintenance/tasks/{taskId}`
- `PATCH /api/v1/maintenance/tasks/{taskId}/schedule`
- `PATCH /api/v1/maintenance/tasks/{taskId}/status`
- `GET /api/v1/maintenance/recurring-tasks`
- `POST /api/v1/maintenance/recurring-tasks`
- `GET /api/v1/maintenance/history`

#### A4 Faults And Ticketing System

Primary API types:

- REST for CRUD and reporting
- WebSocket for live updates
- Internal API for escalations and cross-module ticket creation

Public REST endpoints:

- `GET /api/v1/fault-tickets`
- `POST /api/v1/fault-tickets`
- `GET /api/v1/fault-tickets/{ticketId}`
- `PATCH /api/v1/fault-tickets/{ticketId}`
- `DELETE /api/v1/fault-tickets/{ticketId}`
- `PATCH /api/v1/fault-tickets/{ticketId}/status`
- `PATCH /api/v1/fault-tickets/{ticketId}/priority`
- `POST /api/v1/fault-tickets/{ticketId}/assignments`
- `GET /api/v1/fault-tickets/{ticketId}/assignments`
- `DELETE /api/v1/fault-tickets/{ticketId}/assignments/{assignmentId}`
- `GET /api/v1/fault-tickets/{ticketId}/comments`
- `POST /api/v1/fault-tickets/{ticketId}/comments`
- `POST /api/v1/fault-tickets/{ticketId}/attachments`
- `GET /api/v1/fault-tickets/stats/summary`

Filtering support:

- `GET /api/v1/fault-tickets?status=open&priority=high&assignedTo={userId}&reportedBy=me&facilityId={facilityId}&page=1&pageSize=20`

Internal endpoints:

- `POST /internal/v1/fault-tickets/escalations/run`
- `POST /internal/v1/fault-tickets/from-facility-alert`
- `POST /internal/v1/fault-tickets/from-maintenance-failure`
- `POST /internal/v1/fault-tickets/{ticketId}/notify`

WebSocket events:

- `fault-ticket.created`
- `fault-ticket.updated`
- `fault-ticket.assigned`
- `fault-ticket.status.changed`
- `fault-ticket.priority.changed`
- `fault-ticket.escalated`

#### A5 Inventory And Stores Management

- `GET /api/v1/inventory/items`
- `POST /api/v1/inventory/items`
- `GET /api/v1/inventory/items/{itemId}`
- `PATCH /api/v1/inventory/items/{itemId}`
- `GET /api/v1/inventory/stock-movements`
- `POST /api/v1/inventory/stock-movements`

#### A6 Procurement And Supplier Management

- `GET /api/v1/procurement/requests`
- `POST /api/v1/procurement/requests`
- `PATCH /api/v1/procurement/requests/{requestId}`
- `GET /api/v1/procurement/suppliers`
- `POST /api/v1/procurement/suppliers`

#### A7 Project Management And Work Coordination

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/{projectId}`
- `PATCH /api/v1/projects/{projectId}`
- `GET /api/v1/projects/{projectId}/tasks`
- `POST /api/v1/projects/{projectId}/tasks`

### Facilities And Administration

#### F1 Grounds And Facilities Monitoring

- `GET /api/v1/facilities`
- `GET /api/v1/facilities/{facilityId}`
- `GET /api/v1/facilities/{facilityId}/health-records`
- `POST /api/v1/facilities/{facilityId}/health-records`
- `GET /api/v1/facilities/{facilityId}/conditions`
- `POST /api/v1/facilities/{facilityId}/conditions`
- `POST /internal/v1/facilities/{facilityId}/trigger-ticket`

#### F2 Energy And Water Utilities Monitoring

- `GET /api/v1/utilities/power-usage`
- `GET /api/v1/utilities/water-usage`
- `GET /api/v1/utilities/alerts`
- `POST /api/v1/utilities/alerts`

#### F3 Compliance And Safety Management

- `GET /api/v1/compliance/records`
- `POST /api/v1/compliance/records`
- `PATCH /api/v1/compliance/records/{recordId}`
- `GET /api/v1/compliance/certificates`
- `POST /api/v1/compliance/certificates`

#### F4 Shift And Workforce Scheduling

- `GET /api/v1/shifts`
- `POST /api/v1/shifts`
- `PATCH /api/v1/shifts/{shiftId}`

#### F5 Events And Venue Booking

- `GET /api/v1/bookings`
- `POST /api/v1/bookings`
- `GET /api/v1/bookings/{bookingId}`
- `PATCH /api/v1/bookings/{bookingId}`
- `POST /api/v1/bookings/{bookingId}/approvals`

#### F6 Internal Billing And Cost Recovery

- `GET /api/v1/billing/bills`
- `POST /api/v1/billing/bills`
- `GET /api/v1/billing/payments`
- `POST /api/v1/billing/payments`

### Management And Intelligence

#### M1 Dashboards And Executive Views

- `GET /api/v1/dashboards/overview`
- `GET /api/v1/dashboards/fleet`
- `GET /api/v1/dashboards/facilities`
- GraphQL query endpoint: `/api/v1/graphql`
- WebSocket event: `dashboard.metric.updated`

#### M2 Analytics And Reporting

- `GET /api/v1/reports/fault-tickets`
- `GET /api/v1/reports/maintenance`
- `GET /api/v1/reports/fleet`
- `GET /api/v1/reports/utilities`

#### M3 Authorisations And Approvals Engine

- `GET /api/v1/approvals`
- `POST /api/v1/approvals`
- `PATCH /api/v1/approvals/{approvalId}/approve`
- `PATCH /api/v1/approvals/{approvalId}/reject`
- `GET /api/v1/audit-logs`

#### M4 Notifications And Messaging

- `GET /api/v1/notifications`
- `POST /api/v1/notifications`
- `PATCH /api/v1/notifications/{notificationId}/read`
- WebSocket event: `notification.created`

## Shared Contract Rules

To keep all modules interoperable, every module API should follow these shared rules:

- All protected endpoints require `Authorization: Bearer <token>`
- All list endpoints support `page`, `pageSize`, `sortBy`, `sortOrder`
- All list endpoints support server-side filtering
- Every write operation records an audit event
- Every resource returns `createdAt` and `updatedAt`
- Resource identifiers use `id` in API responses, even if MongoDB stores `_id`
- Date fields use ISO 8601 UTC strings
- Soft-delete is preferred for business records that require auditability

## Security Rules

These are mandatory for the API design.

- JWT validation at gateway and service layer
- Route-level RBAC for all protected endpoints
- Permission checks for sensitive actions like approval, role change, assignment, and deletion
- Rate limiting at least on login, password reset, and upload endpoints
- Input validation on every request body, path param, and query param
- Centralized audit logging for auth, approvals, status changes, assignments, and deletions
- File upload validation for type, size, virus scanning, and storage path control
- No direct database access from the frontend
- Internal APIs must not trust frontend JWTs blindly; the gateway or service mesh must validate caller identity

## Ticketing API Contract Detail

This is the most immediate operational module and should be built first after auth.

### Ticket entity

```json
{
  "id": "ticket-id",
  "ticketNumber": "FT-2026-0001",
  "title": "Water leak in Block C",
  "description": "Pipe leaking near lab entrance.",
  "ticketType": "fault",
  "priority": "high",
  "status": "open",
  "reportedBy": "user-id",
  "facilityId": "facility-id",
  "roomId": "room-id",
  "assetId": null,
  "vehicleId": null,
  "bookingId": null,
  "projectId": null,
  "workOrderId": null,
  "dueDate": "2026-04-12T12:00:00.000Z",
  "resolvedAt": null,
  "closedAt": null,
  "createdAt": "2026-04-11T12:00:00.000Z",
  "updatedAt": "2026-04-11T12:00:00.000Z"
}
```

### Ticket create request

```json
{
  "title": "Water leak in Block C",
  "description": "Pipe leaking near lab entrance.",
  "ticketType": "fault",
  "priority": "high",
  "facilityId": "facility-id",
  "roomId": "room-id"
}
```

### Assignment create request

```json
{
  "userId": "technician-user-id",
  "assignedRole": "Technician"
}
```

### Status update request

```json
{
  "status": "in_progress"
}
```

### Allowed status values

- `open`
- `assigned`
- `in_progress`
- `resolved`
- `closed`
- `cancelled`
- `overdue`

### Allowed priority values

- `low`
- `medium`
- `high`
- `critical`

## Recommended Build Order

To reduce integration risk, implement APIs in this order:

1. Auth and users hardening
2. Roles and permissions expansion
3. Fault ticketing REST API
4. Ticket notifications over WebSocket
5. Facilities to ticket internal trigger API
6. Maintenance scheduling API
7. GraphQL read gateway for dashboards

## Immediate Gaps Against Current Backend

Compared with the current codebase, these gaps need follow-up work:

- routes are mounted under `/api` today, but public versioning `/api/v1` is not yet added
- `POST /auth/register` is admin-protected today, which is fine for staff onboarding, but self-service signup is not defined yet
- permission-based checks are not implemented yet; current middleware checks role names only
- logout and session revocation endpoints are not implemented yet
- fault ticket routes, services, validators, and controllers are not implemented yet even though models exist
- WebSocket infrastructure is not implemented yet
- GraphQL gateway is not implemented yet

## Recommendation For The Team

For the group split you described, the clean API-design handoff is:

- API designer: define route map, request and response schemas, status codes, and event names
- shared contracts owner: turn this document into OpenAPI schemas and event contracts
- module integration owner: connect each module to the gateway and internal APIs
- security owner: map each endpoint to permissions, rate limits, audit requirements, and penetration test cases

