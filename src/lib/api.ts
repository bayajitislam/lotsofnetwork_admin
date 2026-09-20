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

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
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
  total_subscriptions?: number;
  paid_subscribers?: number;
  ad_target_percentage: number;
  monthly_activity: MonthlyActivity[];
  revenue_breakdown: RevenueBreakdown;
  status: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_limit: number;
  rate_limit_rpm: number;
  price_cents: number;
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminSubscriptionItem {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  user_avatar: string | null;
  plan_id: string;
  plan_name: string;
  plan_slug: string;
  monthly_limit: number;
  rate_limit_rpm: number;
  price_cents: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSubscriptionUpdate {
  plan_slug: string;
  reason?: string;
}

export interface AdminPlanUpdate {
  name?: string;
  description?: string;
  monthly_limit?: number;
  rate_limit_rpm?: number;
  price_cents?: number;
  stripe_price_id?: string;
  is_active?: boolean;
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
  image_url?: string | null;
  image_dimensions?: string | null;
  slot: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  payout_type: string;
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
  severity: "error" | "warning" | "critical" | "high" | "medium" | "low" | string;
  message: string;
  stack_preview: string;
  ip_truncated: string;
  resolved?: boolean;
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

export interface ApiKey {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  name: string;
  key_prefix: string;
  masked_key: string;
  // key_value intentionally absent — raw keys are never stored or returned after creation
  tier: "free" | "developer" | "pro";
  monthly_limit: number;
  current_month_usage: number;
  rate_limit_rpm: number;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface ApiKeyCreateResponse extends ApiKey {
  secret_key: string; // Shown ONCE at creation — never stored in DB
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

export function parseJwt(token: string): { exp?: number; sub?: string; role?: string } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

let refreshPromise: Promise<string | null> | null = null;

export async function getValidAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const accessToken = localStorage.getItem("admin_access_token");
  const refreshToken = localStorage.getItem("admin_refresh_token");

  if (!accessToken && !refreshToken) return null;

  // Check if access token is valid and has at least 120s remaining
  if (accessToken) {
    const payload = parseJwt(accessToken);
    if (payload && payload.exp) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp - nowSeconds > 120) {
        return accessToken;
      }
    }
  }

  // If no refresh token available, fallback to whatever accessToken exists
  if (!refreshToken) {
    return accessToken;
  }

  // Deduplicate concurrent token refresh requests
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await authApi.refreshToken(refreshToken);
      return res.access_token;
    } catch (err) {
      console.warn("Session refresh failed:", err);
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function authFetch(
  url: string,
  options: RequestInit = {},
  explicitToken?: string | null
): Promise<Response> {
  const token = explicitToken || (await getValidAccessToken());
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, { credentials: "include", ...options, headers });

  // If 401 occurs despite initial token, attempt seamless refresh and retry once
  if (res.status === 401 && typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("admin_refresh_token");
    if (refreshToken) {
      try {
        const renewed = await authApi.refreshToken(refreshToken);
        if (renewed.access_token) {
          headers.set("Authorization", `Bearer ${renewed.access_token}`);
          res = await fetch(url, { credentials: "include", ...options, headers });
        }
      } catch {
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_refresh_token");
        window.location.replace("/?error=session_expired");
      }
    }
  }

  return res;
}

export const authApi = {
  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiError(res.status, data.detail || "Authentication failed.");
    }
    const authData = data as AuthResponse;
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_access_token", authData.access_token);
      localStorage.setItem("admin_refresh_token", authData.refresh_token);
    }
    return authData;
  },

  async refreshToken(refreshToken?: string): Promise<TokenRefreshResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiError(res.status, data.detail || "Failed to refresh session.");
    }
    const tokenResp = data as TokenRefreshResponse;
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_access_token", tokenResp.access_token);
      if (tokenResp.refresh_token) {
        localStorage.setItem("admin_refresh_token", tokenResp.refresh_token);
      }
    }
    return tokenResp;
  },

  async getMe(token?: string | null): Promise<UserProfile> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/auth/me`, {}, token);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiError(res.status, data.detail || "Failed to fetch user profile.");
    }
    return data as UserProfile;
  },

  async logout(token?: string | null): Promise<void> {
    await authFetch(
      `${API_BASE_URL}/api/v1/auth/logout`,
      { method: "POST" },
      token
    ).catch(() => {});
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
    }
  },
};

export const adminApi = {
  async getStats(token?: string | null): Promise<AdminStats> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/stats`, {}, token);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to load stats");
    return data as AdminStats;
  },

  async getCategories(token?: string | null): Promise<Category[]> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/categories`, {}, token);
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load categories");
    return data as Category[];
  },

  async createCategory(
    token: string,
    payload: { name: string; slug: string; color: string; description?: string }
  ): Promise<Category> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/categories`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to create category");
    return data as Category;
  },

  async deleteCategory(token: string, categoryId: string): Promise<void> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/categories/${categoryId}`,
      { method: "DELETE" },
      token
    );
    if (!res.ok) throw new ApiError(res.status, "Failed to delete category");
  },

  async getTags(token?: string | null): Promise<Tag[]> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/tags`, {}, token);
    const data = await res.json().catch(() => ([]));
    return data as Tag[];
  },

  async createTag(token: string, payload: { name: string; slug?: string }): Promise<Tag> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/tags`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    return data as Tag;
  },

  async getUsers(token?: string | null, role?: string): Promise<UserProfile[]> {
    const url = new URL(`${API_BASE_URL}/api/v1/admin/users`);
    if (role) url.searchParams.set("role", role);
    const res = await authFetch(url.toString(), {}, token);
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load users");
    return data as UserProfile[];
  },

  async updateUserStatus(
    token: string,
    userId: string,
    is_active: boolean,
    reason?: string
  ): Promise<UserProfile> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/users/${userId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active, reason }),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to update user status");
    return data as UserProfile;
  },

  async getCampaigns(token?: string | null, slot?: string): Promise<Campaign[]> {
    const url = new URL(`${API_BASE_URL}/api/v1/admin/campaigns`);
    if (slot && slot !== "all") url.searchParams.set("slot", slot);
    const res = await authFetch(url.toString(), {}, token);
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load campaigns");
    return data as Campaign[];
  },

  async createCampaign(
    token: string,
    payload: {
      name: string;
      sponsor: string;
      target_url: string;
      image_url?: string | null;
      image_dimensions?: string | null;
      slot: string;
      target_impressions: number;
      payout_type?: string;
      conversions?: number;
      revenue?: number;
    }
  ): Promise<Campaign> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/campaigns`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to create campaign");
    return data as Campaign;
  },

  async updateCampaign(token: string, campaignId: string, payload: Partial<Campaign>): Promise<Campaign> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/campaigns/${campaignId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to update campaign");
    return data as Campaign;
  },

  async deleteCampaign(token: string, campaignId: string): Promise<void> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/campaigns/${campaignId}`,
      { method: "DELETE" },
      token
    );
    if (!res.ok) throw new ApiError(res.status, "Failed to delete campaign");
  },

  async uploadMedia(token: string, file: File): Promise<{ status: string; url: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/admin/media/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to upload media");
    return data;
  },


  async getArticles(token?: string | null, category?: string): Promise<Article[]> {
    const url = new URL(`${API_BASE_URL}/api/v1/admin/articles`);
    if (category && category !== "all") url.searchParams.set("category", category);
    url.searchParams.set("limit", "100");
    const res = await authFetch(url.toString(), {}, token);
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load articles");
    return data as Article[];
  },

  async createArticle(token: string, payload: Partial<Article>): Promise<Article> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/articles`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to create article");
    return data as Article;
  },

  async updateArticle(token: string, articleId: string, payload: Partial<Article>): Promise<Article> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/articles/${articleId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to update article");
    return data as Article;
  },

  async deleteArticle(token: string, articleId: string): Promise<void> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/articles/${articleId}`,
      { method: "DELETE" },
      token
    );
    if (!res.ok) throw new ApiError(res.status, "Failed to delete article");
  },

  async resetAllArticleViews(token: string): Promise<{ status: string; message: string; count: number }> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/articles/reset-all-views`,
      { method: "POST" },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to reset views");
    return data;
  },

  async pingGoogleIndexing(token: string, articleId: string): Promise<{ status: string; url: string; message: string }> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/articles/${articleId}/index-ping`,
      { method: "POST" },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to dispatch indexing ping");
    return data;
  },

  async getTelemetry(token?: string | null): Promise<ToolTelemetry[]> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/telemetry`, {}, token);
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load telemetry");
    return data as ToolTelemetry[];
  },

  async getCrashLogs(token?: string | null): Promise<CrashLog[]> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/crash-logs`, {}, token);
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load crash logs");
    return data as CrashLog[];
  },

  async resolveCrashLog(token: string, logId: string, resolved = true): Promise<{ status: string; id: string; resolved: boolean }> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/crash-logs/${logId}/resolve`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved }),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to resolve crash log");
    return data;
  },

  async simulateCrash(token: string): Promise<{ detail: string; error_id: string; error_type: string }> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/crash-logs/simulate`,
      { method: "POST" },
      token
    );
    return res.json().catch(() => ({ detail: "Simulated exception", error_id: "", error_type: "RuntimeError" }));
  },

  async getAuditLogs(token?: string | null): Promise<AuditLog[]> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/audit-logs`, {}, token);
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load audit logs");
    return data as AuditLog[];
  },

  async getApiKeys(token?: string | null): Promise<ApiKey[]> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/api-keys`, {}, token);
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load API keys");
    return data as ApiKey[];
  },

  async createApiKey(
    token: string,
    payload: { user_id?: string; name: string; tier?: string; monthly_limit?: number; rate_limit_rpm?: number }
  ): Promise<ApiKeyCreateResponse> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/api-keys`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to generate API key");
    return data as ApiKeyCreateResponse;
  },

  async updateApiKey(
    token: string,
    keyId: string,
    payload: Partial<ApiKey>
  ): Promise<ApiKey> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/api-keys/${keyId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to update API key");
    return data as ApiKey;
  },

  async deleteApiKey(token: string, keyId: string): Promise<void> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/api-keys/${keyId}`,
      { method: "DELETE" },
      token
    );
    if (!res.ok) throw new ApiError(res.status, "Failed to delete API key");
  },

  async getSubscriptions(token?: string | null): Promise<AdminSubscriptionItem[]> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/subscriptions`, {}, token);
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load subscriptions");
    return data as AdminSubscriptionItem[];
  },

  async updateUserSubscription(
    token: string,
    userId: string,
    payload: AdminSubscriptionUpdate
  ): Promise<AdminSubscriptionItem> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/subscriptions/${userId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to update user subscription");
    return data as AdminSubscriptionItem;
  },

  async getPlans(token?: string | null): Promise<Plan[]> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/plans`, {}, token);
    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new ApiError(res.status, (data as any)?.detail || "Failed to load plans");
    return data as Plan[];
  },

  async updatePlan(token: string, planId: string, payload: AdminPlanUpdate): Promise<Plan> {
    const res = await authFetch(
      `${API_BASE_URL}/api/v1/admin/plans/${planId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.detail || "Failed to update plan");
    return data as Plan;
  },
};

export const toolsApi = {
  async pingTool(slug: string): Promise<{ tool_slug: string; latency_ms: number; status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/${slug}/ping`, {
      method: "POST",
    });
    return res.json();
  },
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

  async whoisLookup(domain: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/whois-lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    return res.json();
  },

  async reverseDns(ip: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/reverse-dns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });
    return res.json();
  },

  async sslCheck(host: string, port = 443) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/ssl-checker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, port }),
    });
    return res.json();
  },

  async httpHeaders(url: string, method = "HEAD") {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/http-headers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, method }),
    });
    return res.json();
  },

  async macLookup(mac_address: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/mac-lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mac_address }),
    });
    return res.json();
  },

  async cidrConvert(cidr: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/cidr-converter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cidr }),
    });
    return res.json();
  },

  async ipv6Calc(address: string, prefix?: number) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/ipv6-calculator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, prefix }),
    });
    return res.json();
  },

  async userAgentAnalyze(user_agent?: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/user-agent-analyzer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_agent }),
    });
    return res.json();
  },

  async uuidGen(options?: { version?: string; count?: number; uppercase?: boolean; include_hyphens?: boolean }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/uuid-generator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options || {}),
    });
    return res.json();
  },

  async jsonFormat(json_string: string, indent = 2, sort_keys = false) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/json-formatter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json_string, indent, sort_keys }),
    });
    return res.json();
  },

  async punycodeConvert(input_text: string, mode = "auto") {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/punycode-converter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input_text, mode }),
    });
    return res.json();
  },

  async chmodCalc(options: { octal?: string; symbolic?: string }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/chmod-calculator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    return res.json();
  },

  async timestampConvert(timestamp?: string, unit = "seconds") {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/timestamp-converter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp, unit }),
    });
    return res.json();
  },

  async base64Convert(input_text: string, action = "encode", url_safe = false) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tools/base64-encode-decode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input_text, action, url_safe }),
    });
    return res.json();
  },
};

export const blogApi = {
  async getPosts(category?: string): Promise<Article[]> {
    const url = new URL(`${API_BASE_URL}/api/v1/blog`);
    if (category && category !== "all") url.searchParams.set("category", category);
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    return res.json();
  },

  async getPost(slug: string): Promise<Article | null> {
    const res = await fetch(`${API_BASE_URL}/api/v1/blog/${slug}`);
    if (!res.ok) return null;
    return res.json();
  },

  async trackView(slug: string): Promise<{ slug: string; views: number; incremented: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/blog/${slug}/view`, {
      method: "POST",
    });
    return res.json();
  },
};

export const adsApi = {
  async recordImpression(campaignId: string): Promise<{ campaign_id: string; impressions: number; clicks: number; incremented: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/ads/${campaignId}/impression`, {
      method: "POST",
    });
    return res.json();
  },

  async recordClick(campaignId: string): Promise<{ campaign_id: string; impressions: number; clicks: number; target_url: string }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/ads/${campaignId}/click`, {
      method: "POST",
    });
    return res.json();
  },

  async getActiveAds(slot?: string) {
    const url = new URL(`${API_BASE_URL}/api/v1/ads/active`);
    if (slot) url.searchParams.set("slot", slot);
    const res = await fetch(url.toString());
    return res.json();
  },
};
