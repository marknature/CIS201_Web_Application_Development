# Database Design Architecture & Requirements Report

**Module**: Fault Reporting & Ticketing System
**System**: Fleet & Facilities Integrated Management System (FFIMS)
**Prepared for**: Database Design & Implementation Review

---

## Introduction

The **Fault Ticketing System** (part of the Fleet & Facilities Integrated Management System - FFIMS) utilizes a modern NoSQL approach with **MongoDB** and **Mongoose**. This document provides a fully detailed breakdown of the requirements, architectural demands, design patterns, integration points, and security constraints implemented in the system. It is intended to give the developer a complete picture of what the database must support and why each decision was made.

---

## 1. Core Technological Stack & Configuration

| Component | Technology Used | Purpose |
|---|---|---|
| Database Engine | MongoDB (NoSQL) | Flexible schema design and horizontal scalability |
| Object Data Modeling | Mongoose (ODM) | Schema validation, middleware support, and type casting |
| In-Memory Testing | mongodb-memory-server | Isolated local development and automated test environments |
| Connection Layer | db.js (Singleton Promise) | Prevents duplicate connections and enforces strict query mode |

### Detailed Explanation

- **MongoDB (NoSQL)**: Chosen over relational databases (e.g., MySQL, PostgreSQL) because fault reports may have varying metadata depending on the type of asset being reported. MongoDB's flexible document model handles this without requiring schema migrations.

- **Mongoose ODM**: Acts as a bridge between the Node.js application and MongoDB. It enforces schema rules at the application level, providing type safety, required field validation, and enumerated value constraints — even though MongoDB itself is schemaless.

- **Environment Flexibility**: The architecture supports two modes:
  - **Persistent Mode**: Connects to a real MongoDB server using the `MONGODB_URI` from the `.env` file.
  - **In-Memory Mode**: Spins up a temporary database using `mongodb-memory-server`. Useful when no MongoDB server is installed locally or when running isolated tests.

- **Connection Management (`db.js`)**: Uses a singleton connection promise pattern. This means the application only establishes **one** connection to the database regardless of how many parts of the system request it simultaneously. This prevents resource exhaustion and ensures reliability.

---

## 2. Architectural Demands (Business Logic Constraints)

The database design is specifically tailored to meet several high-level functional demands dictated by the system's business rules.

### 2.1 Workflow State Machine

Tickets must follow a **strict, ordered status transition**. The database design enforces this through an `enum` on the `status` field:

```
Open → Assigned → In Progress → Resolved → Closed
                                         ↗
                              Any State → Escalated
```

| Transition | Trigger | Roles Allowed |
|---|---|---|
| Open → Assigned | Technician is assigned to the ticket | `technician`, `admin` |
| Assigned → In Progress | Technician begins work | `technician`, `admin` |
| In Progress → Resolved | Fault is fixed and resolution notes added | `technician`, `admin` |
| Resolved → Closed | Admin confirms resolution | `admin` |
| Any → Escalated | Ticket is overdue based on priority thresholds | Automated (via scheduler) |

> **Note for Developer**: Any attempt to set a status value outside this enum will be **rejected by Mongoose** before it even reaches the database. No extra validation code is needed at the database level.

---

### 2.2 Auditability — Immutable Ticket Log

Every change made to a ticket (status change, assignment, update) must be recorded in the `ticket_logs` collection. This creates an **immutable audit trail** that cannot be edited or deleted independently (logs are only deleted when the parent ticket itself is deleted).

This requirement means:
- The `ticket_logs` collection must exist and be maintained alongside the `tickets` collection.
- Every service function that modifies a ticket must also write a corresponding log entry.

---

### 2.3 Relational Mapping in NoSQL

Despite using a NoSQL database, the system enforces **strong relationships** between entities using MongoDB's `ObjectId` references. These are the equivalent of foreign keys in a relational database.

| Relationship | Field | Ref Collection |
|---|---|---|
| Ticket → User (creator) | `created_by` | `users` |
| Ticket → User (assignee) | `assigned_to` | `users` |
| Ticket Log → Ticket | `ticket_id` | `tickets` |
| Ticket Log → User | `performed_by` | `users` |
| Ticket Image → Ticket | `ticket_id` | `tickets` |
| Notification → User | `user_id` | `users` |

Mongoose's `.populate()` method is used to resolve these references at query time, joining the related documents together before returning data to the API layer.

---

### 2.4 Performance Optimization via Indexing

The following fields have database-level indexes applied to ensure fast queries, especially as the data grows:

| Field | Collection | Index Type | Reason |
|---|---|---|---|
| `email` | `users` | Unique Index | Ensures uniqueness and speeds up login lookups |
| `created_by` | `tickets` | Standard Index | Filters tickets by the reporter |
| `assigned_to` | `tickets` | Standard Index | Filters tickets by assigned technician |
| `ticket_id` | `ticket_logs` | Standard Index | Fetches all logs for a specific ticket |
| `ticket_id` | `ticket_images` | Standard Index | Fetches all images for a specific ticket |
| `user_id` | `notifications` | Standard Index | Fetches all notifications for a specific user |

---

## 3. Data Entity Breakdown (Full Schema Requirements)

### Entity Map

```
[users] ←──────────────────────────┐
   │                               │
   │ created_by / assigned_to      │ performed_by / user_id
   ▼                               │
[tickets] ──────────────► [ticket_logs]
   │
   ├──────────────────► [ticket_images]
   │
   └──────────────────► [notifications] → [users]
```

---

### 3.1 Users (`users` collection)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `name` | String | Required, trimmed | Full display name |
| `email` | String | Required, unique, indexed, lowercase | Used for login and notifications |
| `password` | String | Required | Must be stored as a bcrypt hash |
| `role` | String | Required, enum | Controls access and permissions |
| `created_at` | Date | Auto-generated | Timestamp of account creation |

**Allowed Roles and Permissions:**

| Role | Can Report | Can Be Assigned | Can Manage Tickets | Admin Access |
|---|---|---|---|---|
| `student` | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `staff` | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `technician` | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| `admin` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

> **Design Demand**: The `email` field must be unique across the entire `users` collection. Duplicate registrations with the same email should be rejected at the database level.

---

### 3.2 Tickets (`tickets` collection)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `title` | String | Required, trimmed | Short summary of the fault |
| `description` | String | Required, trimmed | Detailed description of the issue |
| `asset_id` | String | Required, trimmed | External identifier from Asset Register |
| `category` | String | Optional | E.g., Electrical, Plumbing, IT, etc. |
| `priority` | String | Required, enum | `Low`, `Medium`, `High`, `Critical` |
| `status` | String | Required, enum | `Open`, `Assigned`, `In Progress`, `Resolved`, `Closed`, `Escalated` |
| `created_by` | ObjectId | Required, ref: User | The user who reported the fault |
| `assigned_to` | ObjectId | Nullable, ref: User | The technician assigned to fix it |
| `resolution_notes` | String | Optional | Notes added when resolving the fault |
| `resolved_at` | Date | Nullable | Timestamp of resolution |
| `created_at` | Date | Auto-generated | When the ticket was submitted |
| `updated_at` | Date | Auto-updated | When the ticket was last modified |

**Escalation Logic (Automated by Scheduler Job):**

| Priority | Escalation Threshold |
|---|---|
| `Critical` | 12 hours with no resolution |
| `High` | 24 hours with no resolution |
| `Low` / `Medium` | No automatic escalation |

---

### 3.3 Ticket Logs (`ticket_logs` collection)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `ticket_id` | ObjectId | Required, ref: Ticket, indexed | The ticket this log belongs to |
| `action` | String | Required | Description of what was done (e.g., "Status changed to Resolved") |
| `performed_by` | ObjectId | Required, ref: User, indexed | The user who performed the action |
| `timestamp` | Date | Defaults to now | When the action occurred |

> **Design Demand**: This collection is **write-only** from a business logic perspective. Logs are never updated — only created. They are only deleted when their parent ticket is deleted (cascading delete handled in the application layer).

---

### 3.4 Ticket Images (`ticket_images` collection)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `ticket_id` | ObjectId | Required, ref: Ticket, indexed | The ticket this image is attached to |
| `file_path` | String | Required | Relative path to the uploaded file on the server |
| `created_at` | Date | Auto-generated | When the image was uploaded |

> **Design Demand**: Supports a **1-to-Many** relationship — one ticket can have multiple images. File uploads are handled via `multipart/form-data` and stored in the `uploads/` directory on the server filesystem.

---

### 3.5 Notifications (`notifications` collection)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `user_id` | ObjectId | Required, ref: User, indexed | The user this notification is for |
| `message` | String | Required | Human-readable notification text |
| `is_read` | Boolean | Defaults to `false` | Whether the user has seen this notification |
| `created_at` | Date | Auto-generated | When the notification was triggered |

> **Design Demand**: Notifications are generated automatically by the system when specific events occur (e.g., when a ticket is assigned to a technician, or a ticket is escalated). The frontend polls this collection to display real-time alerts.

---

## 4. Integration Requirements

### 4.1 External Asset Register

The `asset_id` field in the `tickets` collection is **stored as a plain String** (not an ObjectId). This is an intentional architectural decision to keep the Fault Ticketing System **decoupled** from the Asset Register module.

| Integration Point | Method | Purpose |
|---|---|---|
| Fetch Assets | `GET /assets` → External API | Populate asset dropdown in the ticket form |
| Link Asset to Ticket | Store `asset_id` as String | Maintain a reference without a hard database dependency |

This means: if the Asset Register database changes or is replaced, the Fault Ticketing System does not need to be modified — it simply stores whatever ID is provided.

---

### 4.2 Service Discovery & Health Checks

The database layer exposes its health status to external systems:

| Endpoint | Purpose | Database Involvement |
|---|---|---|
| `GET /health` | Liveness probe — is the server running? | No DB check |
| `GET /ready` | Readiness probe — is the DB connected? | Runs `db.admin().ping()` |
| `GET /integration/capabilities` | Service manifest for other FFIMS modules | No DB check |

> **Design Demand**: The `/ready` endpoint must return a `status: "down"` response if MongoDB is unreachable. This is critical for deployment environments (Docker/Kubernetes) that use health checks to manage container restarts.

---

## 5. Security & Integrity Demands

### 5.1 Schema Validation

Mongoose validates every document **before** it is written to MongoDB. The following rules are enforced:

| Rule | Example |
|---|---|
| Required fields must be present | A ticket without a `title` is rejected |
| Enum values must match allowed list | A status of `"Pending"` is rejected (not in enum) |
| Type coercion | A number passed as `priority` is cast or rejected |
| String trimming | Extra whitespace in `title` or `description` is removed automatically |

---

### 5.2 Role-Based Access Control (RBAC)

The database design supports RBAC by storing a `role` field on each user. The API middleware then uses this role to filter what data the user can access:

| Role | Ticket Visibility | Can Assign | Can Delete | Can View Analytics |
|---|---|---|---|---|
| `student` / `staff` | Own tickets only | ❌ | ❌ | ❌ |
| `technician` | Assigned tickets | ✅ (self-assign) | ❌ | ❌ |
| `admin` | All tickets | ✅ | ✅ | ✅ |

---

### 5.3 Strict Query Mode

The following global MongoDB settings are applied in `db.js`:

```js
mongoose.set("strictQuery", true);   // Only query on fields defined in the schema
mongoose.set("bufferCommands", false); // Fail immediately if DB is not connected
```

| Setting | What It Prevents |
|---|---|
| `strictQuery: true` | Querying on undefined fields that could bypass filters |
| `bufferCommands: false` | Silent failures where queries queue up when DB is down |

---

## Summary Reference Table

| Collection | Role | Key Relationships | Indexes |
|---|---|---|---|
| `users` | Authentication & RBAC | None (root entity) | `email` (unique) |
| `tickets` | Core fault records | → `users` (x2) | `created_by`, `assigned_to` |
| `ticket_logs` | Audit trail | → `tickets`, → `users` | `ticket_id`, `performed_by` |
| `ticket_images` | Visual evidence | → `tickets` | `ticket_id` |
| `notifications` | User alerts | → `users` | `user_id` |

---

*Document prepared for academic/lecturer review of the FFIMS Fault Ticketing System database design.*
