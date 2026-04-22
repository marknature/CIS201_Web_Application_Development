const {
  API_VERSION,
  APP_NAME,
  PUBLIC_SERVICE_URL,
  FRONTEND_URL,
  ASSET_API,
  PROCUREMENT_API
} = require("../config/config");

const responseEnvelopeSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
    data: {},
    errors: {},
    meta: {
      type: "object",
      properties: {
        requestId: { type: ["string", "null"] },
        timestamp: { type: "string", format: "date-time" },
        service: { type: "string" },
        version: { type: "string" }
      }
    }
  },
  required: ["success", "message", "meta"]
};

const bearerSecurityScheme = {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT"
};

const pathIdParameter = {
  in: "path",
  name: "id",
  required: true,
  schema: { type: "string" }
};

const buildOpenApiSpec = () => ({
  openapi: "3.1.0",
  info: {
    title: `${APP_NAME} API`,
    version: API_VERSION,
    summary: "Fault reporting and ticketing service API",
    description:
      "Integration surface for the FFIMS Fault Reporting & Ticketing module. Use JWT authentication to access protected resources."
  },
  servers: [
    {
      url: PUBLIC_SERVICE_URL,
      description: "Configured service base URL"
    }
  ],
  tags: [
    { name: "Service Discovery" },
    { name: "Authentication" },
    { name: "Faults" },
    { name: "Tickets" },
    { name: "Assets" },
    { name: "Notifications" },
    { name: "Analytics" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Service Discovery"],
        summary: "Liveness probe",
        responses: {
          200: {
            description: "Service is alive",
            content: {
              "application/json": {
                schema: responseEnvelopeSchema
              }
            }
          }
        }
      }
    },
    "/ready": {
      get: {
        tags: ["Service Discovery"],
        summary: "Readiness probe with dependency states",
        responses: {
          200: { description: "Ready for integrations" },
          503: { description: "A required dependency is unavailable" }
        }
      }
    },
    "/api/integration/capabilities": {
      get: {
        tags: ["Service Discovery"],
        summary: "Return a machine-readable capability manifest",
        responses: {
          200: { description: "Service capabilities" }
        }
      }
    },
    "/api/integration/openapi.json": {
      get: {
        tags: ["Service Discovery"],
        summary: "Return the OpenAPI specification",
        responses: {
          200: { description: "OpenAPI document" }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a public user account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "role"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  role: { type: "string", enum: ["user"] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "User created" },
          409: { description: "Email already exists" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Obtain a JWT access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Token issued" },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Return the current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current user returned" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/auth/assignable-users": {
      get: {
        tags: ["Authentication"],
        summary: "List technician and admin assignees",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Assignable users returned" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/faults": {
      post: {
        tags: ["Faults"],
        summary: "Create a fault report and linked ticket",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "description", "asset_id", "priority"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  asset_id: { type: "string" },
                  category: { type: "string" },
                  location: { type: "string" },
                  priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Fault and ticket created" },
          400: { description: "Validation failed" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/tickets": {
      get: {
        tags: ["Tickets"],
        summary: "List tickets visible to the current user role scope",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Tickets returned" },
          401: { description: "Unauthorized" }
        }
      },
      post: {
        tags: ["Tickets"],
        summary: "Disabled direct ticket creation endpoint",
        security: [{ bearerAuth: [] }],
        responses: {
          405: { description: "Use POST /api/faults instead" }
        }
      }
    },
    "/api/tickets/my": {
      get: {
        tags: ["Tickets"],
        summary: "List only tickets created by the current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current user's tickets returned" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/tickets/{id}": {
      get: {
        tags: ["Tickets"],
        summary: "Fetch one ticket, linked fault, comments, and workflow logs",
        security: [{ bearerAuth: [] }],
        parameters: [pathIdParameter],
        responses: {
          200: { description: "Ticket returned" },
          403: { description: "Forbidden" },
          404: { description: "Ticket not found" }
        }
      },
      put: {
        tags: ["Tickets"],
        summary: "Update ticket fields allowed for the current operational role",
        security: [{ bearerAuth: [] }],
        parameters: [pathIdParameter],
        responses: {
          200: { description: "Ticket updated" },
          403: { description: "Forbidden" }
        }
      },
      delete: {
        tags: ["Tickets"],
        summary: "Delete a ticket and linked fault/comment records (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [pathIdParameter],
        responses: {
          200: { description: "Ticket deleted" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/tickets/{id}/assign": {
      put: {
        tags: ["Tickets"],
        summary: "Assign a ticket to a technician or admin",
        security: [{ bearerAuth: [] }],
        parameters: [pathIdParameter],
        responses: {
          200: { description: "Ticket assigned" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/tickets/{id}/status": {
      put: {
        tags: ["Tickets"],
        summary: "Advance a ticket through the workflow",
        security: [{ bearerAuth: [] }],
        parameters: [pathIdParameter],
        responses: {
          200: { description: "Status updated" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/tickets/{id}/comments": {
      post: {
        tags: ["Tickets"],
        summary: "Add a ticket comment (technician/admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [pathIdParameter],
        responses: {
          201: { description: "Comment created" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/assets": {
      get: {
        tags: ["Assets"],
        summary: "Fetch assets from the configured asset provider or fallback data",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Assets returned" }
        }
      }
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List notifications for the current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Notifications returned" }
        }
      }
    },
    "/api/notifications/{id}/read": {
      put: {
        tags: ["Notifications"],
        summary: "Mark a notification as read",
        security: [{ bearerAuth: [] }],
        parameters: [pathIdParameter],
        responses: {
          200: { description: "Notification marked as read" }
        }
      }
    },
    "/api/analytics": {
      get: {
        tags: ["Analytics"],
        summary: "Fetch ticket summary analytics (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Analytics returned" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/reports": {
      get: {
        tags: ["Analytics"],
        summary: "Fetch admin reports combining ticket analytics and user role counts",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Reports returned" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" }
        }
      }
    },
    "/api/users": {
      get: {
        tags: ["Authentication"],
        summary: "List users for admin management",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Users returned" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: bearerSecurityScheme
    },
    schemas: {
      ResponseEnvelope: responseEnvelopeSchema
    }
  },
  "x-service-discovery": {
    frontendUrl: FRONTEND_URL || null,
    dependencies: {
      assetRegister: ASSET_API,
      procurement: PROCUREMENT_API || null
    }
  }
});

module.exports = { buildOpenApiSpec };
