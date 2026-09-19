"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, Activity, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  adminName?: string;
  onSearch?: (query: string) => void;
}

export function Header({ adminName = "Bayajit Islam", onSearch }: HeaderProps) {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setCurrentDate(formatted);
  }, []);

  return (
    <header className="h-20 px-6 sm:px-8 border-b border-slate-200/80 dark:border-white/5 bg-white/70 dark:bg-[#060911]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 transition-colors">
      
      {/* Left: Personalized Greeting & Date */}
      <div>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Welcome Back, {adminName}!</span>
          <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-2">
          <span>{currentDate || "19 September 2026"}</span>
          <span className="opacity-40">|</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Backend Online
          </span>
        </p>
      </div>

      {/* Right: Search, Notifications, Theme Toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Quick Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tools, ads, users..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-56 lg:w-64 pl-10 pr-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition shadow-2xs"
          />
        </div>

        {/* Notifications Bell */}
        <button
          title="Notifications"
          className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
