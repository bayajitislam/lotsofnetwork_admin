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
