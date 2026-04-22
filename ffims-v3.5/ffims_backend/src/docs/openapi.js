const fs = require("fs");
const path = require("path");

const serverUrl = process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:5000";

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "FFIMS Backend API",
    version: "1.0.0",
    description: "Swagger documentation for the currently implemented FFIMS backend modules.",
  },
  servers: [
    {
      url: serverUrl,
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      RegistrationRequest: {
        type: "object",
        required: ["email", "password", "role"],
        properties: {
          username: { type: "string" },
          firstName: { type: "string" },
          surname: { type: "string" },
          fullName: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          role: { type: "string" },
          password: { type: "string" },
          status: { type: "string" },
        },
      },
      ChangePasswordRequest: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string" },
          newPassword: { type: "string" },
        },
      },
      PasswordResetRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["token", "newPassword"],
        properties: {
          token: { type: "string" },
          newPassword: { type: "string" },
        },
      },
      ProfileUpdateRequest: {
        type: "object",
        properties: {
          username: { type: "string" },
          firstName: { type: "string" },
          surname: { type: "string" },
          phone: { type: "string" },
        },
      },
      StatusUpdateRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["active", "inactive", "suspended"] },
        },
      },
      RoleUpdateRequest: {
        type: "object",
        required: ["role"],
        properties: {
          role: { type: "string" },
        },
      },
      FaultTicketRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          facilityId: { type: "string" },
          assetId: { type: "string" },
          dueDate: { type: "string", format: "date-time" },
        },
      },
      MaintenanceTaskRequest: {
        type: "object",
        required: ["taskName", "assetId"],
        properties: {
          taskName: { type: "string" },
          description: { type: "string" },
          assetId: { type: "string" },
          priorityLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
          assignedTo: { type: "string" },
        },
      },
      UtilityAlertRequest: {
        type: "object",
        required: ["alertType", "message"],
        properties: {
          buildingId: { type: "string" },
          facilityId: { type: "string" },
          alertType: { type: "string" },
          alertCategory: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          message: { type: "string" },
          status: { type: "string", enum: ["open", "monitoring", "resolved"] },
          assignedTo: { type: "string" },
        },
      },
      PowerUsageRequest: {
        type: "object",
        required: ["buildingId", "usageDate"],
        properties: {
          buildingId: { type: "string" },
          facilityId: { type: "string" },
          usageDate: { type: "string", format: "date-time" },
          kilowattHours: { type: "number" },
          peakDemand: { type: "number" },
          costAmount: { type: "number" },
          notes: { type: "string" },
        },
      },
      WaterUsageRequest: {
        type: "object",
        required: ["buildingId", "usageDate"],
        properties: {
          buildingId: { type: "string" },
          facilityId: { type: "string" },
          usageDate: { type: "string", format: "date-time" },
          volumeLitres: { type: "number" },
          costAmount: { type: "number" },
          sourceType: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/": {
      get: {
        summary: "Get API index",
        responses: {
          200: { description: "API route index returned successfully." },
        },
      },
    },
    "/api/health": {
      get: {
        summary: "Get health status",
        responses: {
          200: { description: "Backend health check returned successfully." },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Log in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Login successful." },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Register a user account as admin",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegistrationRequest" },
            },
          },
        },
        responses: {
          201: { description: "User account created successfully." },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Get current user profile",
        responses: {
          200: { description: "Authenticated user returned successfully." },
        },
      },
    },
    "/api/auth/change-password": {
      post: {
        summary: "Change the current user's password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
            },
          },
        },
        responses: {
          200: { description: "Password changed successfully." },
        },
      },
    },
    "/api/auth/request-password-reset": {
      post: {
        summary: "Request a password reset token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PasswordResetRequest" },
            },
          },
        },
        responses: {
          200: { description: "Password reset request handled successfully." },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        summary: "Reset password with token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
            },
          },
        },
        responses: {
          200: { description: "Password reset successfully." },
        },
      },
    },
    "/api/users": {
      post: {
        summary: "Create a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegistrationRequest" },
            },
          },
        },
        responses: {
          201: { description: "User created successfully." },
        },
      },
    },
    "/api/users/me": {
      patch: {
        summary: "Update current user profile",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProfileUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "Profile updated successfully." },
        },
      },
    },
    "/api/users/{id}/status": {
      patch: {
        summary: "Update a user's status",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StatusUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "User status updated successfully." },
        },
      },
    },
    "/api/users/{id}/role": {
      patch: {
        summary: "Update a user's role",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RoleUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "User role updated successfully." },
        },
      },
    },
    "/api/fault-tickets": {
      get: {
        summary: "List fault tickets",
        responses: {
          200: { description: "Fault tickets returned successfully." },
        },
      },
      post: {
        summary: "Create a fault ticket",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FaultTicketRequest" },
            },
          },
        },
        responses: {
          201: { description: "Fault ticket created successfully." },
        },
      },
    },
    "/api/fault-tickets/{id}": {
      get: {
        summary: "Get a fault ticket",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Fault ticket returned successfully." } },
      },
      patch: {
        summary: "Update a fault ticket",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FaultTicketRequest" },
            },
          },
        },
        responses: { 200: { description: "Fault ticket updated successfully." } },
      },
      delete: {
        summary: "Delete a fault ticket",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Fault ticket deleted successfully." } },
      },
    },
    "/api/maintenance": {
      get: {
        summary: "List maintenance tasks",
        responses: { 200: { description: "Maintenance tasks returned successfully." } },
      },
      post: {
        summary: "Create a maintenance task",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MaintenanceTaskRequest" },
            },
          },
        },
        responses: { 201: { description: "Maintenance task created successfully." } },
      },
    },
    "/api/maintenance/{id}": {
      get: {
        summary: "Get a maintenance task",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Maintenance task returned successfully." } },
      },
      patch: {
        summary: "Update a maintenance task",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MaintenanceTaskRequest" },
            },
          },
        },
        responses: { 200: { description: "Maintenance task updated successfully." } },
      },
      delete: {
        summary: "Delete a maintenance task",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Maintenance task deleted successfully." } },
      },
    },
    "/api/maintenance/from-ticket/{ticketId}": {
      post: {
        summary: "Create a maintenance task from a fault ticket",
        parameters: [{ name: "ticketId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  taskName: { type: "string" },
                  description: { type: "string" },
                  assignedTo: { type: "string" },
                  supervisorId: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Maintenance task created from fault ticket successfully." } },
      },
    },
    "/api/utilities/power-usage": {
      get: {
        summary: "List power usage records",
        responses: { 200: { description: "Power usage records returned successfully." } },
      },
      post: {
        summary: "Create a power usage record",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PowerUsageRequest" },
            },
          },
        },
        responses: { 201: { description: "Power usage record created successfully." } },
      },
    },
    "/api/utilities/power-usage/{id}": {
      get: {
        summary: "Get a power usage record",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Power usage record returned successfully." } },
      },
      patch: {
        summary: "Update a power usage record",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PowerUsageRequest" },
            },
          },
        },
        responses: { 200: { description: "Power usage record updated successfully." } },
      },
      delete: {
        summary: "Delete a power usage record",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Power usage record deleted successfully." } },
      },
    },
    "/api/utilities/power-usage/summary": {
      get: {
        summary: "Get power usage summary",
        responses: { 200: { description: "Power usage summary returned successfully." } },
      },
    },
    "/api/utilities/water-usage": {
      get: {
        summary: "List water usage records",
        responses: { 200: { description: "Water usage records returned successfully." } },
      },
      post: {
        summary: "Create a water usage record",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WaterUsageRequest" },
            },
          },
        },
        responses: { 201: { description: "Water usage record created successfully." } },
      },
    },
    "/api/utilities/water-usage/{id}": {
      get: {
        summary: "Get a water usage record",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Water usage record returned successfully." } },
      },
      patch: {
        summary: "Update a water usage record",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WaterUsageRequest" },
            },
          },
        },
        responses: { 200: { description: "Water usage record updated successfully." } },
      },
      delete: {
        summary: "Delete a water usage record",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Water usage record deleted successfully." } },
      },
    },
    "/api/utilities/water-usage/summary": {
      get: {
        summary: "Get water usage summary",
        responses: { 200: { description: "Water usage summary returned successfully." } },
      },
    },
    "/api/utilities/alerts": {
      get: {
        summary: "List utility alerts",
        responses: { 200: { description: "Utility alerts returned successfully." } },
      },
      post: {
        summary: "Create a utility alert",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UtilityAlertRequest" },
            },
          },
        },
        responses: { 201: { description: "Utility alert created successfully." } },
      },
    },
    "/api/utilities/alerts/{id}": {
      get: {
        summary: "Get a utility alert",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Utility alert returned successfully." } },
      },
      patch: {
        summary: "Update a utility alert",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UtilityAlertRequest" },
            },
          },
        },
        responses: { 200: { description: "Utility alert updated successfully." } },
      },
      delete: {
        summary: "Delete a utility alert",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Utility alert deleted successfully." } },
      },
    },
    "/api/utilities/alerts/summary": {
      get: {
        summary: "Get utility alert summary",
        responses: { 200: { description: "Utility alert summary returned successfully." } },
      },
    },
    "/api/utilities/alerts/{id}/create-ticket": {
      post: {
        summary: "Create a fault ticket from a utility alert",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  dueDate: { type: "string", format: "date-time" },
                  reportedBy: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Fault ticket created from utility alert successfully." } },
      },
    },
    "/api/asset-documents": {
      get: {
        summary: "List asset documents",
        responses: { 200: { description: "Asset documents returned successfully." } },
      },
      post: {
        summary: "Create an asset document",
        responses: { 201: { description: "Asset document created successfully." } },
      },
    },
    "/api/asset-documents/{id}": {
      get: {
        summary: "Get an asset document",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Asset document returned successfully." } },
      },
      patch: {
        summary: "Update an asset document",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Asset document updated successfully." } },
      },
      delete: {
        summary: "Delete an asset document",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Asset document deleted successfully." } },
      },
    },
    "/api/compliance-certificates": {
      get: {
        summary: "List compliance certificates",
        responses: { 200: { description: "Compliance certificates returned successfully." } },
      },
      post: {
        summary: "Create a compliance certificate",
        responses: { 201: { description: "Compliance certificate created successfully." } },
      },
    },
    "/api/compliance-certificates/{id}": {
      get: {
        summary: "Get a compliance certificate",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Compliance certificate returned successfully." } },
      },
      patch: {
        summary: "Update a compliance certificate",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Compliance certificate updated successfully." } },
      },
      delete: {
        summary: "Delete a compliance certificate",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Compliance certificate deleted successfully." } },
      },
    },
    "/api/vehicle-documents": {
      get: {
        summary: "List vehicle documents",
        responses: { 200: { description: "Vehicle documents returned successfully." } },
      },
      post: {
        summary: "Create a vehicle document",
        responses: { 201: { description: "Vehicle document created successfully." } },
      },
    },
    "/api/vehicle-documents/{id}": {
      get: {
        summary: "Get a vehicle document",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Vehicle document returned successfully." } },
      },
      patch: {
        summary: "Update a vehicle document",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Vehicle document updated successfully." } },
      },
      delete: {
        summary: "Delete a vehicle document",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Vehicle document deleted successfully." } },
      },
    },
  },
};

const addCrudPaths = (basePath, singularLabel, requestSchemaRef) => ({
  [basePath]: {
    get: {
      summary: `List ${singularLabel}`,
      responses: { 200: { description: `${singularLabel} returned successfully.` } },
    },
    post: {
      summary: `Create ${singularLabel}`,
      requestBody: requestSchemaRef
        ? {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: requestSchemaRef },
              },
            },
          }
        : undefined,
      responses: { 201: { description: `${singularLabel} created successfully.` } },
    },
  },
  [`${basePath}/{id}`]: {
    get: {
      summary: `Get ${singularLabel}`,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: `${singularLabel} returned successfully.` } },
    },
    patch: {
      summary: `Update ${singularLabel}`,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: requestSchemaRef
        ? {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: requestSchemaRef },
              },
            },
          }
        : undefined,
      responses: { 200: { description: `${singularLabel} updated successfully.` } },
    },
    delete: {
      summary: `Delete ${singularLabel}`,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: `${singularLabel} deleted successfully.` } },
    },
  },
});

const mapMongooseTypeToOpenApi = (schemaType) => {
  if (!schemaType) {
    return { type: "object" };
  }

  if (schemaType.instance === "Array") {
    const items = schemaType.caster
      ? mapMongooseTypeToOpenApi(schemaType.caster)
      : { type: "object" };

    return { type: "array", items };
  }

  if (schemaType.instance === "ObjectID") {
    return { type: "string", description: "MongoDB ObjectId" };
  }

  if (schemaType.instance === "String") {
    const result = { type: "string" };
    if (Array.isArray(schemaType.enumValues) && schemaType.enumValues.length) {
      result.enum = schemaType.enumValues;
    }
    return result;
  }

  if (schemaType.instance === "Number") {
    return { type: "number" };
  }

  if (schemaType.instance === "Boolean") {
    return { type: "boolean" };
  }

  if (schemaType.instance === "Date") {
    return { type: "string", format: "date-time" };
  }

  if (schemaType.instance === "Map" || schemaType.instance === "Mixed") {
    return { type: "object", additionalProperties: true };
  }

  if (schemaType.schema) {
    return mapSchemaToOpenApi(schemaType.schema);
  }

  return { type: "object" };
};

const mapSchemaToOpenApi = (schema) => {
  const properties = {
    id: { type: "string", description: "MongoDB document id" },
  };
  const required = [];

  schema.eachPath((fieldName, schemaType) => {
    if (["__v", "_id"].includes(fieldName)) {
      return;
    }

    properties[fieldName] = mapMongooseTypeToOpenApi(schemaType);

    if (schemaType.options?.ref) {
      properties[fieldName].description = `${
        properties[fieldName].description ? `${properties[fieldName].description}. ` : ""
      }References ${schemaType.options.ref}.`;
    }

    if (schemaType.options?.default !== undefined && schemaType.options.default !== null) {
      const defaultValue =
        typeof schemaType.options.default === "function"
          ? undefined
          : schemaType.options.default;
      if (defaultValue !== undefined) {
        properties[fieldName].default = defaultValue;
      }
    }

    if (schemaType.isRequired || schemaType.options?.required === true) {
      required.push(fieldName);
    }
  });

  const openApiSchema = {
    type: "object",
    properties,
  };

  if (required.length) {
    openApiSchema.required = required;
  }

  return openApiSchema;
};

const loadModelSchemas = () => {
  const modelsDir = path.join(__dirname, "..", "models");
  const schemaEntries = [];

  for (const fileName of fs.readdirSync(modelsDir)) {
    if (!fileName.endsWith(".model.js")) {
      continue;
    }

    const model = require(path.join(modelsDir, fileName));
    if (!model?.modelName || !model?.schema) {
      continue;
    }

    schemaEntries.push([
      model.modelName,
      {
        ...mapSchemaToOpenApi(model.schema),
        description: `${model.modelName} model representation from the backend schema.`,
      },
    ]);
  }

  return Object.fromEntries(schemaEntries.sort(([a], [b]) => a.localeCompare(b)));
};

Object.assign(openApiDocument.components.schemas, loadModelSchemas());

Object.assign(openApiDocument.paths, {
  "/api/roles": {
    get: {
      summary: "List roles",
      responses: { 200: { description: "Roles returned successfully." } },
    },
  },
  "/api/lookups/vehicles": { get: { summary: "List vehicle lookups", responses: { 200: { description: "Vehicle lookup returned successfully." } } } },
  "/api/lookups/assets": { get: { summary: "List asset lookups", responses: { 200: { description: "Asset lookup returned successfully." } } } },
  "/api/lookups/users": { get: { summary: "List user lookups", responses: { 200: { description: "User lookup returned successfully." } } } },
  "/api/lookups/regulations": { get: { summary: "List regulation lookups", responses: { 200: { description: "Regulation lookup returned successfully." } } } },
  "/api/lookups/facilities": { get: { summary: "List facility lookups", responses: { 200: { description: "Facility lookup returned successfully." } } } },
  ...addCrudPaths("/api/fleet/vehicles", "fleet vehicle", "#/components/schemas/Vehicle"),
  ...addCrudPaths("/api/fleet/trips", "fleet trip", "#/components/schemas/Trip"),
  ...addCrudPaths("/api/fleet/fuel-records", "fuel record", "#/components/schemas/FuelRecord"),
  ...addCrudPaths("/api/assets", "asset", "#/components/schemas/Asset"),
  ...addCrudPaths("/api/inventory", "inventory item", "#/components/schemas/InventoryItem"),
  ...addCrudPaths("/api/procurement/requests", "procurement request", "#/components/schemas/ProcurementRequest"),
  ...addCrudPaths("/api/procurement/suppliers", "supplier", "#/components/schemas/Supplier"),
  ...addCrudPaths("/api/projects", "project", "#/components/schemas/Project"),
  ...addCrudPaths("/api/projects/tasks", "project task", "#/components/schemas/ProjectTask"),
  ...addCrudPaths("/api/facilities", "facility", "#/components/schemas/Facility"),
  ...addCrudPaths("/api/facilities/health-records", "facility health record", "#/components/schemas/FacilityHealthRecord"),
  ...addCrudPaths("/api/facilities/conditions", "facility condition", "#/components/schemas/FacilityAssetCondition"),
  ...addCrudPaths("/api/compliance/records", "compliance record", "#/components/schemas/ComplianceRecord"),
  ...addCrudPaths("/api/compliance/certificates", "compliance certificate", "#/components/schemas/ComplianceCertificate"),
  ...addCrudPaths("/api/shifts", "shift schedule", "#/components/schemas/ShiftSchedule"),
  ...addCrudPaths("/api/bookings", "booking", "#/components/schemas/Booking"),
  ...addCrudPaths("/api/bookings/approvals", "booking approval", "#/components/schemas/BookingApproval"),
  ...addCrudPaths("/api/billing/bills", "bill", "#/components/schemas/Bill"),
  ...addCrudPaths("/api/billing/payments", "payment", "#/components/schemas/Payment"),
  ...addCrudPaths("/api/approvals", "approval request", "#/components/schemas/ApprovalRequest"),
  ...addCrudPaths("/api/notifications", "notification", "#/components/schemas/Notification"),
  "/api/dashboards/overview": { get: { summary: "Get dashboard overview", responses: { 200: { description: "Dashboard overview returned successfully." } } } },
  "/api/dashboards/fleet": { get: { summary: "Get fleet dashboard", responses: { 200: { description: "Fleet dashboard returned successfully." } } } },
  "/api/dashboards/facilities": { get: { summary: "Get facilities dashboard", responses: { 200: { description: "Facilities dashboard returned successfully." } } } },
  "/api/gateway/routes": { get: { summary: "Get gateway route list", responses: { 200: { description: "Gateway routes returned successfully." } } } },
  "/api/graphql": {
    post: {
      summary: "Unified query endpoint",
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                resources: { type: "object" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Unified query completed successfully." } },
    },
  },
  "/api/reports/fault-tickets": { get: { summary: "Get fault ticket report", responses: { 200: { description: "Fault ticket report returned successfully." } } } },
  "/api/reports/maintenance": { get: { summary: "Get maintenance report", responses: { 200: { description: "Maintenance report returned successfully." } } } },
  "/api/reports/fleet": { get: { summary: "Get fleet report", responses: { 200: { description: "Fleet report returned successfully." } } } },
  "/api/reports/utilities": { get: { summary: "Get utilities report", responses: { 200: { description: "Utilities report returned successfully." } } } },
  "/api/fault-ticketing/faults": {
    post: {
      summary: "Create a fault in the legacy fault-ticketing module",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/FaultTicket" },
          },
        },
      },
      responses: { 201: { description: "Legacy fault created successfully." } },
    },
  },
  "/api/fault-ticketing/tickets": {
    get: {
      summary: "List tickets in the legacy fault-ticketing module",
      responses: { 200: { description: "Legacy tickets returned successfully." } },
    },
  },
  "/api/fault-ticketing/tickets/{id}": {
    get: {
      summary: "Get a ticket in the legacy fault-ticketing module",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Legacy ticket returned successfully." } },
    },
    put: {
      summary: "Update a ticket in the legacy fault-ticketing module",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/FaultTicket" },
          },
        },
      },
      responses: { 200: { description: "Legacy ticket updated successfully." } },
    },
    delete: {
      summary: "Delete a ticket in the legacy fault-ticketing module",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Legacy ticket deleted successfully." } },
    },
  },
  "/api/fault-ticketing/comments": {
    post: {
      summary: "Create a comment in the legacy fault-ticketing module",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/TicketComment" },
          },
        },
      },
      responses: { 201: { description: "Legacy comment created successfully." } },
    },
  },
  "/api/fleet-management/vehicles": {
    get: { summary: "List vehicles in the legacy fleet-management module", responses: { 200: { description: "Vehicles returned successfully." } } },
    post: {
      summary: "Create a vehicle in the legacy fleet-management module",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Vehicle" } } } },
      responses: { 201: { description: "Vehicle created successfully." } },
    },
  },
  "/api/fleet-management/vehicles/{id}": {
    get: { summary: "Get a vehicle in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Vehicle returned successfully." } } },
    patch: {
      summary: "Update a vehicle in the legacy fleet-management module",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Vehicle" } } } },
      responses: { 200: { description: "Vehicle updated successfully." } },
    },
    delete: { summary: "Delete a vehicle in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Vehicle deleted successfully." } } },
  },
  "/api/fleet-management/vehicles/{id}/receive": {
    patch: {
      summary: "Mark a vehicle as received in the legacy fleet-management module",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Vehicle received successfully." } },
    },
  },
  "/api/fleet-management/drivers": {
    get: { summary: "List drivers in the legacy fleet-management module", responses: { 200: { description: "Drivers returned successfully." } } },
    post: {
      summary: "Create a driver in the legacy fleet-management module",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Driver" } } } },
      responses: { 201: { description: "Driver created successfully." } },
    },
  },
  "/api/fleet-management/drivers/{id}": {
    get: { summary: "Get a driver in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Driver returned successfully." } } },
    patch: {
      summary: "Update a driver in the legacy fleet-management module",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Driver" } } } },
      responses: { 200: { description: "Driver updated successfully." } },
    },
  },
  "/api/fleet-management/drivers/{id}/assign-vehicle": {
    post: {
      summary: "Assign a vehicle to a driver in the legacy fleet-management module",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Vehicle assigned successfully." } },
    },
  },
  "/api/fleet-management/drivers/{id}/assign-duty": {
    post: {
      summary: "Assign a duty to a driver in the legacy fleet-management module",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Duty assigned successfully." } },
    },
  },
  "/api/fleet-management/drivers/{id}/unassign-vehicle": {
    delete: {
      summary: "Unassign a vehicle from a driver in the legacy fleet-management module",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Vehicle unassigned successfully." } },
    },
  },
  "/api/fleet-management/trips": {
    get: { summary: "List trips in the legacy fleet-management module", responses: { 200: { description: "Trips returned successfully." } } },
  },
  "/api/fleet-management/trips/request": {
    post: {
      summary: "Request a trip in the legacy fleet-management module",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Trip" } } } },
      responses: { 201: { description: "Trip requested successfully." } },
    },
  },
  "/api/fleet-management/trips/{id}/approve": {
    patch: { summary: "Approve a trip in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Trip approved successfully." } } },
  },
  "/api/fleet-management/trips/{id}/reject": {
    patch: { summary: "Reject a trip in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Trip rejected successfully." } } },
  },
  "/api/fleet-management/trips/{id}/start": {
    patch: { summary: "Start a trip in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Trip started successfully." } } },
  },
  "/api/fleet-management/trips/{id}/end": {
    patch: { summary: "End a trip in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Trip ended successfully." } } },
  },
  "/api/fleet-management/fuel": {
    get: { summary: "List fuel records in the legacy fleet-management module", responses: { 200: { description: "Fuel records returned successfully." } } },
    post: {
      summary: "Create a fuel record in the legacy fleet-management module",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FuelRecord" } } } },
      responses: { 201: { description: "Fuel record created successfully." } },
    },
  },
  "/api/fleet-management/fuel/{id}/status": {
    patch: { summary: "Update fuel record status in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Fuel record status updated successfully." } } },
  },
  "/api/fleet-management/maintenance": {
    get: { summary: "List maintenance items in the legacy fleet-management module", responses: { 200: { description: "Maintenance items returned successfully." } } },
    post: {
      summary: "Create maintenance in the legacy fleet-management module",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/VehicleMaintenance" } } } },
      responses: { 201: { description: "Maintenance created successfully." } },
    },
  },
  "/api/fleet-management/maintenance/{id}/start": {
    patch: { summary: "Start maintenance in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Maintenance started successfully." } } },
  },
  "/api/fleet-management/maintenance/{id}/complete": {
    patch: { summary: "Complete maintenance in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Maintenance completed successfully." } } },
  },
  "/api/fleet-management/maintenance/{id}/parts": {
    post: { summary: "Add maintenance parts in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 201: { description: "Maintenance parts added successfully." } } },
  },
  "/api/fleet-management/incidents": {
    get: { summary: "List incidents in the legacy fleet-management module", responses: { 200: { description: "Incidents returned successfully." } } },
    post: {
      summary: "Create an incident in the legacy fleet-management module",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Incident" } } } },
      responses: { 201: { description: "Incident created successfully." } },
    },
  },
  "/api/fleet-management/incidents/{id}/status": {
    patch: { summary: "Update incident status in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Incident status updated successfully." } } },
  },
  "/api/fleet-management/inventory": {
    get: { summary: "List inventory items in the legacy fleet-management module", responses: { 200: { description: "Inventory items returned successfully." } } },
    post: {
      summary: "Create an inventory item in the legacy fleet-management module",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/InventoryItem" } } } },
      responses: { 201: { description: "Inventory item created successfully." } },
    },
  },
  "/api/fleet-management/inventory/{id}/restock": {
    patch: { summary: "Restock an inventory item in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Inventory item restocked successfully." } } },
  },
  "/api/fleet-management/inventory/{id}/deduct": {
    patch: { summary: "Deduct stock from an inventory item in the legacy fleet-management module", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Inventory item updated successfully." } } },
  },
  "/api/fleet-management/audit-logs": {
    get: { summary: "List audit logs in the legacy fleet-management module", responses: { 200: { description: "Audit logs returned successfully." } } },
  },
  "/api/fleet-management/settings": {
    get: { summary: "Get settings in the legacy fleet-management module", responses: { 200: { description: "Settings returned successfully." } } },
    patch: { summary: "Update settings in the legacy fleet-management module", responses: { 200: { description: "Settings updated successfully." } } },
  },
});

module.exports = openApiDocument;
