"use client";

import React from "react";
import { MoreHorizontal, ArrowUpRight, CheckCircle2 } from "lucide-react";

export function CampaignsTable() {
  const campaigns = [
    {
      name: "Hostinger Cloud VPS",
      placement: "IP Lookup & Subnet Top Slot",
      impressions: "15,480",
      ctr: "4.8%",
      color: "bg-purple-500",
    },
    {
      name: "DigitalOcean Droplets",
      placement: "Port Checker & DNS Sidebar",
      impressions: "8,920",
      ctr: "3.9%",
      color: "bg-blue-500",
    },
    {
      name: "BunnyCDN Edge Storage",
      placement: "HTTP Headers & Tools Footer",
      impressions: "6,254",
      ctr: "5.1%",
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Active Sponsor Campaigns
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Affiliate ads placed across 22 network tools
          </p>
        </div>

        <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Main KPI & Progress Bar */}
      <div className="my-4 space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            30,654
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            +12.08% than last week
          </span>
        </div>

        {/* Dual-color Progress Bar (Matching reference screenshot) */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          <div className="h-full bg-purple-600 w-[62%]" />
          <div className="h-full bg-blue-400 w-[24%]" />
          <div className="h-full bg-emerald-400 w-[14%]" />
        </div>
      </div>

      {/* Campaign Listing */}
      <div className="space-y-3 pt-1">
        {campaigns.map((c, i) => (
          <div key={i} className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                <p className="text-[11px] text-slate-400">{c.placement}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-mono font-bold text-slate-900 dark:text-white">{c.impressions}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{c.ctr} CTR</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
