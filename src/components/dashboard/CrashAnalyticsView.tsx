"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  Clock, 
  Filter, 
  ShieldAlert,
  Code
} from "lucide-react";
import { CrashLog } from "@/lib/api";

interface CrashAnalyticsViewProps {
  logs: CrashLog[];
}

export function CrashAnalyticsView({ logs }: CrashAnalyticsViewProps) {
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedLog, setSelectedLog] = useState<CrashLog | null>(null);

  const filtered = selectedSeverity === "all"
    ? logs
    : logs.filter(l => l.severity === selectedSeverity);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Tool Crash & Exception Telemetry
          </h3>
          <p className="text-xs text-slate-500">
            Real-time capture of DNS timeouts, TCP socket drops, and client-side tool errors
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["all", "warning", "error"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                selectedSeverity === sev
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          {filtered.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                selectedLog?.id === log.id
                  ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-500/40 shadow-xs"
                  : "bg-white dark:bg-[#0b101d] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    log.severity === "error"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}>
                    {log.severity}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {log.tool}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {log.timestamp}
                </span>
              </div>

              <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">
                {log.message}
              </p>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Client: {log.ip_truncated}</span>
                <span className="text-blue-500">View Stack Trace →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stack Trace Preview Pane */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 p-5 rounded-3xl bg-[#090d16] text-white border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-purple-400" />
                Exception Diagnostics
              </span>
              {selectedLog && (
                <span className="text-[10px] font-mono text-slate-500">
                  {selectedLog.id}
                </span>
              )}
            </div>

            {selectedLog ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Affected Endpoint</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{selectedLog.tool}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Error Message</span>
                  <p className="text-xs text-rose-300 font-medium">{selectedLog.message}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Stack Trace</span>
                  <div className="mt-1.5 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
                    {selectedLog.stack_preview}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select an exception log on the left to inspect call stack and root cause.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
