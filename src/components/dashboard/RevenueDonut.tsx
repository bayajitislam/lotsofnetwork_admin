"use client";

import React from "react";
import { MoreHorizontal, Terminal, Users, TrendingUp } from "lucide-react";

export function RevenueDonut() {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Earning Reports & Sources
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
            
            {/* Segment 1: Affiliate Ads (34%) - Vibrant Violet/Purple */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#7c3aed"
              strokeWidth="18"
              strokeDasharray="128 250"
              strokeDashoffset="0"
              className="transition-all duration-500"
            />

            {/* Segment 2: Direct Sponsors (22%) - Deep Indigo */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#4338ca"
              strokeWidth="18"
              strokeDasharray="83 294"
              strokeDashoffset="-132"
              className="transition-all duration-500"
            />

            {/* Segment 3: API Freemium (35%) - Electric Blue */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#0ea5e9"
              strokeWidth="18"
              strokeDasharray="132 245"
              strokeDashoffset="-218"
              className="transition-all duration-500"
            />

            {/* Segment 4: Custom Ad Slots (9%) - Dark Carbon */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="18"
              strokeDasharray="34 343"
              strokeDashoffset="-354"
              className="transition-all duration-500"
            />
          </svg>

          {/* Center Text (Matching reference: 68% Total Sales) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              68%
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Ad Target
            </span>
          </div>
        </div>

        {/* Right Stats Breakdown */}
        <div className="space-y-4 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Total Tool Queries</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">5,480 / hr</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Monthly Visitors</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">380K Unique</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Daily Revenue</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">$98.340</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
