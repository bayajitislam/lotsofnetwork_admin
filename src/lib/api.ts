export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
  last_login_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserProfile;
}

export interface AdminStats {
  total_users: number;
  admin_users: number;
  standard_users: number;
  active_api_keys: number;
  audit_logs_count: number;
  active_campaigns_count: number;
  status: string;
}

export interface Campaign {
  id: string;
  name: string;
  sponsor: string;
  target_url: string;
  slot: string;
  impressions: number;
  clicks: number;
  target_impressions: number;
  status: "active" | "paused" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ToolTelemetry {
  name: string;
  slug: string;
  category: string;
  status: string;
  latency_ms: number;
  queries_per_hour: number;
  uptime_percentage: number;
  error_rate: number;
}

export interface CrashLog {
  id: string;
  timestamp: string;
  tool: string;
  severity: "error" | "warning" | "critical";
  message: string;
  stack_preview: string;
  ip_truncated: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

export const authApi = {
  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiError(res.status, data.detail || "Authentication failed.");
    }
    return data as AuthResponse;
  },

  async getMe(token: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiError(res.status, data.detail || "Failed to fetch user profile.");
    }
    return data as UserProfile;
  },

  async logout(token: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  },
};

export const adminApi = {
  async getStats(token?: string | null): Promise<AdminStats> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/stats`, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to load stats");
    return data as AdminStats;
  },

  async getUsers(token?: string | null, role?: string): Promise<UserProfile[]> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const url = new URL(`${API_BASE_URL}/api/v1/admin/users`);
    if (role) url.searchParams.set("role", role);
    const res = await fetch(url.toString(), { headers });
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load users");
    return data as UserProfile[];
  },

  async updateUserStatus(token: string, userId: string, isActive: boolean, reason?: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_active: isActive, reason }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to update user");
    return data as UserProfile;
  },

  async getCampaigns(token?: string | null): Promise<Campaign[]> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/campaigns`, { headers });
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load campaigns");
    return data as Campaign[];
  },

  async createCampaign(
    token: string,
    payload: { name: string; sponsor: string; target_url: string; slot: string; target_impressions: number }
  ): Promise<Campaign> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to create campaign");
    return data as Campaign;
  },

  async updateCampaign(token: string, campaignId: string, payload: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to update campaign");
    return data as Campaign;
  },

  async deleteCampaign(token: string, campaignId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/campaigns/${campaignId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new ApiError(res.status, "Failed to delete campaign");
  },

  async getTelemetry(token?: string | null): Promise<ToolTelemetry[]> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/telemetry`, { headers });
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load telemetry");
    return data as ToolTelemetry[];
  },

  async getCrashLogs(token?: string | null): Promise<CrashLog[]> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/crash-logs`, { headers });
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load crash logs");
    return data as CrashLog[];
  },

  async getAuditLogs(token?: string | null): Promise<AuditLog[]> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/audit-logs`, { headers });
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load audit logs");
    return data as AuditLog[];
  },
};
