"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Activity, 
  Megaphone, 
  Users, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Globe2, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { authApi } from "@/lib/api";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  adminName?: string;
  adminEmail?: string;
}

export function Sidebar({
  currentTab,
  onTabChange,
  adminName = "Bayajit Islam",
  adminEmail = "realbayajitislam@gmail.com",
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "telemetry", label: "Tool Telemetry", icon: Activity, badge: "18 Live" },
    { id: "ads", label: "Ad Campaigns", icon: Megaphone, badge: "Monetized" },
    { id: "users", label: "Users & API Keys", icon: Users },
    { id: "blog", label: "Blog & SEO Studio", icon: FileText },
    { id: "crashes", label: "Crash Analytics", icon: AlertTriangle, badgeColor: "bg-emerald-500/20 text-emerald-400" },
    { id: "audit", label: "Security Audit Logs", icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
    if (token) {
      await authApi.logout(token).catch(() => {});
    }
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    window.location.href = "/";
  };

  return (
    <aside className="w-64 lg:w-72 bg-[#090d16] text-white flex flex-col justify-between shrink-0 sticky top-0 h-screen border-r border-white/5 transition-all duration-300">
      
      {/* Top Brand Header */}
      <div>
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">
                LOTSOFNETWORK
              </span>
              <span className="text-[10px] text-blue-400 font-mono font-medium uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Admin Command
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-1">
          <p className="px-3 pt-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Platform Engine
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : item.badgeColor || "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* Admin Profile Pill */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md">
              <span>{adminName.split(" ").map(n => n[0]).join("")}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#090d16]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {adminName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {adminEmail}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-rose-400 transition cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
