"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  Clock, 
  Filter, 
  ShieldAlert,
  Code,
  Flame
} from "lucide-react";
import { CrashLog, adminApi } from "@/lib/api";

interface CrashAnalyticsViewProps {
  logs: CrashLog[];
  token?: string | null;
  onLogUpdated?: (log: CrashLog) => void;
  onReloadLogs?: (logs: CrashLog[]) => void;
}

export function CrashAnalyticsView({ logs, token, onLogUpdated, onReloadLogs }: CrashAnalyticsViewProps) {
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedLog, setSelectedLog] = useState<CrashLog | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleResolveLog = async (log: CrashLog) => {
    if (!token) return;
    try {
      const nextResolved = !log.resolved;
      await adminApi.resolveCrashLog(token, log.id, nextResolved);
      const updated = { ...log, resolved: nextResolved };
      setSelectedLog(updated);
      if (onLogUpdated) onLogUpdated(updated);
    } catch (e) {
      console.error("Failed to resolve crash log", e);
    }
  };

  const handleSimulateCrash = async () => {
    if (!token || isSimulating) return;
    setIsSimulating(true);
    try {
      await adminApi.simulateCrash(token);
      const freshLogs = await adminApi.getCrashLogs(token);
      if (onReloadLogs) onReloadLogs(freshLogs);
    } catch (e) {
      console.error("Simulation triggered", e);
    } finally {
      setIsSimulating(false);
    }
  };

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
            Real-time capture of DNS timeouts, TCP socket drops, and unhandled server exceptions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Diagnostic Simulation Button */}
          <button
            onClick={handleSimulateCrash}
            disabled={isSimulating}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Trigger diagnostic exception to test real-time crash capture pipeline"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isSimulating ? "Injecting Error..." : "Simulate Diagnostic Crash"}</span>
          </button>

          <div className="flex items-center gap-2">
            {["all", "high", "medium", "low"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
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
      </div>

      {/* Logs Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {filtered.length === 0 ? (
          <div className="lg:col-span-7 p-12 text-center rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 space-y-3 flex flex-col items-center justify-center min-h-[300px]">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zero Exceptions Recorded</h4>
            <p className="text-xs text-slate-500 max-w-sm">All active networking engines are operating with 100% stability. Real error tracebacks stream directly from SQLite when triggered.</p>
          </div>
        ) : (
          <div className="lg:col-span-7 space-y-3">
            {filtered.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-5 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-slate-50 dark:bg-white/5 border-purple-500/50 shadow-md"
                      : "bg-white dark:bg-[#0b101d] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.severity === "high"
                          ? "bg-red-500/10 text-red-500"
                          : log.severity === "medium"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}>
                        {log.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                        {log.tool}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-mono">
                    {log.message}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-[11px]">
                    <span className="text-slate-400 font-mono">IP: {log.ip_truncated}</span>
                    <span className={`flex items-center gap-1 font-semibold ${
                      log.resolved ? "text-emerald-500" : "text-amber-500"
                    }`}>
                      {log.resolved ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {log.resolved ? "Resolved" : "Action Required"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stack Trace Inspector Detail Pane */}
        <div className="lg:col-span-5">
          {selectedLog ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-500" />
                  <span>Exception Traceback</span>
                </h4>
                <button
                  onClick={() => handleResolveLog(selectedLog)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedLog.resolved
                      ? "bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs shadow-emerald-500/20"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedLog.resolved ? "Mark Unresolved" : "Mark Resolved"}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Component / Service:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedLog.tool}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Severity Level:</span>
                  <span className="font-bold uppercase tracking-wider text-red-500">{selectedLog.severity}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Recorded Timestamp:</span>
                  <span className="text-slate-600 dark:text-slate-300">{selectedLog.timestamp}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Client IP Signature:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">{selectedLog.ip_truncated}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Raw Stack Trace & Runtime Context
                </span>
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-[360px] border border-white/5 whitespace-pre-wrap leading-relaxed">
                  {selectedLog.stack_preview}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 space-y-2 flex flex-col items-center justify-center min-h-[250px]">
              <Code className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">No Exception Selected</h5>
              <p className="text-[11px] text-slate-400 max-w-xs">Select any log from the stream to view full stack trace and resolve status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
