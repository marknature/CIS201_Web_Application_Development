# Fault & Ticketing Module

Part of the **Asset Management System**. This module handles fault reporting, ticket management, and technician workflow — all linked to assets from the Asset Register.

## Features

- **Role-Based Dashboard** — KPI cards, fault trend charts, category breakdown, recent tickets (views adapt to user role)
- **Report Fault** — Form with asset selector (fetched from Asset Register), category, priority, drag-and-drop image upload, field validation
- **Tickets** — Filterable/searchable table with status, priority, category, and assigned technician columns
- **Ticket Details** — Full fault info, linked asset details, status timeline, technician notes, assign technician, update status
- **Technician Workspace** — Unassigned ticket queue, assigned tickets with inline asset info, status update + assignment modals
- **Notifications** — Bell dropdown with categorised updates (new fault, assignment, status change, escalation)
- **Empty & Error States** — Graceful handling of no tickets, no assignments, form validation errors

## User Roles

| Role | Permissions |
|---|---|
| **Student / Staff** | Report faults, view own tickets, view dashboard |
| **Technician** | All above + view all tickets, assign tickets, update status, add notes |
| **Admin** | All above + analytics dashboard, user management |

## Integration Points

| Integration | Description |
|---|---|
| **Asset Register** | Asset dropdown in fault report form; asset details on tickets |
| **Procurement** | "Request Replacement" button on ticket details |
| **Users API** | Technician dropdown for assignment (`/api/users?role=technician`) |
| **API Endpoints** | `/api/assets`, `/api/tickets`, `/api/faults`, `/api/users`, `/api/notifications` |

## Configuration

Edit `src/fault-ticket-module/config.ts`:

```ts
export const CONFIG = {
  MODULE_NAME: "Fault & Ticketing",
  USER_ROLES: ["student", "staff", "technician", "admin"],
  API_BASE_URL: "http://localhost:8000/api",
  ENABLE_ASSET_LINK: true,
};
```

## Connecting to Backend

1. Replace mock data in `data/mockData.ts` with API calls
2. Update `CONFIG.API_BASE_URL` to your backend
3. Asset dropdown fetches from `GET /api/assets`
4. Tickets CRUD via `GET/POST /api/tickets`
5. Faults via `GET/POST /api/faults`
6. Technicians via `GET /api/users?role=technician`
7. Notifications via `GET /api/notifications`

## Folder Structure

```
src/fault-ticket-module/
├── components/       # Reusable UI components (StatusBadge, TicketTable, EmptyState, etc.)
├── context/          # Role-based access context (RoleContext)
├── data/             # Mock data, types & interfaces
├── pages/            # Page components (Dashboard, ReportFault, Tickets, etc.)
├── config.ts         # Module configuration
└── README.md         # This file
```

## Tech Stack

React, TypeScript, Tailwind CSS, shadcn/ui, Recharts, React Router

## Setup Instructions

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Navigate to `http://localhost:5173`
5. Use the role switcher in the header to test different user perspectives
