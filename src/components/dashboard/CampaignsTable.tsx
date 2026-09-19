"use client";

import React from "react";
import { MoreHorizontal, ArrowUpRight } from "lucide-react";
import { Campaign } from "@/lib/api";

interface CampaignsTableProps {
  campaigns?: Campaign[];
  onManageClick?: () => void;
}

export function CampaignsTable({ campaigns, onManageClick }: CampaignsTableProps) {
  const displayCampaigns = campaigns || [];

  const totalImpressions = displayCampaigns.reduce((acc, c) => acc + c.impressions, 0);

  const colors = ["bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Active Sponsor Campaigns
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Affiliate ads placed across active network tools
          </p>
        </div>

        {onManageClick && (
          <button 
            onClick={onManageClick}
            className="text-xs font-semibold text-blue-500 hover:underline cursor-pointer"
          >
            Manage All
          </button>
        )}
      </div>

      {/* Main KPI & Progress Bar */}
      <div className="my-4 space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalImpressions.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            +12.08% than last week
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          {displayCampaigns.slice(0, 3).map((c, i) => {
            const pct = totalImpressions > 0 ? (c.impressions / totalImpressions) * 100 : 33;
            const barColors = ["bg-purple-600", "bg-blue-400", "bg-emerald-400"];
            return (
              <div 
                key={c.id} 
                className={`h-full ${barColors[i % barColors.length]}`} 
                style={{ width: `${pct}%` }} 
              />
            );
          })}
        </div>
      </div>

      {/* Campaign Listing */}
      <div className="space-y-3 pt-1">
        {displayCampaigns.slice(0, 3).map((c, i) => {
          const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : "0.0";
          return (
            <div key={c.id} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Slot: {c.slot}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono font-bold text-slate-900 dark:text-white">{c.impressions.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{ctr}% CTR</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
