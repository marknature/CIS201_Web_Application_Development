/**
 * Smoke test runner for local dev.
 *
 * Prereqs:
 * - API running on localhost (or set BASE_URL)
 * - MongoDB configured or let the backend use in-memory MongoDB
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const { DEFAULT_SERVICE_ACCOUNTS } = require("../src/utils/serviceAccounts");

async function req(path, { method = "GET", token, json, formData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;

  if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  if (formData) {
    body = formData;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method, headers, body });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      status: 0,
      body: {
        error: message,
        hint: `Could not reach backend at ${BASE_URL}. Is the API running and configured (PORT, MONGODB_URI, JWT_SECRET)?`,
      },
    };
  }

  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text };
  }
  return { status: res.status, body: parsed };
}

async function main() {
  console.log("== Health ==");
  const health = await req("/health");
  console.log(health);
  if (health.status === 0) {
    console.error("Smoke test aborted: backend is unreachable.");
    process.exit(1);
  }

  const rand = Math.floor(Math.random() * 1e9);
  const userEmail = `user${rand}@test.local`;
  const techEmail = process.env.TECH_EMAIL || DEFAULT_SERVICE_ACCOUNTS.technician.email;
  const techPassword = process.env.TECH_PASSWORD || DEFAULT_SERVICE_ACCOUNTS.technician.password;
  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_SERVICE_ACCOUNTS.admin.email;
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_SERVICE_ACCOUNTS.admin.password;
  const demoEmail = process.env.DEMO_USER_EMAIL || DEFAULT_SERVICE_ACCOUNTS.user.email;
  const demoPassword = process.env.DEMO_USER_PASSWORD || DEFAULT_SERVICE_ACCOUNTS.user.password;

  console.log("== Register user ==");
  console.log(await req("/api/auth/register", { method: "POST", json: { name: "User", email: userEmail, password: "password123", role: "user" } }));

  console.log("== Login accounts ==");
  const userLogin = await req("/api/auth/login", { method: "POST", json: { email: userEmail, password: "password123" } });
  const demoLogin = await req("/api/auth/login", { method: "POST", json: { email: demoEmail, password: demoPassword } });
  const techLogin = await req("/api/auth/login", { method: "POST", json: { email: techEmail, password: techPassword } });
  const adminLogin = await req("/api/auth/login", { method: "POST", json: { email: adminEmail, password: adminPassword } });
  console.log({ user: userLogin.status, demo: demoLogin.status, tech: techLogin.status, admin: adminLogin.status });

  const userToken = userLogin.body?.data?.token;
  const demoToken = demoLogin.body?.data?.token;
  const techToken = techLogin.body?.data?.token;
  const adminToken = adminLogin.body?.data?.token;

  console.log("== /me ==");
  console.log(await req("/api/auth/me", { token: userToken }));

  console.log("== Demo user seeded tickets ==");
  const demoTickets = await req("/api/tickets/my", { token: demoToken });
  console.log(demoTickets);
  if (!Array.isArray(demoTickets.body?.data?.items) || demoTickets.body.data.items.length === 0) {
    throw new Error("Demo user has no seeded tickets.");
  }

  console.log("== Assets proxy/mock ==");
  console.log(await req("/api/assets", { token: userToken }));

  console.log("== Create fault as user ==");
  const faultPayload = new FormData();
  faultPayload.set("title", "Broken device");
  faultPayload.set("description", "The asset is not powering on.");
  faultPayload.set("asset_id", "1");
  faultPayload.set("category", "Electrical");
  faultPayload.set("location", "Admin Block");
  const create = await req("/api/faults", {
    method: "POST",
    token: userToken,
    formData: faultPayload
  });
  console.log(create);
  const ticketId = create.body?.data?.ticket?.id;

  console.log("== User blocked from listing all tickets (GET /api/tickets) ==");
  console.log(await req("/api/tickets", { token: userToken }));

  console.log("== User list own tickets ==");
  console.log(await req("/api/tickets/my", { token: userToken }));

  console.log("== Ticket detail ==");
  console.log(await req(`/api/tickets/${ticketId}`, { token: userToken }));

  console.log("== User blocked from technician/admin routes ==");
  console.log(await req(`/api/tickets/${ticketId}/assign`, { method: "PUT", token: userToken, json: { technician_id: "invalid" } }));
  console.log(await req(`/api/tickets/${ticketId}/status`, { method: "PUT", token: userToken, json: { status: "In Progress" } }));
  console.log(await req(`/api/tickets/${ticketId}/comments`, { method: "POST", token: userToken, json: { body: "Requesting urgent intervention." } }));
  console.log(await req("/api/analytics", { token: userToken }));
  console.log(await req("/api/users", { token: userToken }));
  console.log(await req("/api/reports", { token: userToken }));

  if (techToken) {
    console.log("== Technician list tickets (should include all) ==");
    console.log(await req("/api/tickets", { token: techToken }));

    console.log("== Assignable users ==");
    const assignableUsers = await req("/api/auth/assignable-users", { token: techToken });
    console.log(assignableUsers);
    const technicianId = assignableUsers.body?.data?.find?.((entry) => entry.role === "technician")?.id
      || assignableUsers.body?.data?.[0]?.id;

    console.log("== Assign ticket as technician ==");
    console.log(await req(`/api/tickets/${ticketId}/assign`, { method: "PUT", token: techToken, json: { technician_id: technicianId } }));

    console.log("== Status transitions ==");
    console.log(await req(`/api/tickets/${ticketId}/status`, { method: "PUT", token: techToken, json: { status: "In Progress" } }));
    console.log(await req(`/api/tickets/${ticketId}/status`, { method: "PUT", token: techToken, json: { status: "Resolved", resolution_notes: "Replaced faulty power supply." } }));
    console.log(await req(`/api/tickets/${ticketId}/status`, { method: "PUT", token: techToken, json: { status: "Closed" } }));
  }

  console.log("== Notifications (user) ==");
  console.log(await req("/api/notifications", { token: userToken }));

  console.log("== Analytics (user-visible summary) ==");
  console.log(await req("/api/analytics", { token: userToken }));

  if (adminToken) {
    console.log("== Analytics (admin) ==");
    console.log(await req("/api/analytics", { token: adminToken }));
  }

  console.log("Smoke test complete.");
}

main().catch((e) => {
  console.error("Smoke test failed:", e);
  process.exit(1);
});
