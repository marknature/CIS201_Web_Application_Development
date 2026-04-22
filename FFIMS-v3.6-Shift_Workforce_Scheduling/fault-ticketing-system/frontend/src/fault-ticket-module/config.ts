export const CONFIG = {
  MODULE_NAME: "Fault & Ticketing",
  USER_ROLES: ["user", "technician", "admin"] as const,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",
  RUNTIME_MODE: import.meta.env.VITE_APP_MODE === "live" ? "live" : "mock",
  STORAGE_KEYS: {
    currentRole: "fault-ticketing-current-role",
    demoState: "fault-ticketing-demo-state-v1",
  },
  ENABLE_ASSET_LINK: true,
};
