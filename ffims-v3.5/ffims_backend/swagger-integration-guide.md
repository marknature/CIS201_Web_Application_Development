# Swagger Integration Guide

## Purpose
This guide explains how to access the FFIMS Swagger documentation and how each module team should use it as the shared API contract during integration.

## Swagger URLs
When the backend is running locally, use:

- Swagger UI: `http://localhost:5000/api/docs`
- OpenAPI JSON: `http://localhost:5000/api/openapi.json`
- API index: `http://localhost:5000/api/`
- Health check: `http://localhost:5000/api/health`

If your backend is using a different port, replace `5000` with the value of `PORT` in your `.env`.

## Start The Backend
Make sure these are set:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ffims
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=12
PASSWORD_RESET_TOKEN_EXPIRES_MINUTES=15
FRONTEND_URL=http://localhost:5173
```

Then start the backend from `ffims_backend`:

```powershell
npm install
npm run dev
```

Or:

```powershell
node src/server.js
```

On startup the server prints:

- server URL
- Swagger UI URL
- OpenAPI JSON URL
- selected API endpoints
- MongoDB connection status

## How To Access Swagger
1. Start MongoDB.
2. Start the backend server.
3. Open `http://localhost:5000/api/docs` in the browser.
4. Expand a module section to see the available endpoints.
5. Open `http://localhost:5000/api/openapi.json` if you want the raw contract for frontend tools, Postman import, or code generation.

## Authentication In Swagger
Most protected routes use JWT bearer authentication.

Use this flow:

1. Call `POST /api/auth/login`
2. Copy the returned JWT token
3. In Swagger UI click `Authorize`
4. Enter:

```text
Bearer <your-jwt-token>
```

5. Run protected requests after authorization

If a route is admin-only, logging in with a non-admin user will still return `403`.

## How Module Teams Should Use Swagger
Swagger should be treated as the shared integration contract between modules.

Use it to:

- confirm the exact URL for each endpoint
- confirm the HTTP method: `GET`, `POST`, `PATCH`, `PUT`, `DELETE`
- confirm required request fields
- confirm model fields returned in responses
- confirm path parameters such as `{id}` and `{ticketId}`
- confirm which modules already expose APIs and which are still planned

Each team should rely on Swagger before wiring frontend pages, service calls, or cross-module automation.

## Recommended Integration Workflow
For module integration, use this order:

1. Find the target endpoint in Swagger UI.
2. Read the request schema and response shape.
3. Confirm whether the route is already live or only documented from a module route file.
4. Log in and authorize if the route is protected.
5. Test the endpoint directly in Swagger UI or Postman.
6. Use the same payload shape in your frontend, service, or integration module.
7. Report any mismatch between implemented code and Swagger immediately.

## Current Important API Groups
The Swagger docs currently include these major groups:

- Authentication
- Users
- Roles
- Fault Tickets
- Maintenance
- Utilities
- Asset Documents
- Compliance Certificates
- Vehicle Documents
- Fleet
- Assets
- Inventory
- Procurement
- Projects
- Facilities
- Compliance
- Shifts
- Bookings
- Billing
- Approvals
- Notifications
- Dashboards
- Reports
- Gateway
- GraphQL
- Legacy `fault-ticketing`
- Legacy `fleet-management`

## Important Note About Live Routes
Swagger currently documents the module route files broadly across the repo.

That means:

- some endpoints are fully mounted and live under `/api`
- some endpoints are documented because their module routes exist in `src/modules`
- not every documented module is necessarily mounted yet in `src/routes/index.js`

For live integration, verify both:

- Swagger documentation
- mounted routes in [src/routes/index.js](c:/Users/{username}/Documents/GitHub/FFIMS/ffims_backend/src/routes/index.js)

If a route appears in Swagger but returns `404`, it is most likely documented but not yet mounted.

## Best Practices For Teams
- Do not guess endpoint names; copy them from Swagger.
- Do not assume response fields; check the schema.
- Use the same IDs and references shown in the model schemas.
- Keep one source of truth: update Swagger when backend routes or models change.
- During merge review, check that new module routes are both mounted and documented.

## Using OpenAPI JSON For Tooling
The raw spec at `http://localhost:5000/api/openapi.json` can be used for:

- Postman import
- frontend client generation
- integration testing tools
- API gateway validation
- contract review between teams

## Troubleshooting
If Swagger does not open:

- confirm backend is running
- confirm MongoDB is connected
- confirm the correct port is being used
- open `http://localhost:5000/api/openapi.json` to verify the spec loads

If protected endpoints fail:

- log in first
- use `Authorize` in Swagger UI
- confirm the token has not expired
- confirm the user role has permission

If Swagger shows an endpoint but calling it returns `404`:

- check whether that module is mounted in [src/routes/index.js](c:/Users/{username}/Documents/GitHub/FFIMS/ffims_backend/src/routes/index.js)

## Maintenance Rule
Whenever a new module, route, or model is added:

1. add or update the route file
2. mount it in `src/routes/index.js` if it should be live
3. update `src/docs/openapi.js`
4. verify in Swagger UI

This keeps API design, module integration, and frontend consumption aligned.
