"use client";

import React from "react";
import { MoreHorizontal, ArrowUpRight, Eye, Key } from "lucide-react";
import { AdminStats } from "@/lib/api";

interface MetricCardsProps {
  stats?: AdminStats | null;
}

export function MetricCards({ stats }: MetricCardsProps) {
  const totalImpressions = stats ? stats.total_impressions.toLocaleString() : "0";
  const clicksInfo = stats ? `${stats.total_clicks.toLocaleString()} referral clicks` : "0 referral clicks";
  const activeKeys = stats ? stats.active_api_keys : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      {/* CARD 1: Total Ad Impressions & Traffic */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ad Traffic & Delivered Impressions
            </span>
          </div>
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalImpressions}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">{clicksInfo}</span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {stats?.avg_ctr ?? 0}% CTR
              </span>
            </div>
          </div>

          {/* Green Sparkline Curve */}
          <div className="w-24 h-12 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <path
                d="M 0,35 Q 25,25 45,30 T 75,10 T 100,5"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0,35 Q 25,25 45,30 T 75,10 T 100,5 L 100,40 L 0,40 Z"
                fill="url(#greenGlow)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="greenGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* CARD 2: Developer Platform API Keys */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Key className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Developer API Keys & Engines
            </span>
          </div>
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeKeys} Active Keys
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">18 Platform Engines Online</span>
              <span className="inline-flex items-center text-[11px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                Live Telemetry
              </span>
            </div>
          </div>

          {/* Indigo Sparkline Curve */}
          <div className="w-24 h-12 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <path
                d="M 0,25 Q 30,30 50,15 T 80,18 T 100,8"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0,25 Q 30,30 50,15 T 80,18 T 100,8 L 100,40 L 0,40 Z"
                fill="url(#blueGlow)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
}
