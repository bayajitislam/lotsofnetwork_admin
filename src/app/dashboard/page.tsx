"use client";

import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Megaphone } from "lucide-react";
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
  AuditLog 
} from "@/lib/api";

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
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

  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
    setToken(savedToken);

    const loadData = async () => {
      if (savedToken) {
        try {
          const me = await authApi.getMe(savedToken);
          setAdminUser(me);
        } catch (e) {
          console.warn("Could not fetch current user with saved token", e);
        }
      }

      // Load stats
      try {
        const s = await adminApi.getStats(savedToken);
        setStats(s);
      } catch (e) {}

      // Load campaigns
      try {
        const c = await adminApi.getCampaigns(savedToken);
        setCampaigns(c);
      } catch (e) {}

      // Load users
      try {
        const u = await adminApi.getUsers(savedToken);
        setUsers(u);
      } catch (e) {}

      // Load categories
      try {
        const cats = await adminApi.getCategories(savedToken);
        setCategories(cats);
      } catch (e) {}

      // Load articles
      try {
        const a = await adminApi.getArticles(savedToken);
        setArticles(a);
      } catch (e) {}

      // Load telemetry
      try {
        const t = await adminApi.getTelemetry(savedToken);
        setTelemetry(t);
      } catch (e) {}

      // Load crash logs
      try {
        const cl = await adminApi.getCrashLogs(savedToken);
        setCrashLogs(cl);
      } catch (e) {}

      // Load audit logs
      try {
        const al = await adminApi.getAuditLogs(savedToken);
        setAuditLogs(al);
      } catch (e) {}
    };

    loadData();
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
              stats={stats}
              token={token}
              onUserStatusUpdated={handleUserStatusUpdated}
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
            <CrashAnalyticsView logs={crashLogs} />
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
