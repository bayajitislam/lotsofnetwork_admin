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

export interface MonthlyActivity {
  month: string;
  tools_queries: number;
  api_queries: number;
  earnings: number;
}

export interface RevenueBreakdown {
  affiliate_percentage: number;
  direct_sponsors_percentage: number;
  api_freemium_percentage: number;
  custom_slots_percentage: number;
}

export interface AdminStats {
  total_users: number;
  admin_users: number;
  standard_users: number;
  active_api_keys: number;
  audit_logs_count: number;
  active_campaigns_count: number;
  total_articles_count: number;
  indexed_articles_count: number;
  total_categories_count: number;
  total_impressions: number;
  total_clicks: number;
  avg_ctr: number;
  total_earnings: number;
  api_revenue: number;
  ad_target_percentage: number;
  monthly_activity: MonthlyActivity[];
  revenue_breakdown: RevenueBreakdown;
  status: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
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

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  excerpt: string | null;
  content: string | null;
  views: number;
  status: "published" | "draft" | "scheduled" | "archived";
  is_indexed: boolean;
  focus_keyword: string | null;
  secondary_keywords: string[];
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  featured_image: string | null;
  reading_time_minutes: number;
  seo_score: number;
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

  async getCategories(token?: string | null): Promise<Category[]> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/categories`, { headers });
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load categories");
    return data as Category[];
  },

  async createCategory(
    token: string,
    payload: { name: string; slug: string; color: string; description?: string }
  ): Promise<Category> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to create category");
    return data as Category;
  },

  async deleteCategory(token: string, categoryId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/categories/${categoryId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new ApiError(res.status, "Failed to delete category");
  },

  async getTags(token?: string | null): Promise<Tag[]> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/tags`, { headers });
    const data = await res.json().catch(() => ([]));
    return data as Tag[];
  },

  async createTag(token: string, payload: { name: string; slug?: string }): Promise<Tag> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return data as Tag;
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

  async getArticles(token?: string | null, category?: string): Promise<Article[]> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const url = new URL(`${API_BASE_URL}/api/v1/admin/articles`);
    if (category && category !== "all") url.searchParams.set("category", category);
    url.searchParams.set("limit", "100");
    const res = await fetch(url.toString(), { headers });
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load articles");
    return data as Article[];
  },

  async createArticle(token: string, payload: Partial<Article>): Promise<Article> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to create article");
    return data as Article;
  },

  async updateArticle(token: string, articleId: string, payload: Partial<Article>): Promise<Article> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/articles/${articleId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to update article");
    return data as Article;
  },

  async deleteArticle(token: string, articleId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/articles/${articleId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new ApiError(res.status, "Failed to delete article");
  },

  async pingGoogleIndexing(token: string, articleId: string): Promise<{ status: string; url: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/articles/${articleId}/index-ping`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to dispatch indexing ping");
    return data;
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

export const toolsApi = {
  async ipLookup(query?: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/ip-lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    return res.json();
  },

  async dnsLookup(domain: string, record_type = "ALL") {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/dns-lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, record_type }),
    });
    return res.json();
  },

  async subnetCalc(cidr: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/subnet-calculator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cidr }),
    });
    return res.json();
  },

  async portCheck(host: string, ports = [80, 443, 22, 21, 25, 3306]) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/port-checker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, ports }),
    });
    return res.json();
  },
};
