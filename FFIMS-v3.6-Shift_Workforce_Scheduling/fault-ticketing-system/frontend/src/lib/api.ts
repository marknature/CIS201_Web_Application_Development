export type UserRole = "user" | "technician" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string | null;
}

export interface AssetRecord {
  id: string;
  name: string;
  category?: string;
  location?: string;
  maintenance_link?: string;
}

export interface FaultRecord {
  id: string;
  title: string;
  description: string;
  asset_id: string;
  asset_name: string;
  category: string;
  location: string;
  priority: string;
  status: string;
  reported_by: string;
  reporter_name?: string | null;
  ticket_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TicketRecord {
  id: string;
  title: string;
  description: string;
  fault_id: string;
  asset_id: string;
  asset_name: string;
  category: string;
  location: string;
  priority: string;
  status: string;
  created_by: string;
  assigned_to?: string | null;
  creator_name?: string | null;
  assignee_name?: string | null;
  due_at?: string | null;
  maintenance_link?: string;
  resolution_notes?: string;
  resolved_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  fault_id?: string | null;
  author_id: string;
  author_name?: string | null;
  body: string;
  created_at?: string | null;
}

export interface TicketLog {
  id: string;
  ticket_id: string;
  action: string;
  performed_by: string;
  performed_by_name?: string | null;
  timestamp?: string | null;
}

export interface TicketDetail extends TicketRecord {
  fault: FaultRecord | null;
  comments: TicketComment[];
  logs: TicketLog[];
}

export interface TicketListResponse {
  items: TicketRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AnalyticsResponse {
  byStatus: Array<{ status: string; total: number }>;
  byPriority: Array<{ priority: string; total: number }>;
  averageResolutionMinutes: number;
  summary?: {
    pendingTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    escalatedTickets: number;
  };
}

export interface NotificationRecord {
  id: string;
  user_id: string;
<<<<<<< HEAD
=======
  ticket_id?: string | null;
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  message: string;
  is_read: boolean;
  created_at?: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export class ApiError extends Error {
  status: number;
  errors: unknown;

  constructor(message: string, status: number, errors: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(
  path: string,
  { method = "GET", token, body, headers = {} }: { method?: string; token?: string; body?: BodyInit | object; headers?: Record<string, string> } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new ApiError(payload.message || "Request failed", response.status, payload.errors);
  }

  return payload.data as T;
}

const toQueryString = (params: Record<string, string | number | undefined | null>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
};

export const api = {
  addComment: (ticketId: string, body: { body: string }, token: string) =>
    request<TicketComment>(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      token,
      body,
    }),
  assignTicket: (ticketId: string, technician_id: string, token: string) =>
    request<TicketRecord>(`/api/tickets/${ticketId}/assign`, {
      method: "PUT",
      token,
      body: { technician_id },
    }),
  createFault: (payload: FormData, token: string) =>
    request<{ fault: FaultRecord; ticket: TicketRecord }>("/api/faults", {
      method: "POST",
      token,
      body: payload,
    }),
  deleteTicket: (ticketId: string, token: string) =>
    request<void>(`/api/tickets/${ticketId}`, {
      method: "DELETE",
      token,
    }),
  getAnalytics: (token: string) => request<AnalyticsResponse>("/api/analytics", { token }),
  getAssets: (token: string) => request<AssetRecord[]>("/api/assets", { token }),
  getAssignableUsers: (token: string) => request<AuthUser[]>("/api/auth/assignable-users", { token }),
  getMe: (token: string) => request<AuthUser>("/api/auth/me", { token }),
  getNotifications: (token: string) => request<NotificationRecord[]>("/api/notifications", { token }),
  getMyTickets: (params: Record<string, string | number | undefined | null>, token: string) =>
    request<TicketListResponse>(`/api/tickets/my${toQueryString(params)}`, { token }),
  getTicket: (ticketId: string, token: string) => request<TicketDetail>(`/api/tickets/${ticketId}`, { token }),
  getTickets: (params: Record<string, string | number | undefined | null>, token: string) =>
    request<TicketListResponse>(`/api/tickets${toQueryString(params)}`, { token }),
<<<<<<< HEAD
=======
  markNotificationAsRead: (notificationId: string, token: string) =>
    request<void>(`/api/notifications/${notificationId}/read`, { method: "PUT", token }),
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body,
    }),
  register: (body: { name: string; email: string; password: string; role?: string }) =>
    request<AuthUser>("/api/auth/register", {
      method: "POST",
      body,
    }),
  updateTicket: (ticketId: string, body: Partial<TicketRecord> & { status?: string; assigned_to?: string; resolution_notes?: string }, token: string) =>
    request<TicketRecord>(`/api/tickets/${ticketId}`, {
      method: "PUT",
      token,
      body,
    }),
  updateTicketStatus: (ticketId: string, body: { status: string; resolution_notes?: string }, token: string) =>
    request<TicketRecord>(`/api/tickets/${ticketId}/status`, {
      method: "PUT",
      token,
      body,
    }),
};
