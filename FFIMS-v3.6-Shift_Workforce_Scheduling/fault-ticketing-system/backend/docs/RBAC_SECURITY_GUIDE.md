# RBAC Security Guide - Fault Reporting & Ticketing System

## Overview
This document outlines the strict Role-Based Access Control (RBAC) implementation for the Fault Reporting & Ticketing System. The system follows a **ZERO TRUST** security model with no role conflicts and strict permission boundaries.

## Roles Definition

### 1. USER (Student/Staff)
<<<<<<< HEAD
**Purpose**: Limited fault reporting access  
=======
**Purpose**: Limited fault reporting access
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
**Permissions**:
- Create fault reports (title, description, asset info, location, category)
- View ONLY tickets they created
- Track ticket progress/status

**STRICTLY FORBIDDEN**:
- Assigning tickets
- Setting priority
- Changing status
- Viewing other users' tickets
- Accessing technician/admin dashboards
- Adding comments
- Deleting tickets

### 2. TECHNICIAN
<<<<<<< HEAD
**Purpose**: Operational fault management  
=======
**Purpose**: Operational fault management
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
**Permissions**:
- View ALL reported tickets
- Assign tickets to themselves or other technicians
- Set/update priority (Low, Medium, High, Critical)
- Update ticket status (Open, Assigned, In Progress, Resolved, Closed)
- Add resolution notes
- Add comments

**LIMITATIONS**:
- Cannot delete tickets
- Cannot access analytics
- Cannot manage users
- Cannot escalate tickets (admin-only)

### 3. ADMIN
<<<<<<< HEAD
**Purpose**: Full system control  
=======
**Purpose**: Full system control
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
**Permissions**:
- Full access to all tickets
- Override priority and status
- Manage users and technicians
- View system analytics
- Monitor all activities
- Delete tickets
- Escalate tickets

## API Endpoint Protection

### User-Only Endpoints
```
POST /api/faults              # Create fault report
GET  /api/tickets/my          # View own tickets only
GET  /api/tickets/:id         # View own ticket details
```

### Technician/Admin Endpoints
```
GET    /api/tickets           # View all tickets
PUT    /api/tickets/:id       # Update ticket details
PUT    /api/tickets/:id/assign # Assign tickets
PUT    /api/tickets/:id/status # Update status
PUT    /api/tickets/:id/priority # Set priority
POST   /api/tickets/:id/comments # Add comments
```

### Admin-Only Endpoints
```
DELETE /api/tickets/:id       # Delete tickets
GET    /api/analytics         # System analytics
GET    /api/users             # User management
```

## Critical Security Rules

### 1. Priority Management
- **Users CANNOT set priority** - System sets default "Low"
- Only technicians and admins can modify priority
- Priority changes are logged and audited

### 2. Status Transitions
- **Users CANNOT change status** - System controls status flow
- Technicians: Open, Assigned, In Progress, Resolved, Closed
- Admins: All technician statuses + Escalated

### 3. Data Access Control
- Users see ONLY `created_by = req.user.id`
- Technicians and admins see all tickets
- All database queries are scoped by role

### 4. Field-Level Security
- Users can only set: title, description, asset_id, asset_name, category, location
- Technicians can only edit: resolution_notes
- Admins can edit: title, description, category, location, resolution_notes, due_at, maintenance_link

## Backend Enforcement

### Authentication Middleware
```javascript
// JWT token includes role
{ userId, role }

// Role validation on every request
if (!allowedRoles.includes(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}
```

### Database Query Filtering
```javascript
// Users get filtered queries
const filters = buildOwnTicketFilter(req.user, { ...req.query });
// Result: { created_by: req.user.id, ...otherFilters }

// Technicians/Admins get full access
const filters = buildVisibleTicketFilter(req.user, { ...req.query });
// Result: { ...otherFilters } (no created_by filter)
```

### Field Validation
```javascript
// Users cannot set priority
if (req.body.priority !== undefined && req.user.role === "user") {
  return fail(res, "Users cannot set priority", 403);
}

// Only editable fields for role
const editableFields = getEditableTicketFields(req.user.role);
```

## Frontend Security Rules

### User Interface
- Show only fault report form
- Display "My Tickets" page only
- Hide assignment buttons
- Hide priority selection fields
- Hide status controls

### Technician Interface
- Full ticket management dashboard
- Show assign, priority, and status controls
- Display all tickets in queue

### Admin Interface
- Full system dashboard
- Analytics and user management
- Override capabilities

## Workflow Logic

### 1. Fault Report Creation
```
User submits fault (no priority, no assignment)
System creates:
- Fault with status="Reported", priority="Low"
- Ticket with status="Open", priority="Low"
```

### 2. Ticket Processing
```
Technician reviews ticket
Technician assigns + sets priority
Ticket progresses: Open -> Assigned -> In Progress -> Resolved -> Closed
```

### 3. Audit Trail
All actions are logged:
- Who performed the action
- What action was performed
- When it was performed
- Previous vs new values

## Security Testing

### RBAC Tests
```bash
npm run test:rbac
```

### Test Coverage
- Role-based endpoint protection
- Data access filtering
- Field-level permissions
- Priority and status transitions
- Zero-trust validation

## Zero Trust Principles

1. **Never Trust User Input**: All inputs validated and sanitized
2. **Role-Based Everything**: Every action requires role validation
3. **Minimal Privilege**: Each role has minimum required permissions
4. **Audit Everything**: All actions logged for security review
5. **Fail Securely**: All denials return 403/401, no data leakage

## Monitoring & Alerts

- Unauthorized access attempts logged
- Role escalation attempts blocked and logged
- Suspicious patterns trigger alerts
- Regular audit of permissions and access logs

## Compliance

- GDPR-compliant data access controls
- Audit trail for all ticket modifications
- Role-based data minimization
- Secure authentication and authorization

---

**SECURITY NOTICE**: This system implements strict RBAC with zero tolerance for privilege escalation. Any attempt to bypass role restrictions will be logged and blocked immediately.
