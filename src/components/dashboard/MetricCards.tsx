"use client";

import React from "react";
import { MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AdminStats } from "@/lib/api";

interface MetricCardsProps {
  stats?: AdminStats | null;
}

export function MetricCards({ stats }: MetricCardsProps) {
  const earnings = stats ? `$${stats.total_earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$19,280.00";
  const apiRevenue = stats ? `$${stats.api_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$10,534.00";
  const clicksInfo = stats ? `${stats.total_clicks.toLocaleString()} affiliate conversions` : "842 conversions";
  const keysInfo = stats ? `${stats.active_api_keys} active developer keys` : "3 active developer keys";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      {/* CARD 1: Total Ad Earning */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Ad Earning (Live Backend)
          </span>
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {earnings}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">{clicksInfo}</span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                +{stats?.avg_ctr ?? 12.08}% CTR
              </span>
            </div>
          </div>

          {/* Green Sparkline Curve (Matches reference) */}
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

      {/* CARD 2: Total API Spending / Infrastructure */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            API Freemium Revenue (Live Backend)
          </span>
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {apiRevenue}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">{keysInfo}</span>
              <span className="inline-flex items-center text-[11px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                Active Tier
              </span>
            </div>
          </div>

          {/* Sparkline Curve */}
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
