const STATUS = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  ESCALATED: "Escalated"
};

const MANUAL_STATUSES = [STATUS.OPEN, STATUS.ASSIGNED, STATUS.IN_PROGRESS, STATUS.RESOLVED, STATUS.CLOSED];
const ADMIN_OVERRIDE_STATUSES = [...MANUAL_STATUSES, STATUS.ESCALATED];

const ALLOWED_NEXT = {
  Open: ["Assigned"],
  Assigned: ["In Progress"],
  "In Progress": ["Resolved"],
  Resolved: ["Closed"],
  Closed: [],
  Escalated: []
};

const canTransition = (from, to) => {
  if (!from || !to) return false;
  const next = ALLOWED_NEXT[from] || [];
  return next.includes(to);
};

module.exports = {
  ADMIN_OVERRIDE_STATUSES,
  MANUAL_STATUSES,
  STATUS,
  canTransition
};
