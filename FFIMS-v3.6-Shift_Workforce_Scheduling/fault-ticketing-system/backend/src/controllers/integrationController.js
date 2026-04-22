const {
  API_VERSION,
  APP_NAME,
  PUBLIC_SERVICE_URL,
  FRONTEND_URL,
  ASSET_API,
  PROCUREMENT_API
} = require("../config/config");
const { ok } = require("../utils/apiResponse");
const { buildOpenApiSpec } = require("../integration/openApiSpec");

const buildUrl = (path) => `${PUBLIC_SERVICE_URL.replace(/\/$/, "")}${path}`;

const getCapabilities = (req, res) => {
  return ok(res, "Integration capabilities fetched", {
    service: {
      name: APP_NAME,
      version: API_VERSION,
      protocol: "REST",
      baseUrl: PUBLIC_SERVICE_URL,
      storage: "mongodb",
      frontendUrl: FRONTEND_URL || null
    },
    authentication: {
      type: "bearer-jwt",
      login: "/api/auth/login",
      register: "/api/auth/register",
      me: "/api/auth/me"
    },
    discovery: {
      health: buildUrl("/health"),
      readiness: buildUrl("/ready"),
      capabilities: buildUrl("/api/integration/capabilities"),
      openApi: buildUrl("/api/integration/openapi.json")
    },
    dependencies: {
      assetRegister: {
        type: "http",
        configured: Boolean(ASSET_API),
        url: ASSET_API || null
      },
      procurement: {
        type: "http",
        configured: Boolean(PROCUREMENT_API),
        url: PROCUREMENT_API || null
      }
    },
    capabilities: [
      {
        name: "ticket-management",
        endpoints: [
          "GET /api/tickets",
          "GET /api/tickets/my",
          "POST /api/tickets",
          "GET /api/tickets/:id",
          "PUT /api/tickets/:id",
          "DELETE /api/tickets/:id"
        ]
      },
      {
        name: "workflow",
        endpoints: [
          "PUT /api/tickets/:id/assign",
          "PUT /api/tickets/:id/status"
        ]
      },
      {
        name: "supporting-data",
        endpoints: [
          "GET /api/assets",
          "GET /api/notifications",
          "PUT /api/notifications/:id/read",
          "GET /api/analytics",
          "GET /api/reports",
          "GET /api/users"
        ]
      }
    ],
    conventions: {
      responseEnvelope: "success/message/data/errors/meta",
      requestIdHeader: "X-Request-Id",
      serviceHeaders: ["X-Service-Name", "X-Service-Version"]
    }
  });
};

const getOpenApiDocument = (req, res) => {
  return res.json(buildOpenApiSpec());
};

module.exports = {
  getCapabilities,
  getOpenApiDocument
};
