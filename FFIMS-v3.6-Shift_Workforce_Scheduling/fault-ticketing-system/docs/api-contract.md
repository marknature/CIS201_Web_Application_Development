# API Contract

Base URL: `http://localhost:5000/api`

Persistence: MongoDB

## Response Envelope

Every JSON response uses the same envelope:

```json
{
  "success": true,
  "message": "Human readable summary",
  "data": {},
  "meta": {
    "requestId": "7e9f8c6d-...",
    "timestamp": "2026-04-09T21:00:00.000Z",
    "service": "fault-ticketing-system",
    "version": "1.0.0"
  }
}
```

Validation and dependency failures keep the same shape and populate `errors`.

## Authentication

### `POST /auth/register`

- Purpose: public self-registration for standard reporters
- Allowed role: `user`

### `POST /auth/login`

- Purpose: obtain a JWT access token

### `GET /auth/me`

- Purpose: return the currently authenticated user
- Auth: required

### `GET /auth/assignable-users`

- Purpose: list `technician` and `admin` accounts for ticket assignment
- Auth: required
- Roles: `technician`, `admin`

## Faults

### `POST /faults`

- Purpose: create a fault report and automatically create the linked ticket
- Auth: required
- Supports multipart upload with `images`
- Required body fields:
  - `title`
  - `description`
  - `asset_id`
  - `priority`

## Tickets

### `GET /tickets`

- Purpose: list tickets visible to the current user
- Auth: required
- Supports:
  - `search`
  - `status`
  - `priority`
  - `page`
  - `limit`

### `GET /tickets/:id`

- Purpose: fetch ticket detail with linked fault, comments, and workflow logs
- Auth: required

### `PUT /tickets/:id`

- Purpose: update editable ticket fields
- Auth: required
- Editable fields:
  - `title`
  - `description`
  - `category`
  - `location`
  - `priority`
  - `resolution_notes`
  - `assigned_to` for privileged users
  - `status` for privileged users

### `DELETE /tickets/:id`

- Purpose: delete a ticket and linked fault/comment records
- Auth: required
- Roles: `admin` or ticket owner

### `PUT /tickets/:id/assign`

- Purpose: assign a ticket to a technician/admin
- Auth: required
- Roles: `technician`, `admin`

### `PUT /tickets/:id/status`

- Purpose: move a ticket through the FFIMS workflow
- Auth: required
- Roles: `technician`, `admin`

### `POST /tickets/:id/comments`

- Purpose: add a ticket comment
- Auth: required

## Assets

### `GET /assets`

- Purpose: fetch asset options from the configured asset service or fallback data
- Auth: required

## Notifications

### `GET /notifications`

- Purpose: fetch notifications for current user
- Auth: required

### `PUT /notifications/:id/read`

- Purpose: mark a notification as read
- Auth: required

## Analytics

### `GET /analytics`

- Purpose: return dashboard metrics scoped to the current role
- Auth: required

## Workflow Rules

- Fault status defaults to `Reported`
- Ticket status defaults to `Open`
- Allowed transitions:
  - `Open -> Assigned`
  - `Assigned -> In Progress`
  - `In Progress -> Resolved`
  - `Resolved -> Closed`
  - `Any active state -> Escalated`
