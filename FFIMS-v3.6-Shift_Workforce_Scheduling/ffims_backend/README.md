# FFIMS Backend Authentication Module

This backend contains the Authentication and Authorization module for the Fleet & Facilities Integrated Management System (FFIMS).

It is built with:

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## What This Backend Does

The module supports:

- Admin-managed user creation
- User login with JWT access tokens
- Password hashing and password policy checks
- Role-based authorization
- Protected routes with token verification
- Account activation and deactivation
- Password change and password reset flow
- Audit logging for important authentication events
- Seed data for default system roles

## Setup Instructions

### 1. Open the backend folder

```powershell
cd C:\Users\themb\Documents\FFIMS\ffims_backend
```

### 2. Install dependencies

```powershell
npm install
```

If you previously got a `node-pre-gyp` or `bcrypt` install error on Windows, this backend now uses `bcryptjs` to avoid native build issues.

### 3. Create your environment file

Create a `.env` file in `ffims_backend` and copy the values from `.env.example`.

Example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ffims
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=12
PASSWORD_RESET_TOKEN_EXPIRES_MINUTES=15
FRONTEND_URL=http://localhost:5173
```

### 4. Run the backend in development mode

```powershell
npm run dev
```

### 5. Run the backend in normal mode

```powershell
npm start
```

### 6. Seed the default roles manually if needed

```powershell
npm run seed:roles
```

Note:

- The server already attempts to seed default roles during startup.
- Make sure MongoDB is running before starting the backend.
- The backend runs on `http://localhost:5000` by default.
- The frontend dev server should run on `http://localhost:5173`.
- Backend CORS is restricted to the configured frontend origin for safer local communication.

## Suggested `.gitignore`

The backend `.gitignore` should exclude generated files and secrets such as:

- `node_modules/`
- `.env`
- `logs/`
- `*.log`

This file has already been added to the backend folder.

## API Endpoints

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`

### Users

- `POST /api/users`
- `PATCH /api/users/me`
- `PATCH /api/users/:id/status`
- `PATCH /api/users/:id/role`

## Backend File Guide

### Root Files

#### `package.json`

Defines the backend project metadata, dependencies, and scripts.

Important scripts:

- `npm run dev` starts the backend with `nodemon`
- `npm start` starts the server with Node.js
- `npm run seed:roles` inserts default roles into MongoDB

#### `.env.example`

Provides the template for required environment variables.

#### `.gitignore`

Prevents secrets, dependencies, and logs from being committed to Git.

## `src/` Folder Overview

### `src/server.js`

Starts the application.

Responsibilities:

- connects to MongoDB
- seeds default roles
- starts the Express server

### `src/app.js`

Creates the Express app and loads shared middleware.

Responsibilities:

- enables CORS
- parses JSON request bodies
- enables request logging with `morgan`
- mounts API routes
- uses the global error handler

## `src/config/`

### `src/config/env.js`

Loads environment variables and provides default config values.

### `src/config/db.js`

Handles the MongoDB connection through Mongoose.

## `src/utils/`

### `src/utils/apiError.js`

Defines a reusable custom error class for API errors.

### `src/utils/asyncHandler.js`

Wraps async controllers so thrown errors are forwarded to Express error middleware.

### `src/utils/password.js`

Handles password-related work.

Responsibilities:

- checks password strength
- hashes passwords with bcrypt
- compares plain and hashed passwords

### `src/utils/token.js`

Handles JWT operations.

Responsibilities:

- signs access tokens
- verifies access tokens

### `src/utils/audit.js`

Creates audit log records for important authentication and account events.

## `src/models/`

### `src/models/audit-log.model.js`

MongoDB model for audit logs.

Stores:

- user ID
- action
- request IP address
- user agent
- status
- metadata
- creation time

### `src/models/password-reset-token.model.js`

MongoDB model for password reset tokens.

Stores:

- user ID
- hashed reset token
- expiry date
- used flag

## Main Database Queries

This backend uses Mongoose to interact with MongoDB. Below are the main database queries and operations performed by the authentication and user management module.

### User Queries

#### Create user account

Used in admin registration flow.

Operation:

```js
User.create({
  fullName,
  email,
  phone,
  employeeId,
  department,
  passwordHash,
  roleId,
  status
})
```

Purpose:

- inserts a new user into the `users` collection
- stores a hashed password, never the plain password

#### Check if email already exists

Operation:

```js
User.findOne({ email })
```

Purpose:

- prevents duplicate accounts
- enforces unique email addresses

#### Find user by ID

Operation:

```js
User.findById(userId).populate("roleId")
```

Purpose:

- loads a user profile
- joins the linked role data for authorization and API responses

#### Find user by email during login

Operation:

```js
User.findOne({ email }).populate("roleId")
```

Purpose:

- checks whether the user exists
- loads role information for JWT payload and access control

#### Update own profile

Operation:

```js
User.findByIdAndUpdate(userId, updates, {
  new: true,
  runValidators: true
}).populate("roleId")
```

Purpose:

- updates editable profile fields
- returns the new user document after update

#### Update account status

Operation:

```js
const user = await User.findById(userId).populate("roleId")
user.status = status
await user.save()
```

Purpose:

- activates, deactivates, or suspends an account

#### Update user role

Operation:

```js
const user = await User.findById(userId).populate("roleId")
user.roleId = role._id
await user.save()
```

Purpose:

- changes a user's assigned role
- used only by admins

#### Update last login time

Operation:

```js
user.lastLoginAt = new Date()
await user.save()
```

Purpose:

- records the most recent successful login

#### Change password

Operation:

```js
user.passwordHash = await hashPassword(newPassword)
await user.save()
```

Purpose:

- replaces the stored password hash after password change or reset

### Role Queries

#### Find role by name

Operation:

```js
Role.findOne({ name: roleName })
```

Purpose:

- validates that the requested role exists
- resolves the role document before assigning it to a user

#### Seed default roles

Operation:

```js
Role.updateOne({ name: role.name }, role, { upsert: true })
```

Purpose:

- inserts the role if it does not exist
- updates it if it already exists

### Audit Log Queries

#### Create audit log entry

Operation:

```js
AuditLog.create({
  userId,
  action,
  status,
  metadata,
  ipAddress,
  userAgent
})
```

Purpose:

- stores traceable security and account events
- supports login monitoring and administrative accountability

Examples of logged actions:

- login
- failed login
- account creation
- password change
- password reset
- account activation
- account deactivation
- role change

### Password Reset Token Queries

#### Create password reset token

Operation:

```js
PasswordResetToken.create({
  userId,
  token: hashedToken,
  expiresAt
})
```

Purpose:

- stores a hashed password reset token in the `password_reset_tokens` collection

#### Find valid password reset token

Operation:

```js
PasswordResetToken.findOne({
  token: hashedToken,
  used: false,
  expiresAt: { $gt: new Date() }
})
```

Purpose:

- validates that the reset token exists
- ensures the token has not expired
- ensures the token has not already been used

#### Invalidate old reset tokens

Operation:

```js
PasswordResetToken.updateMany(
  { userId, used: false },
  { used: true }
)
```

Purpose:

- marks previous reset tokens as used
- prevents reuse of older tokens

## Query Use by Endpoint

### `POST /api/auth/login`

Main queries:

- `User.findOne({ email }).populate("roleId")`
- `user.save()` to update `lastLoginAt`
- `AuditLog.create(...)`

### `POST /api/auth/register`

Main queries:

- `User.findOne({ email })`
- `Role.findOne({ name: roleName })`
- `User.create(...)`
- `AuditLog.create(...)`

### `POST /api/users`

Main queries:

- `User.findOne({ email })`
- `Role.findOne({ name: roleName })`
- `User.create(...)`
- `AuditLog.create(...)`

### `GET /api/auth/me`

Main queries:

- `User.findById(userId).populate("roleId")`

### `POST /api/auth/change-password`

Main queries:

- `User.findById(userId).populate("roleId")`
- `user.save()`
- `PasswordResetToken.updateMany(...)`
- `AuditLog.create(...)`

### `POST /api/auth/request-password-reset`

Main queries:

- `User.findOne({ email }).populate("roleId")`
- `PasswordResetToken.updateMany(...)`
- `PasswordResetToken.create(...)`
- `AuditLog.create(...)`

### `POST /api/auth/reset-password`

Main queries:

- `PasswordResetToken.findOne(...)`
- `User.findById(resetToken.userId)`
- `user.save()`
- `resetToken.save()`
- `PasswordResetToken.updateMany(...)`
- `AuditLog.create(...)`

### `PATCH /api/users/me`

Main queries:

- `User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).populate("roleId")`

### `PATCH /api/users/:id/status`

Main queries:

- `User.findById(userId).populate("roleId")`
- `user.save()`
- `AuditLog.create(...)`

### `PATCH /api/users/:id/role`

Main queries:

- `User.findById(userId).populate("roleId")`
- `Role.findOne({ name: roleName })`
- `user.save()`
- `AuditLog.create(...)`

## `src/modules/roles/`

### `src/modules/roles/role.model.js`

MongoDB model for user roles.

Stores:

- role name
- description
- permissions list

## `src/modules/users/`

### `src/modules/users/user.model.js`

MongoDB model for system users.

Stores:

- full name
- email
- phone
- employee or student ID
- department
- password hash
- assigned role
- account status
- last login date
- timestamps

It also provides a `toSafeObject()` helper so password hashes are never returned in API responses.

### `src/modules/users/user.service.js`

Contains user business logic.

Responsibilities:

- create a new user account
- ensure email uniqueness
- find users safely
- update own profile
- update user status
- update user role
- create audit logs for admin account actions

### `src/modules/users/user.controller.js`

Handles incoming user route requests and returns HTTP responses.

### `src/modules/users/user.routes.js`

Defines user-related routes and applies:

- authentication middleware
- role authorization middleware
- request validation

## `src/modules/auth/`

### `src/modules/auth/auth.validation.js`

Contains request validators for:

- login
- registration
- change password
- password reset request
- password reset
- profile update
- status update
- role update

### `src/modules/auth/auth.service.js`

Contains authentication business logic.

Responsibilities:

- verify login credentials
- reject inactive or suspended accounts
- generate JWT access tokens
- return the logged-in user profile
- change passwords
- create password reset tokens
- reset passwords using valid reset tokens
- log auth events into audit logs

### `src/modules/auth/auth.controller.js`

Connects auth service logic to Express responses.

### `src/modules/auth/auth.routes.js`

Defines authentication routes and applies validation and token protection where needed.

## `src/middleware/`

### `src/middleware/auth.middleware.js`

JWT authentication middleware.

Responsibilities:

- reads the `Authorization` header
- verifies the bearer token
- loads the authenticated user
- rejects invalid, expired, or inactive accounts
- attaches the user to `req.user`

### `src/middleware/role.middleware.js`

Role-based access middleware.

Responsibilities:

- checks the logged-in user role
- allows only permitted roles for a route

### `src/middleware/validation.middleware.js`

Runs validator functions and returns `400 Bad Request` if validation fails.

### `src/middleware/error.middleware.js`

Global API error handler.

Responsibilities:

- formats API errors consistently
- handles duplicate key errors
- returns validation details when available

## `src/routes/`

### `src/routes/index.js`

Central route registry for the backend.

Responsibilities:

- mounts `/api/auth`
- mounts `/api/users`
- exposes `/api/health`

## `src/seeders/`

### `src/seeders/role.seeder.js`

Seeds default system roles into MongoDB.

Default roles:

- Admin
- Fleet Staff
- Facilities Staff
- Operations Staff
- General Staff

## Authentication and Authorization Rules

- Email addresses must be unique.
- Passwords are never stored in plain text.
- Only admins can create users.
- Only admins can change another user's role or status.
- Inactive and suspended users cannot log in.
- Protected routes require a valid JWT bearer token.
- Login failures return safe error messages.
- Important auth actions are written to audit logs.

## Development Notes

- `POST /api/auth/register` is currently admin-protected, matching the requirement that admins create accounts.
- `POST /api/users` also allows admin account creation.
- The password reset request currently returns the raw reset token in the response for development/testing. In production, this token should usually be emailed instead of returned in the API response.

## Next Good Improvements

- Add email delivery for password reset links
- Add refresh tokens if long sessions are needed
- Add unit and integration tests
- Add rate limiting for login attempts
- Add permission-based authorization in addition to role-based checks
