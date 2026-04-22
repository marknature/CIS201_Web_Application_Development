const test = require("node:test");
const assert = require("node:assert/strict");
const {
  ROLE,
  authorizeRoles,
  buildOwnTicketFilter,
  buildVisibleTicketFilter,
  canAccessAnalytics,
  canCommentOnTicket,
  canDeleteTicket,
  canManageTicket,
  canViewTicket,
  canSetTicketPriority,
  canViewTicketList,
  getAllowedPriorities,
  getAllowedStatusTransitions,
  getEditableTicketFields,
  getCreatableTicketFields
} = require("../src/security/rbac");

const createResponse = () => {
  const response = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };

  return response;
};

test("authorizeRoles blocks a user from technician routes", () => {
  const req = { user: { id: "user-1", role: ROLE.USER } };
  const res = createResponse();
  let nextCalled = false;

  authorizeRoles(ROLE.TECHNICIAN, ROLE.ADMIN)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.payload, {
    message: "Access denied"
  });
});

test("authorizeRoles rejects requests without an authenticated user", () => {
  const res = createResponse();
  let nextCalled = false;

  authorizeRoles(ROLE.TECHNICIAN, ROLE.ADMIN)({}, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.payload, { message: "Unauthorized" });
});

test("GET /api/tickets style access: operational roles only (middleware contract)", () => {
  const reqUser = { user: { id: "user-1", role: ROLE.USER } };
  const resUser = createResponse();
  let nextUser = false;
  authorizeRoles(ROLE.TECHNICIAN, ROLE.ADMIN)(reqUser, resUser, () => {
    nextUser = true;
  });
  assert.equal(nextUser, false);
  assert.equal(resUser.statusCode, 403);

  const reqTech = { user: { id: "tech-1", role: ROLE.TECHNICIAN } };
  const resTech = createResponse();
  let nextTech = false;
  authorizeRoles(ROLE.TECHNICIAN, ROLE.ADMIN)(reqTech, resTech, () => {
    nextTech = true;
  });
  assert.equal(nextTech, true);
});

test("authorizeRoles allows a technician into operational routes", () => {
  const req = { user: { id: "tech-1", role: ROLE.TECHNICIAN } };
  const res = createResponse();
  let nextCalled = false;

  authorizeRoles(ROLE.TECHNICIAN, ROLE.ADMIN)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.payload, null);
});

test("buildVisibleTicketFilter scopes users to their own tickets", () => {
  const filters = buildVisibleTicketFilter(
    { id: "user-7", role: ROLE.USER },
    { page: 2, created_by: "another-user", status: "Open" }
  );

  assert.deepEqual(filters, {
    page: 2,
    status: "Open",
    created_by: "user-7"
  });
});

test("buildVisibleTicketFilter keeps technician access global", () => {
  const filters = buildVisibleTicketFilter(
    { id: "tech-2", role: ROLE.TECHNICIAN },
    { page: 1, status: "Open" }
  );

  assert.deepEqual(filters, {
    page: 1,
    status: "Open"
  });
});

test("buildOwnTicketFilter always returns the current user's ticket scope", () => {
  const filters = buildOwnTicketFilter(
    { id: "user-9", role: ROLE.USER },
    { page: 3, created_by: "forged-user" }
  );

  assert.deepEqual(filters, {
    page: 3,
    created_by: "user-9"
  });
});

test("users cannot view other users' tickets", () => {
  assert.equal(
    canViewTicket(
      { id: "user-a", role: ROLE.USER },
      { id: "ticket-1", created_by: "user-b" }
    ),
    false
  );
});

test("users can view only their own tickets while technicians can view all", () => {
  assert.equal(
    canViewTicket(
      { id: "user-a", role: ROLE.USER },
      { id: "ticket-1", created_by: "user-a" }
    ),
    true
  );

  assert.equal(
    canViewTicket(
      { id: "tech-a", role: ROLE.TECHNICIAN },
      { id: "ticket-1", created_by: "user-b" }
    ),
    true
  );
});

test("role abilities stay strictly separated", () => {
  assert.equal(canManageTicket({ role: ROLE.USER }), false);
  assert.equal(canCommentOnTicket({ role: ROLE.USER }), false);
  assert.equal(canDeleteTicket({ role: ROLE.USER }), false);
  assert.equal(canAccessAnalytics({ role: ROLE.USER }), false);

  assert.equal(canManageTicket({ role: ROLE.TECHNICIAN }), true);
  assert.equal(canCommentOnTicket({ role: ROLE.TECHNICIAN }), true);
  assert.equal(canDeleteTicket({ role: ROLE.TECHNICIAN }), false);
  assert.equal(canAccessAnalytics({ role: ROLE.TECHNICIAN }), false);

  assert.equal(canDeleteTicket({ role: ROLE.ADMIN }), true);
  assert.equal(canAccessAnalytics({ role: ROLE.ADMIN }), true);
});

test("editable ticket fields are role-specific", () => {
  assert.deepEqual(getEditableTicketFields(ROLE.USER), []);
  assert.deepEqual(getEditableTicketFields(ROLE.TECHNICIAN), ["resolution_notes"]);
  assert.deepEqual(getEditableTicketFields(ROLE.ADMIN), [
    "title",
    "description",
    "category",
    "location",
    "resolution_notes",
    "due_at",
    "maintenance_link"
  ]);
});

test("creatable ticket fields are strictly limited for users", () => {
  assert.deepEqual(getCreatableTicketFields(), [
    "title",
    "description",
    "asset_id",
    "category",
    "location"
  ]);
});

test("CRITICAL: Users CANNOT set priority under any circumstances", () => {
  assert.equal(canSetTicketPriority({ role: ROLE.USER }), false);
  assert.equal(canSetTicketPriority({ role: ROLE.TECHNICIAN }), true);
  assert.equal(canSetTicketPriority({ role: ROLE.ADMIN }), true);
});

test("priority options are strictly role-based", () => {
  assert.deepEqual(getAllowedPriorities(ROLE.USER), []);
  assert.deepEqual(getAllowedPriorities(ROLE.TECHNICIAN), ["Low", "Medium", "High", "Critical"]);
  assert.deepEqual(getAllowedPriorities(ROLE.ADMIN), ["Low", "Medium", "High", "Critical"]);
});

test("status transitions are role-controlled", () => {
  assert.deepEqual(getAllowedStatusTransitions(ROLE.USER), []);
  assert.deepEqual(getAllowedStatusTransitions(ROLE.TECHNICIAN), [
    "Open", "Assigned", "In Progress", "Resolved", "Closed"
  ]);
  assert.deepEqual(getAllowedStatusTransitions(ROLE.ADMIN), [
    "Open", "Assigned", "In Progress", "Resolved", "Closed", "Escalated"
  ]);
});

test("ticket list viewing permissions are strict", () => {
  assert.equal(canViewTicketList({ role: ROLE.USER }), true); // Can view own tickets
  assert.equal(canViewTicketList({ role: ROLE.TECHNICIAN }), true); // Can view all tickets
  assert.equal(canViewTicketList({ role: ROLE.ADMIN }), true); // Can view all tickets
});

test("ZERO TRUST: No role conflicts or privilege escalation", () => {
  // Users have NO management capabilities
  assert.equal(canManageTicket({ role: ROLE.USER }), false);
  assert.equal(canDeleteTicket({ role: ROLE.USER }), false);
  assert.equal(canAccessAnalytics({ role: ROLE.USER }), false);
  assert.equal(canCommentOnTicket({ role: ROLE.USER }), false);
  assert.equal(canSetTicketPriority({ role: ROLE.USER }), false);

  // Technicians have operational but NOT admin capabilities
  assert.equal(canManageTicket({ role: ROLE.TECHNICIAN }), true);
  assert.equal(canDeleteTicket({ role: ROLE.TECHNICIAN }), false);
  assert.equal(canAccessAnalytics({ role: ROLE.TECHNICIAN }), false);
  assert.equal(canCommentOnTicket({ role: ROLE.TECHNICIAN }), true);
  assert.equal(canSetTicketPriority({ role: ROLE.TECHNICIAN }), true);

  // Admins have full control
  assert.equal(canManageTicket({ role: ROLE.ADMIN }), true);
  assert.equal(canDeleteTicket({ role: ROLE.ADMIN }), true);
  assert.equal(canAccessAnalytics({ role: ROLE.ADMIN }), true);
  assert.equal(canCommentOnTicket({ role: ROLE.ADMIN }), true);
  assert.equal(canSetTicketPriority({ role: ROLE.ADMIN }), true);
});
