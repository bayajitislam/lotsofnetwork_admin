"use client";

import React, { useState } from "react";
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Search,
  UserCheck,
  UserX
} from "lucide-react";
import { UserProfile, AdminStats, adminApi } from "@/lib/api";

interface UsersViewProps {
  users: UserProfile[];
  stats: AdminStats | null;
  token?: string | null;
  onUserStatusUpdated: (updatedUser: UserProfile) => void;
}

export function UsersView({ users, stats, token, onUserStatusUpdated }: UsersViewProps) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) || (u.name && u.name.toLowerCase().includes(search.toLowerCase()));
    return matchRole && matchSearch;
  });

  const handleToggleStatus = async (user: UserProfile) => {
    if (!token) return;
    setTogglingId(user.id);
    try {
      const updated = await adminApi.updateUserStatus(token, user.id, !user.is_active, "Admin dashboard toggle");
      onUserStatusUpdated(updated);
    } catch (e: any) {
      alert(e.detail || "Failed to update user status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Registered Accounts</span>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {stats?.total_users ?? users.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Administrators</span>
          <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
            {stats?.admin_users ?? 1}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">API Developers</span>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
            {stats?.standard_users ?? 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active API Keys</span>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats?.active_api_keys ?? 3}
          </div>
        </div>
      </div>

      {/* Users Management Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
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
              {filtered.map((u) => {
                const isToggling = togglingId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {u.name ? u.name.split(" ").map(n => n[0]).join("") : u.email.substring(0, 2).toUpperCase()}
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
                        year: "numeric"
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
                          onClick={() => handleToggleStatus(u)}
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
  );
}
