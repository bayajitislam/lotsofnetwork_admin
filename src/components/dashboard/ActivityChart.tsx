"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";

export function ActivityChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col justify-between">
      
      {/* Chart Header & Legend */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Monthly Tool & API Activity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Network tool inquiries vs. programmatic API requests
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white" />
            <span>Web Tools</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>API Programmatic</span>
          </div>

          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="relative w-full h-56">
        
        {/* Highlighted Tooltip at Peak (Matching reference image) */}
        <div className="absolute left-[54%] top-[12%] -translate-x-1/2 -translate-y-full z-10 flex flex-col items-center">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-lg flex items-center gap-1">
            <span>$52,940</span>
            <span className="text-[10px] opacity-75">(1.42M Hits)</span>
          </div>
          <div className="w-2 h-2 rotate-45 bg-slate-900 dark:bg-white -mt-1" />
        </div>

        <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
          <defs>
            {/* Primary Curve Gradient */}
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
            
            {/* Secondary Dashed Gradient */}
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line x1="0" y1="40" x2="700" y2="40" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="4 4" />
          <line x1="0" y1="90" x2="700" y2="90" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="4 4" />
          <line x1="0" y1="140" x2="700" y2="140" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="4 4" />
          <line x1="0" y1="190" x2="700" y2="190" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="4 4" />

          {/* Y Axis Labels */}
          <text x="0" y="45" className="text-[10px] fill-slate-400">$50K</text>
          <text x="0" y="95" className="text-[10px] fill-slate-400">$40K</text>
          <text x="0" y="145" className="text-[10px] fill-slate-400">$30K</text>
          <text x="0" y="195" className="text-[10px] fill-slate-400">$10K</text>

          {/* Shaded Area for Curve 1 */}
          <path
            d="M 50,200 L 50,195 L 140,165 L 230,120 L 320,80 L 410,40 L 500,140 L 590,160 L 680,120 L 680,220 L 50,220 Z"
            fill="url(#purpleGradient)"
          />

          {/* Curve 1: Dark Solid Line with Dots */}
          <path
            d="M 50,195 L 140,165 L 230,120 L 320,80 L 410,40 L 500,140 L 590,160 L 680,120"
            fill="none"
            stroke="currentColor"
            className="text-slate-900 dark:text-white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Curve 2: Dashed Secondary Line (API calls) */}
          <path
            d="M 50,210 L 140,190 L 230,170 L 320,130 L 410,130 L 500,110 L 590,120 L 680,140"
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />

          {/* Circular Data Points on Curve 1 */}
          <circle cx="50" cy="195" r="4.5" className="fill-white stroke-slate-900 dark:stroke-white stroke-2" />
          <circle cx="140" cy="165" r="4.5" className="fill-white stroke-slate-900 dark:stroke-white stroke-2" />
          <circle cx="230" cy="120" r="4.5" className="fill-white stroke-slate-900 dark:stroke-white stroke-2" />
          <circle cx="320" cy="80" r="4.5" className="fill-white stroke-slate-900 dark:stroke-white stroke-2" />
          {/* Peak Point (Dark Dot) */}
          <circle cx="410" cy="40" r="6" className="fill-slate-900 dark:fill-white stroke-white dark:stroke-slate-900 stroke-2 shadow-lg" />
          <circle cx="500" cy="140" r="4.5" className="fill-white stroke-slate-900 dark:stroke-white stroke-2" />
          <circle cx="590" cy="160" r="4.5" className="fill-white stroke-slate-900 dark:stroke-white stroke-2" />
          <circle cx="680" cy="120" r="4.5" className="fill-white stroke-slate-900 dark:stroke-white stroke-2" />
        </svg>

        {/* X Axis Month Labels */}
        <div className="flex justify-between pl-8 pr-3 pt-2 text-[11px] font-medium text-slate-400">
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
