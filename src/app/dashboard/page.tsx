"use client";

import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Megaphone, Globe2, ShieldAlert } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { TelemetryView } from "@/components/dashboard/TelemetryView";
import { AdEngineView } from "@/components/dashboard/AdEngineView";
import { UsersView } from "@/components/dashboard/UsersView";
import { BlogStudioView } from "@/components/dashboard/BlogStudioView";
import { CrashAnalyticsView } from "@/components/dashboard/CrashAnalyticsView";
import { AuditLogsView } from "@/components/dashboard/AuditLogsView";
import { CreateCampaignModal } from "@/components/dashboard/CreateCampaignModal";
import { 
  adminApi, 
  authApi, 
  UserProfile, 
  AdminStats, 
  Campaign, 
  Article,
  Category,
  ToolTelemetry, 
  CrashLog, 
  AuditLog,
  ApiKey 
} from "@/lib/api";

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // STRICT AUTHENTICATION STATE
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);

  // Platform Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [telemetry, setTelemetry] = useState<ToolTelemetry[]>([]);
  const [crashLogs, setCrashLogs] = useState<CrashLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const subheaderTabs = [
    { id: "overview", label: "Overview" },
    { id: "telemetry", label: "Tool Telemetry" },
    { id: "ads", label: "Ad Campaigns" },
    { id: "users", label: "Users & RBAC" },
    { id: "blog", label: "Blog & SEO" },
    { id: "crashes", label: "Crash Logs" },
    { id: "audit", label: "Audit Trail" },
  ];

  // STRICT AUTHENTICATION GUARD & CONTINUOUS SESSION KEEPER
  useEffect(() => {
    let isMounted = true;

    const checkAdminAuth = async () => {
      let savedToken = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
      const savedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("admin_refresh_token") : null;

      // 1. If NO token and NO refresh token exist at all -> strictly redirect to /
      if (!savedToken && !savedRefreshToken) {
        window.location.replace("/");
        return;
      }

      // If access token is missing but refresh token exists, attempt refresh immediately
      if (!savedToken && savedRefreshToken) {
        try {
          const renewed = await authApi.refreshToken(savedRefreshToken);
          savedToken = renewed.access_token;
        } catch {
          localStorage.removeItem("admin_access_token");
          localStorage.removeItem("admin_refresh_token");
          window.location.replace("/?error=session_expired");
          return;
        }
      }

      if (isMounted) setToken(savedToken);

      // 2. Validate token cryptographically with backend /api/v1/auth/me (authFetch seamlessly refreshes if expired)
      try {
        const me = await authApi.getMe(savedToken);

        // 3. Strict RBAC check: Must be role === 'admin' and is_active === true
        if (me.role !== "admin" || !me.is_active) {
          localStorage.removeItem("admin_access_token");
          localStorage.removeItem("admin_refresh_token");
          window.location.replace("/?error=unauthorized");
          return;
        }

        if (!isMounted) return;

        // 4. Authenticated admin verified
        setAdminUser(me);
        setIsAuthenticating(false);

        // 5. Load platform data in parallel
        Promise.allSettled([
          adminApi.getStats(savedToken).then(setStats),
          adminApi.getCampaigns(savedToken).then(setCampaigns),
          adminApi.getUsers(savedToken).then(setUsers),
          adminApi.getApiKeys(savedToken).then(setApiKeys),
          adminApi.getCategories(savedToken).then(setCategories),
          adminApi.getArticles(savedToken).then(setArticles),
          adminApi.getTelemetry(savedToken).then(setTelemetry),
          adminApi.getCrashLogs(savedToken).then(setCrashLogs),
          adminApi.getAuditLogs(savedToken).then(setAuditLogs),
        ]);

      } catch (err) {
        // Token and refresh both failed or rejected
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_refresh_token");
        window.location.replace("/?error=session_expired");
      }
    };

    checkAdminAuth();

    // 6. Proactive silent session keeper heartbeat (runs every 10 minutes)
    const sessionInterval = setInterval(async () => {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("admin_refresh_token") : null;
      if (refreshToken) {
        try {
          const res = await authApi.refreshToken(refreshToken);
          if (isMounted && res.access_token) {
            setToken(res.access_token);
          }
        } catch (e) {
          console.warn("Silent token refresh heartbeat error:", e);
        }
      }
    }, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(sessionInterval);
    };
  }, []);

  const handleCampaignCreated = (newCamp: Campaign) => {
    setCampaigns((prev) => [newCamp, ...prev]);
    adminApi.getStats(token).then(setStats).catch(() => {});
    adminApi.getAuditLogs(token).then(setAuditLogs).catch(() => {});
  };

  const handleCampaignUpdated = (updated: Campaign) => {
    setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    adminApi.getAuditLogs(token).then(setAuditLogs).catch(() => {});
  };

  const handleCampaignDeleted = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    adminApi.getAuditLogs(token).then(setAuditLogs).catch(() => {});
  };

  const handleUserStatusUpdated = (updatedUser: UserProfile) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    adminApi.getAuditLogs(token).then(setAuditLogs).catch(() => {});
  };

  const handleApiKeyCreated = (newKey: ApiKey) => {
    setApiKeys((prev) => [newKey, ...prev]);
    adminApi.getStats(token).then(setStats).catch(() => {});
    adminApi.getAuditLogs(token).then(setAuditLogs).catch(() => {});
  };

  const handleApiKeyUpdated = (updatedKey: ApiKey) => {
    setApiKeys((prev) => prev.map((k) => (k.id === updatedKey.id ? updatedKey : k)));
    adminApi.getStats(token).then(setStats).catch(() => {});
    adminApi.getAuditLogs(token).then(setAuditLogs).catch(() => {});
  };

  const handleApiKeyDeleted = (keyId: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    adminApi.getStats(token).then(setStats).catch(() => {});
    adminApi.getAuditLogs(token).then(setAuditLogs).catch(() => {});
  };

  const handleArticleSaved = (savedArt: Article) => {
    setArticles((prev) => {
      const exists = prev.some((a) => a.id === savedArt.id || a.slug === savedArt.slug);
      if (exists) {
        return prev.map((a) => (a.id === savedArt.id || a.slug === savedArt.slug ? savedArt : a));
      }
      return [savedArt, ...prev];
    });
    adminApi.getStats(token).then(setStats).catch(() => {});
    adminApi.getAuditLogs(token).then(setAuditLogs).catch(() => {});
  };

  // SECURE AUTHENTICATION GATE (Renders while verifying; unauthenticated visitors never see dashboard)
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#060911] text-slate-900 dark:text-white p-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 animate-pulse">
          <Globe2 className="w-7 h-7" />
        </div>
        <div className="mt-4 text-center space-y-1">
          <h3 className="text-sm font-bold tracking-tight">Lots of Network Command Center</h3>
          <p className="text-xs text-slate-500 font-mono flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Verifying cryptographic administrator privileges...
          </p>
        </div>
      </div>
    );
  }

  const adminDisplayName = adminUser?.name || "Bayajit Islam";
  const adminDisplayEmail = adminUser?.email || "realbayajitislam@gmail.com";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#060911] transition-colors duration-300">
      
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        adminName={adminDisplayName}
        adminEmail={adminDisplayEmail}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Header adminName={adminDisplayName} onSearch={setSearchQuery} />

        {/* Dashboard Body */}
        <main className="p-6 sm:p-8 space-y-7 max-w-7xl w-full mx-auto">
          
          {/* Subheader */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight capitalize">
                {currentTab === "overview" ? "Dashboard" : subheaderTabs.find(t => t.id === currentTab)?.label || currentTab}
              </h2>
              
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {subheaderTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      currentTab === tab.id
                        ? "bg-white dark:bg-[#0b101d] text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action button */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create new campaign</span>
              </button>
            </div>
          </div>

          {/* Active View Switcher */}
          {currentTab === "overview" && (
            <OverviewView 
              campaigns={campaigns} 
              stats={stats}
              telemetry={telemetry}
              onManageCampaignsClick={() => setCurrentTab("ads")} 
            />
          )}

          {currentTab === "telemetry" && (
            <TelemetryView telemetry={telemetry} />
          )}

          {currentTab === "ads" && (
            <AdEngineView
              campaigns={campaigns}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onCampaignUpdated={handleCampaignUpdated}
              onCampaignDeleted={handleCampaignDeleted}
              token={token}
            />
          )}

          {currentTab === "users" && (
            <UsersView
              users={users}
              apiKeys={apiKeys}
              stats={stats}
              token={token}
              onUserStatusUpdated={handleUserStatusUpdated}
              onApiKeyCreated={handleApiKeyCreated}
              onApiKeyUpdated={handleApiKeyUpdated}
              onApiKeyDeleted={handleApiKeyDeleted}
            />
          )}

          {currentTab === "blog" && (
            <BlogStudioView 
              articles={articles} 
              categories={categories}
              token={token} 
              onArticleSaved={handleArticleSaved}
            />
          )}

          {currentTab === "crashes" && (
            <CrashAnalyticsView 
              logs={crashLogs} 
              token={token}
              onLogUpdated={(updated) => setCrashLogs(prev => prev.map(l => l.id === updated.id ? updated : l))}
              onReloadLogs={(newLogs) => setCrashLogs(newLogs)}
            />
          )}

          {currentTab === "audit" && (
            <AuditLogsView logs={auditLogs} />
          )}

        </main>
      </div>

      {/* Launch Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCampaignCreated}
        token={token}
      />
    </div>
  );
}
