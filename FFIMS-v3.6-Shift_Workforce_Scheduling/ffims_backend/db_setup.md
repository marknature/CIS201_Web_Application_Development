# FFIMS Database Setup

This document explains:

- the current MongoDB schemas used by the backend
- how to install MongoDB locally on Windows
- how to configure the backend connection
- how to run schema migrations

## Database Connection

The backend is currently configured to use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ffims
```

That means:

- MongoDB runs locally on your laptop
- the database name is `ffims`
- the backend reads this from [`ffims_backend/.env`](/c:/Users/themb/Documents/FFIMS/ffims_backend/.env)

## Current Schemas

All Mongoose models live in [`src/models`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models).

### 1. `users`

File: [`user.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/user.model.js)

```js
{
  _id: ObjectId,
  username: String,
  email: String,
  firstName: String,
  surname: String,
  passwordHash: String,
  role: String,
  phone: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. `auditlogs`

File: [`audit-log.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/audit-log.model.js)

```js
{
  _id: ObjectId,
  userId: ObjectId,
  moduleName: String,
  actionType: String,
  entityName: String,
  entityId: ObjectId,
  oldValues: Object,
  newValues: Object,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

### 3. `systemsettings`

File: [`system-setting.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/system-setting.model.js)

```js
{
  _id: ObjectId,
  settingKey: String,
  settingValue: String,
  description: String,
  updatedBy: ObjectId,
  updatedAt: Date
}
```

### 4. `usersessions`

File: [`user-session.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/user-session.model.js)

```js
{
  _id: ObjectId,
  userId: ObjectId,
  sessionToken: String,
  loginTime: Date,
  expiryTime: Date,
  isRevoked: Boolean
}
```

### 5. `passwordresettokens`

File: [`password-reset-token.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/password-reset-token.model.js)

```js
{
  _id: ObjectId,
  userId: ObjectId,
  token: String,
  expiresAt: Date,
  used: Boolean,
  createdAt: Date
}
```

### 6. Fleet Management

- [`driver.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/driver.model.js): `drivers`
- [`vehicle.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/vehicle.model.js): `vehicles`
- [`duty-assignment.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/duty-assignment.model.js): `dutyassignments`
- [`trip.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/trip.model.js): `trips`
- [`fuel-record.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/fuel-record.model.js): `fuelrecords`
- [`vehicle-maintenance.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/vehicle-maintenance.model.js): `vehiclemaintenance`
- [`incident.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/incident.model.js): `incidents`
- [`inventory-item.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/inventory-item.model.js): `inventoryitems`
- [`maintenance-part-usage.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/maintenance-part-usage.model.js): `maintenancepartusage`
- [`vehicle-document.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/vehicle-document.model.js): `vehicledocuments`

### 7. Asset Register and Lifecycle

- [`asset-category.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/asset-category.model.js): `assetcategories`
- [`asset-location.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/asset-location.model.js): `assetlocations`
- [`supplier.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/supplier.model.js): `suppliers`
- [`asset.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/asset.model.js): `assets`
- [`asset-transaction.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/asset-transaction.model.js): `assettransactions`
- [`asset-document.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/asset-document.model.js): `assetdocuments`
- [`asset-valuation.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/asset-valuation.model.js): `assetvaluations`

### 8. Maintenance Planning and Scheduling

- [`maintenance-task.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/maintenance-task.model.js): `maintenancetasks`
- [`recurring-task.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/recurring-task.model.js): `recurringtasks`
- [`maintenance-history.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/maintenance-history.model.js): `maintenancehistory`

### 9. Procurement and Supplier Management

- [`supplier-item.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/supplier-item.model.js): `supplieritems`
- [`procurement-request.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/procurement-request.model.js): `procurementrequests`

### 10. Grounds and Facilities Monitoring

- [`facility-category.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility-category.model.js): `facilitycategories`
- [`facility-navigation-group.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility-navigation-group.model.js): `facilitynavigationgroups`
- [`facility.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility.model.js): `facilities`
- [`facility-group-member.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility-group-member.model.js): `facilitygroupmembers`
- [`facility-health-record.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility-health-record.model.js): `facilityhealthrecords`
- [`facility-asset-condition.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility-asset-condition.model.js): `facilityassetconditions`
- [`facility-utility-metric.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility-utility-metric.model.js): `facilityutilitymetrics`
- [`facility-score-breakdown.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility-score-breakdown.model.js): `facilityscorebreakdowns`
- [`facility-threshold-rule.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility-threshold-rule.model.js): `facilitythresholdrules`
- [`facility-work-order.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility-work-order.model.js): `facilityworkorders`
- [`facility-activity-log.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/facility-activity-log.model.js): `facilityactivitylogs`

### 11. Events and Venue Booking

- [`room.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/room.model.js): `rooms`
- [`equipment.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/equipment.model.js): `equipment`
- [`booking.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/booking.model.js): `bookings`
- [`booking-approval.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/booking-approval.model.js): `bookingapprovals`
- [`booking-equipment.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/booking-equipment.model.js): `bookingequipment`

### 12. Internal Billing and Cost Recovery

- [`bill.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/bill.model.js): `bills`
- [`bill-item.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/bill-item.model.js): `billitems`
- [`payment.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/payment.model.js): `payments`

### 13. Supporting Model

File: [`role.model.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/models/role.model.js)

This model supports the current backend authorization flow. It is not part of the pasted schema list, but the app still uses it to manage allowed role names and permissions.

## How To Download and Install MongoDB on Windows

### Option 1: MongoDB Community Server

1. Go to the MongoDB Community download page.
2. Download the Windows MSI installer for MongoDB Community Server.
3. Run the installer.
4. Choose `Complete` setup unless you have a custom reason not to.
5. On the service screen:
   - keep `Install MongoD as a Service` checked
   - choose `Run service as Network Service user`
6. Finish the installation.

### Optional Tools

- Install `MongoDB Compass` if you want a GUI to view collections.
- Install `mongosh` if you want the Mongo shell in PowerShell.

## Verify MongoDB Is Running

In PowerShell:

```powershell
Get-Service MongoDB
netstat -ano | findstr :27017
```

Expected result:

- the `MongoDB` service should be `Running`
- port `27017` should be listening

If needed, start the service:

```powershell
Start-Service MongoDB
```

## Backend Environment Setup

Make sure [`ffims_backend/.env`](/c:/Users/themb/Documents/FFIMS/ffims_backend/.env) contains:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ffims
JWT_SECRET=your-generated-secret
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=12
PASSWORD_RESET_TOKEN_EXPIRES_MINUTES=15
FRONTEND_URL=http://localhost:5173
```

## Install Backend Dependencies

From the backend folder:

```powershell
cd C:\Users\themb\Documents\FFIMS\ffims_backend
npm install
```

If PowerShell blocks `npm`, use:

```powershell
npm.cmd install
```

## Run Migrations

The backend now includes a migration script:

File: [`migrate-schema.js`](/c:/Users/themb/Documents/FFIMS/ffims_backend/src/migrations/migrate-schema.js)

Run it with:

```powershell
cd C:\Users\themb\Documents\FFIMS\ffims_backend
npm.cmd run migrate
```

What it does:

- connects to MongoDB
- loads all current models
- seeds roles
- normalizes older `users` documents to the current schema
- normalizes older `auditlogs` documents to the current schema
- initializes collections and indexes

## Seed Roles

To seed the authorization roles:

```powershell
npm.cmd run seed:roles
```

## Start The Backend

For development:

```powershell
npm.cmd run dev
```

For normal start:

```powershell
npm.cmd start
```

## Suggested Setup Order

1. Install MongoDB Community Server.
2. Confirm the MongoDB service is running.
3. Open the backend folder.
4. Install Node dependencies.
5. Confirm `.env` exists and has the right `MONGODB_URI`.
6. Run `npm.cmd run migrate`.
7. Run `npm.cmd run seed:roles` if needed.
8. Start the backend with `npm.cmd run dev`.

## Notes

- The app currently uses references between collections with `ObjectId` and `ref`.
- MongoDB does not enforce SQL-style foreign keys, so application logic must keep references valid.
- Bills, bookings, and similar modules are currently modeled as separate collections, matching your provided schema.
