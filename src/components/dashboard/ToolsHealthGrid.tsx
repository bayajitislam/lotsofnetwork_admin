"use client";

import React from "react";
import { Activity } from "lucide-react";
import { ToolTelemetry } from "@/lib/api";

interface ToolsHealthGridProps {
  telemetry?: ToolTelemetry[];
}

export function ToolsHealthGrid({ telemetry = [] }: ToolsHealthGridProps) {
  const onlineCount = telemetry.filter((t) => t.status === "online").length;
  const totalCount = telemetry.length;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span>Active Network Tools Telemetry</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time execution latency across edge nodes
          </p>
        </div>

        <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          {totalCount > 0 ? `${onlineCount} / ${totalCount} Online` : "0 / 0 Online"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {telemetry.map((t) => (
          <div
            key={t.slug}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between hover:border-blue-500/40 transition"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</p>
              <p className="text-[10px] font-mono text-slate-400">/{t.slug}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-mono font-bold ${
                t.latency_ms < 50 ? "text-emerald-600 dark:text-emerald-400" : t.latency_ms < 100 ? "text-amber-500" : "text-rose-500"
              }`}>
                {t.latency_ms}ms
              </span>
              <p className="text-[10px] text-slate-400 font-mono">{t.queries_per_hour.toLocaleString()}/h</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
