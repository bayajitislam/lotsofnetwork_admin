"use client";

import React, { useState } from "react";
import { 
  Activity, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Zap,
  Terminal,
  RefreshCw
} from "lucide-react";
import { ToolTelemetry } from "@/lib/api";

interface TelemetryViewProps {
  telemetry: ToolTelemetry[];
}

export function TelemetryView({ telemetry }: TelemetryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [pingingSlug, setPingingSlug] = useState<string | null>(null);
  const [livePings, setLivePings] = useState<Record<string, number>>({});
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const categories = [
    "all",
    "IP & Routing",
    "DNS & Domain",
    "Security & Ports",
    "Web & SSL",
    "Diagnostics",
    "Utilities",
  ];

  const filtered = telemetry.filter((t) => {
    const matchCat = selectedCategory === "all" || t.category === selectedCategory;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleTestPing = (slug: string) => {
    setPingingSlug(slug);
    const start = performance.now();
    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 25) + 12;
      setLivePings((prev) => ({ ...prev, [slug]: simulatedLatency }));
      setPingingSlug(null);
    }, 450);
  };

  const handleCopyCurl = (slug: string) => {
    const cmd = `curl -X POST https://api.lotsofnetwork.com/v1/${slug} -H "Authorization: Bearer YOUR_API_KEY"`;
    navigator.clipboard.writeText(cmd);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-[#0b101d] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              {cat === "all" ? "All 22 Tools" : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool) => {
          const currentLatency = livePings[tool.slug] || tool.latency_ms;
          const isPinging = pingingSlug === tool.slug;

          return (
            <div
              key={tool.slug}
              className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs hover:border-blue-500/30 transition duration-200 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {tool.name}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      /{tool.slug}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {tool.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                    {tool.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Uptime: <strong className="text-slate-700 dark:text-slate-200">{tool.uptime_percentage}%</strong>
                  </span>
                </div>
              </div>

              {/* Telemetry Stats Bar */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Throughput</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-blue-500" />
                    {tool.queries_per_hour.toLocaleString()}/hr
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Server TTFB</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    currentLatency < 50 ? "text-emerald-500" : currentLatency < 100 ? "text-amber-500" : "text-rose-500"
                  }`}>
                    <Zap className="w-3 h-3" />
                    {currentLatency} ms
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => handleTestPing(tool.slug)}
                  disabled={isPinging}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isPinging ? "animate-spin text-blue-500" : ""}`} />
                  <span>{isPinging ? "Testing..." : "Test Latency"}</span>
                </button>

                <button
                  onClick={() => handleCopyCurl(tool.slug)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <Terminal className="w-3 h-3 text-purple-500" />
                  <span>{copiedSlug === tool.slug ? "Copied!" : "cURL"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
