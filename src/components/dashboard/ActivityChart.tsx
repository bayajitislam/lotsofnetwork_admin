"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";

import { AdminStats } from "@/lib/api";

interface ActivityChartProps {
  stats?: AdminStats | null;
}

export function ActivityChart({ stats }: ActivityChartProps) {
  const activityData = stats?.monthly_activity && stats.monthly_activity.length > 0
    ? stats.monthly_activity
    : [
        { month: "Apr", tools_queries: 0, api_queries: 0, earnings: 0 },
        { month: "May", tools_queries: 0, api_queries: 0, earnings: 0 },
        { month: "Jun", tools_queries: 0, api_queries: 0, earnings: 0 },
        { month: "Jul", tools_queries: 0, api_queries: 0, earnings: 0 },
        { month: "Aug", tools_queries: 0, api_queries: 0, earnings: 0 },
        { month: "Sep", tools_queries: 0, api_queries: 0, earnings: 0 },
      ];

  const months = activityData.map((d) => d.month);
  const totalRevenue = stats ? `$${stats.total_earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00";
  const totalQueries = activityData.reduce((acc, m) => acc + m.tools_queries + m.api_queries, 0);

  // Dynamic SVG curve coordinate mapping
  const rawMax = Math.max(...activityData.map((d) => Math.max(d.tools_queries, d.api_queries)), 10);
  const maxQueries = Math.ceil(rawMax / 10) * 10;

  const startX = 60;
  const endX = 660;
  const stepX = activityData.length > 1 ? (endX - startX) / (activityData.length - 1) : 0;
  const bottomY = 200;
  const topY = 40;
  const hRange = bottomY - topY;

  const points1 = activityData.map((d, i) => ({
    x: startX + i * stepX,
    y: bottomY - (d.tools_queries / maxQueries) * hRange,
    queries: d.tools_queries,
  }));

  const points2 = activityData.map((d, i) => ({
    x: startX + i * stepX,
    y: bottomY - (d.api_queries / maxQueries) * hRange,
    queries: d.api_queries,
  }));

  const path1 = points1.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area1 = points1.length > 0 
    ? `${path1} L ${points1[points1.length - 1].x.toFixed(1)},${bottomY} L ${points1[0].x.toFixed(1)},${bottomY} Z`
    : "";
  const path2 = points2.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Identify peak point on curve 1
  let peakIndex = 0;
  let maxToolQueries = -1;
  points1.forEach((p, idx) => {
    if (p.queries > maxToolQueries) {
      maxToolQueries = p.queries;
      peakIndex = idx;
    }
  });

  const latestPoint = points1[points1.length - 1] || { x: 350, y: 120 };
  const latestMonth = activityData[activityData.length - 1];

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
        
        {/* Dynamic Highlighted Tooltip over latest active point */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-full z-10 flex flex-col items-center pointer-events-none transition-all duration-300"
          style={{
            left: `${(latestPoint.x / 700) * 100}%`,
            top: `${(Math.max(latestPoint.y - 12, 30) / 240) * 100}%`
          }}
        >
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-lg flex items-center gap-1">
            <span>{totalRevenue}</span>
            <span className="text-[10px] opacity-75">({(latestMonth?.tools_queries ?? 0).toLocaleString()} Queries)</span>
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
          <line x1="40" y1="40" x2="700" y2="40" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="4 4" />
          <line x1="40" y1="90" x2="700" y2="90" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="4 4" />
          <line x1="40" y1="140" x2="700" y2="140" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="4 4" />
          <line x1="40" y1="190" x2="700" y2="190" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeDasharray="4 4" />

          {/* Y Axis Labels */}
          <text x="0" y="45" className="text-[10px] fill-slate-400">{maxQueries.toLocaleString()}</text>
          <text x="0" y="95" className="text-[10px] fill-slate-400">{Math.round(maxQueries * 0.66).toLocaleString()}</text>
          <text x="0" y="145" className="text-[10px] fill-slate-400">{Math.round(maxQueries * 0.33).toLocaleString()}</text>
          <text x="0" y="195" className="text-[10px] fill-slate-400">0</text>

          {/* Shaded Area for Curve 1 */}
          {area1 && (
            <path
              d={area1}
              fill="url(#purpleGradient)"
            />
          )}

          {/* Curve 1: Dark Solid Line with Dots */}
          {path1 && (
            <path
              d={path1}
              fill="none"
              stroke="currentColor"
              className="text-slate-900 dark:text-white transition-all duration-500"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Curve 2: Dashed Secondary Line (API calls) */}
          {path2 && (
            <path
              d={path2}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}

          {/* Circular Data Points on Curve 1 */}
          {points1.map((p, idx) => {
            const isPeak = idx === peakIndex && p.queries > 0;
            return (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={isPeak ? 6 : 4.5}
                className={
                  isPeak
                    ? "fill-slate-900 dark:fill-white stroke-white dark:stroke-slate-900 stroke-2 shadow-lg"
                    : "fill-white stroke-slate-900 dark:stroke-white stroke-2"
                }
              />
            );
          })}
        </svg>

        {/* X Axis Month Labels */}
        <div className="flex justify-between pl-10 pr-3 pt-2 text-[11px] font-medium text-slate-400">
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
