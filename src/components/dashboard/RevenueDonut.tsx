"use client";

import React from "react";
import { MoreHorizontal, Terminal, Users, TrendingUp, Eye, MousePointerClick, Layers } from "lucide-react";
import { AdminStats } from "@/lib/api";

interface RevenueDonutProps {
  stats?: AdminStats | null;
}

export function RevenueDonut({ stats }: RevenueDonutProps) {
  const targetPct = stats?.ad_target_percentage ?? 68;
  const impressionsFormatted = stats ? stats.total_impressions.toLocaleString() : "0";
  const clicksFormatted = stats ? stats.total_clicks.toLocaleString() : "0";
  const avgCtr = stats?.avg_ctr ?? 0;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-500" />
          <span>Traffic & Ad Placement Distribution</span>
        </h3>
        <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Donut Chart & Metrics Split */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
        
        {/* Donut Radial Representation */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="currentColor"
              className="text-slate-100 dark:text-white/5"
              strokeWidth="18"
            />
            
            {/* Segment 1: Tool Header Slot (45%) - Vibrant Violet */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#7c3aed"
              strokeWidth="18"
              strokeDasharray="170 207"
              strokeDashoffset="0"
              className="transition-all duration-500"
            />

            {/* Segment 2: Sidebar Sticky (30%) - Electric Blue */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#0ea5e9"
              strokeWidth="18"
              strokeDasharray="113 264"
              strokeDashoffset="-175"
              className="transition-all duration-500"
            />

            {/* Segment 3: Footer Sponsor (25%) - Emerald */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="18"
              strokeDasharray="94 283"
              strokeDashoffset="-292"
              className="transition-all duration-500"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {impressionsFormatted}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Impressions
            </span>
          </div>
        </div>

        {/* Right Stats Breakdown */}
        <div className="space-y-4 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Tool Header (45%)</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">High Visibility</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MousePointerClick className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Sidebar Sticky (30%)</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{clicksFormatted} Clicks</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Avg CTR Conversion</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{avgCtr}% CTR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
