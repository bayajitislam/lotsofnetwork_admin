"use client";

import React, { useState } from "react";
import { 
  Users, 
  Key, 
  ShieldCheck, 
  Search, 
  UserCheck, 
  UserX, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Plus,
  Copy,
  Check,
  Trash2,
  Play,
  Pause,
  Layers,
  Sparkles,
  X,
  Lock,
  Zap,
  TrendingUp,
  Eye,
  EyeOff,
  Terminal
} from "lucide-react";
import { UserProfile, AdminStats, ApiKey, ApiKeyCreateResponse, adminApi } from "@/lib/api";

interface UsersViewProps {
  users: UserProfile[];
  apiKeys?: ApiKey[];
  stats?: AdminStats | null;
  token?: string | null;
  onUserStatusUpdated?: (user: UserProfile) => void;
  onApiKeyCreated?: (key: ApiKey) => void;
  onApiKeyUpdated?: (key: ApiKey) => void;
  onApiKeyDeleted?: (id: string) => void;
}

export function UsersView({
  users,
  apiKeys = [],
  stats,
  token,
  onUserStatusUpdated,
  onApiKeyCreated,
  onApiKeyUpdated,
  onApiKeyDeleted,
}: UsersViewProps) {
  const [activeTab, setActiveTab] = useState<"users" | "keys">("users");
  
  // Users Tab state
  const [searchUsers, setSearchUsers] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // API Keys Tab state
  const [searchKeys, setSearchKeys] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [togglingKeyId, setTogglingKeyId] = useState<string | null>(null);

  // Generate Key Modal state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyOwnerId, setNewKeyOwnerId] = useState(users[0]?.id || "");
  const [newKeyTier, setNewKeyTier] = useState<"free" | "developer" | "pro">("developer");
  const [newKeyLimit, setNewKeyLimit] = useState(10000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Secret Key Revealed Modal state
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [hasCopiedSecret, setHasCopiedSecret] = useState(false);
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCopyKeyString = (id: string, keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleRevealKey = (id: string) => {
    setRevealedKeyIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle User status toggle
  const handleToggleUserStatus = async (user: UserProfile) => {
    if (!token) return;
    setTogglingUserId(user.id);
    try {
      const nextActive = !user.is_active;
      const updated = await adminApi.updateUserStatus(token, user.id, nextActive);
      if (onUserStatusUpdated) onUserStatusUpdated(updated);
    } catch (e) {
      console.error("Failed to update user status", e);
    } finally {
      setTogglingUserId(null);
    }
  };

  // Handle API Key status toggle
  const handleToggleKeyStatus = async (apiKey: ApiKey) => {
    if (!token) return;
    setTogglingKeyId(apiKey.id);
    try {
      const nextActive = !apiKey.is_active;
      const updated = await adminApi.updateApiKey(token, apiKey.id, { is_active: nextActive });
      if (onApiKeyUpdated) onApiKeyUpdated(updated);
    } catch (e) {
      console.error("Failed to toggle API key", e);
    } finally {
      setTogglingKeyId(null);
    }
  };

  // Handle API Key deletion
  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to permanently revoke and delete this API key?")) return;
    if (!token) return;
    try {
      await adminApi.deleteApiKey(token, keyId);
      if (onApiKeyDeleted) onApiKeyDeleted(keyId);
    } catch (e) {
      console.error("Failed to delete API key", e);
    }
  };

  // Handle Generate Key Form Submit
  const handleGenerateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!newKeyName.trim()) {
      setGenerateError("Please specify a descriptive name for this API key.");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await adminApi.createApiKey(token, {
        name: newKeyName.trim(),
        user_id: newKeyOwnerId || (users.length > 0 ? users[0].id : undefined),
        tier: newKeyTier,
        monthly_limit: Number(newKeyLimit),
      });

      if (onApiKeyCreated) onApiKeyCreated(res);
      setIsGenerateModalOpen(false);
      setRevealedSecret(res.secret_key);
      setNewKeyName("");
      setNewKeyLimit(10000);
    } catch (err: any) {
      setGenerateError(err.detail || err.message || "Failed to generate API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyRevealedKey = () => {
    if (!revealedSecret) return;
    navigator.clipboard.writeText(revealedSecret);
    setHasCopiedSecret(true);
    setTimeout(() => setHasCopiedSecret(false), 2500);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch =
      u.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchUsers.toLowerCase()));
    return matchRole && matchSearch;
  });

  // Filtered API Keys
  const filteredKeys = apiKeys.filter((k) => {
    const matchTier = tierFilter === "all" || k.tier === tierFilter;
    const matchSearch =
      k.name.toLowerCase().includes(searchKeys.toLowerCase()) ||
      k.key_prefix.toLowerCase().includes(searchKeys.toLowerCase()) ||
      (k.user_email && k.user_email.toLowerCase().includes(searchKeys.toLowerCase()));
    return matchTier && matchSearch;
  });

  const totalKeys = apiKeys.length;
  const activeKeysCount = apiKeys.filter((k) => k.is_active).length;
  const totalApiQueries = apiKeys.reduce((acc, k) => acc + k.current_month_usage, 0);
  const totalApiCapacity = apiKeys.reduce((acc, k) => acc + k.monthly_limit, 0);

  return (
    <div className="space-y-6">
      
      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "users"
                ? "bg-white dark:bg-[#0b101d] text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            <span>Registered Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("keys")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "keys"
                ? "bg-white dark:bg-[#0b101d] text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Key className="w-4 h-4 text-purple-500" />
            <span>Developer API Keys ({totalKeys})</span>
          </button>
        </div>

        {activeTab === "keys" && (
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New API Key</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: REGISTERED USERS                                 */}
      {/* ======================================================== */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Total Registered</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {users.length}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Administrators</span>
              <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
                {users.filter(u => u.role === "admin").length}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">API Developers</span>
              <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
                {users.filter(u => u.role === "user").length}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Active Accounts</span>
              <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {users.filter(u => u.is_active).length}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Platform Users & Role-Based Access Control
                </h3>
                <p className="text-xs text-slate-500">
                  Manage accounts, toggle developer access, and enforce session revocations
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins Only</option>
                  <option value="user">Users Only</option>
                </select>

                <div className="relative w-48 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search user or email..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">User & Identity</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Registered Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Account Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredUsers.map((u) => {
                    const isToggling = togglingUserId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {u.name ? u.name.split(" ").map((n) => n[0]).join("") : u.email.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {u.name || "Lots of Network User"}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role === "admin"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          }`}>
                            {u.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <Key className="w-3 h-3" />}
                            {u.role.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-4 text-slate-500">
                          {new Date(u.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            u.is_active ? "text-emerald-500" : "text-rose-500"
                          }`}>
                            {u.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {u.is_active ? "Active" : "Suspended"}
                          </span>
                        </td>

                        <td className="py-4 pr-2 text-right">
                          {u.role === "admin" ? (
                            <span className="text-[11px] font-semibold text-slate-400">
                              Protected Admin
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              disabled={isToggling}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                                u.is_active
                                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {isToggling ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : u.is_active ? (
                                <>
                                  <UserX className="w-3 h-3" />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3" />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DEVELOPER API KEYS                               */}
      {/* ======================================================== */}
      {activeTab === "keys" && (
        <div className="space-y-6">
          {/* Top KPI Cards for API Programmatic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Active Developer Keys</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {activeKeysCount}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ {totalKeys} Total</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Monthly Quota Utilization</span>
              <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {totalApiCapacity > 0 ? ((totalApiQueries / totalApiCapacity) * 100).toFixed(1) + "%" : "0.0%"}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Programmatic Usage</span>
              <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
                {totalApiQueries.toLocaleString()} reqs
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Allocated Quota Capacity</span>
              <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
                {totalApiCapacity.toLocaleString()} /mo
              </div>
            </div>
          </div>

          {/* Keys Management Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-500" />
                  Developer API Keys & Programmatic Quotas
                </h3>
                <p className="text-xs text-slate-500">
                  Cryptographically secure token dispatch with quota throttling and instant key revocation
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="all">All Tiers</option>
                  <option value="free">Free Tier</option>
                  <option value="developer">Developer Tier</option>
                  <option value="pro">Pro Tier</option>
                </select>

                <div className="relative w-48 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search key or owner..."
                    value={searchKeys}
                    onChange={(e) => setSearchKeys(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Keys Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Key Name & Prefix</th>
                    <th className="pb-3">Owner User</th>
                    <th className="pb-3">Tier</th>
                    <th className="pb-3">Monthly Quota Meter</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Created</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredKeys.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No API keys found. Click &quot;Generate New API Key&quot; to issue developer access credentials.
                      </td>
                    </tr>
                  ) : (
                    filteredKeys.map((k) => {
                      const usagePct = Math.min(100, Math.round((k.current_month_usage / k.monthly_limit) * 100));
                      const isToggling = togglingKeyId === k.id;

                      return (
                        <tr key={k.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                          <td className="py-4 pl-2">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {k.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-slate-500 font-mono text-[11px]">
                              <Lock className="w-3 h-3 text-purple-400 shrink-0" />
                              <span className="select-all text-slate-700 dark:text-slate-300">
                                {revealedKeyIds[k.id] && k.key_value ? k.key_value : k.masked_key}
                              </span>
                              {k.key_value && (
                                <button
                                  type="button"
                                  onClick={() => toggleRevealKey(k.id)}
                                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded transition cursor-pointer"
                                  title={revealedKeyIds[k.id] ? "Hide full key" : "Reveal full key"}
                                >
                                  {revealedKeyIds[k.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCopyKeyString(k.id, k.key_value || k.masked_key)}
                                className="p-1 text-slate-400 hover:text-purple-500 rounded transition cursor-pointer"
                                title="Copy API Key to clipboard"
                              >
                                {copiedKeyId === k.id ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {k.user_name || "Lots of Network User"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {k.user_email || "N/A"}
                            </div>
                          </td>

                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              k.tier === "pro"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                : k.tier === "developer"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                            }`}>
                              {k.tier.toUpperCase()}
                            </span>
                          </td>

                          <td className="py-4 w-48">
                            <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {k.current_month_usage.toLocaleString()}
                              </span>
                              <span className="text-slate-400">
                                / {k.monthly_limit.toLocaleString()} ({usagePct}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  usagePct > 90 ? "bg-rose-500" : usagePct > 70 ? "bg-amber-500" : "bg-purple-500"
                                }`}
                                style={{ width: `${usagePct}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              k.is_active ? "text-emerald-500" : "text-rose-500"
                            }`}>
                              {k.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              {k.is_active ? "Active" : "Revoked"}
                            </span>
                          </td>

                          <td className="py-4 text-slate-500 font-mono text-[11px]">
                            {new Date(k.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>

                          <td className="py-4 pr-2 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleToggleKeyStatus(k)}
                                disabled={isToggling}
                                title={k.is_active ? "Suspend API key" : "Activate API key"}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer disabled:opacity-50"
                              >
                                {isToggling ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : k.is_active ? (
                                  <Pause className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <Play className="w-4 h-4 text-emerald-500" />
                                )}
                              </button>

                              <button
                                onClick={() => handleDeleteKey(k.id)}
                                title="Permanently delete API key"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: GENERATE API KEY MODAL                         */}
      {/* ======================================================== */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Generate Developer API Key
                  </h3>
                  <p className="text-xs text-slate-500">
                    Issue token with cryptographic SHA-256 hash storage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generateError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {generateError}
              </div>
            )}

            <form onSubmit={handleGenerateKeySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Key Name / Client Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Acme Cloud Core Production"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assign to Registered User / Owner
                </label>
                <select
                  value={newKeyOwnerId}
                  onChange={(e) => setNewKeyOwnerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name ? `${u.name} (${u.email})` : u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tier Model
                  </label>
                  <select
                    value={newKeyTier}
                    onChange={(e) => {
                      const t = e.target.value as "free" | "developer" | "pro";
                      setNewKeyTier(t);
                      if (t === "free") setNewKeyLimit(1000);
                      else if (t === "developer") setNewKeyLimit(10000);
                      else if (t === "pro") setNewKeyLimit(100000);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="developer">Developer Tier (10,000 reqs/mo)</option>
                    <option value="pro">Pro Tier (100,000 reqs/mo)</option>
                    <option value="free">Free Tier (1,000 reqs/mo)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Monthly Quota Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    required
                    value={newKeyLimit}
                    onChange={(e) => setNewKeyLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGenerating ? "Generating..." : "Generate Key"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SECRET KEY REVEAL DIALOG                       */}
      {/* ======================================================== */}
      {revealedSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                API Key Generated Successfully
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Please copy your secret key now. For security reasons, it will never be displayed again.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs flex items-center justify-between gap-3 border border-emerald-500/30 select-all">
              <span className="break-all font-semibold select-all">{revealedSecret}</span>
              <button
                onClick={handleCopyRevealedKey}
                title="Copy to clipboard"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              >
                {hasCopiedSecret ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-300" />
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-3 h-3 text-purple-400" />
                Test API Usage (cURL)
              </span>
              <code className="text-[11px] text-slate-300 font-mono block break-all select-all">
                curl -H "X-API-Key: {revealedSecret}" http://localhost:8000/api/v1/tools/ip-lookup
              </code>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setRevealedSecret(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md transition cursor-pointer"
              >
                I have saved my secret key safely
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
