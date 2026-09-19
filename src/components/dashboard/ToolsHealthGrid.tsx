"use client";

import React from "react";
import { Activity, CheckCircle2, ArrowUpRight } from "lucide-react";

export function ToolsHealthGrid() {
  const tools = [
    { name: "IP Lookup", path: "/ip-lookup", latency: "14ms", status: "Optimal", reqs: "1,420/h" },
    { name: "Subnet Calculator", path: "/subnet-calculator", latency: "2ms", status: "Optimal", reqs: "3,890/h" },
    { name: "DNS Lookup", path: "/dns-lookup", latency: "28ms", status: "Optimal", reqs: "840/h" },
    { name: "Port Checker", path: "/port-checker", latency: "82ms", status: "Optimal", reqs: "510/h" },
    { name: "Whois Lookup", path: "/whois-lookup", latency: "120ms", status: "Optimal", reqs: "620/h" },
    { name: "JSON Formatter", path: "/json-formatter", latency: "1ms", status: "Optimal", reqs: "2,190/h" },
    { name: "UUID v4/v7", path: "/uuid-generator", latency: "1ms", status: "Optimal", reqs: "940/h" },
    { name: "HTTP Header Checker", path: "/http-headers", latency: "65ms", status: "Optimal", reqs: "410/h" },
  ];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span>Core Network Tools Telemetry</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time execution latency across edge nodes
          </p>
        </div>

        <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          22 / 22 Online
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tools.map((t, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between hover:border-blue-500/40 transition"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</p>
              <p className="text-[10px] font-mono text-slate-400">{t.path}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{t.latency}</span>
              <p className="text-[10px] text-slate-400 font-mono">{t.reqs}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
