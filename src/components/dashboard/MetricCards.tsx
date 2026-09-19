"use client";

import React from "react";
import { MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      {/* CARD 1: Total Ad Earning */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Ad Earning
          </span>
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              $19.280
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">150 orders / payouts</span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                +12.08%
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
            API Freemium Revenue
          </span>
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              $10.534
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">130 pro tiers</span>
              <span className="inline-flex items-center text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                <ArrowDownRight className="w-3 h-3" />
                -15.08%
              </span>
            </div>
          </div>

          {/* Red/Pink Sparkline Curve (Matches reference) */}
          <div className="w-24 h-12 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <path
                d="M 0,15 Q 30,10 50,22 T 80,25 T 100,32"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0,15 Q 30,10 50,22 T 80,25 T 100,32 L 100,40 L 0,40 Z"
                fill="url(#redGlow)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="redGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
}
