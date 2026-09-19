"use client";

import React, { useState } from "react";
import { 
  Megaphone, 
  Plus, 
  ExternalLink, 
  Play, 
  Pause, 
  Trash2, 
  MousePointerClick, 
  Eye, 
  Percent, 
  DollarSign,
  Layers,
  Sparkles
} from "lucide-react";
import { Campaign, adminApi } from "@/lib/api";

interface AdEngineViewProps {
  campaigns: Campaign[];
  onOpenCreateModal: () => void;
  onCampaignUpdated: (updated: Campaign) => void;
  onCampaignDeleted: (id: string) => void;
  token?: string | null;
}

export function AdEngineView({
  campaigns,
  onOpenCreateModal,
  onCampaignUpdated,
  onCampaignDeleted,
  token,
}: AdEngineViewProps) {
  const [filterSlot, setFilterSlot] = useState<string>("all");

  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const estimatedRevenue = (totalClicks * 1.85 + (totalImpressions / 1000) * 4.2).toFixed(2);

  const filteredCampaigns = filterSlot === "all" 
    ? campaigns 
    : campaigns.filter((c) => c.slot === filterSlot);

  const handleToggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    if (token) {
      try {
        const res = await adminApi.updateCampaign(token, campaign.id, { status: newStatus });
        onCampaignUpdated(res);
      } catch (e) {
        console.error("Failed to update status", e);
      }
    } else {
      onCampaignUpdated({ ...campaign, status: newStatus });
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    if (token) {
      try {
        await adminApi.deleteCampaign(token, campaignId);
        onCampaignDeleted(campaignId);
      } catch (e) {
        console.error("Failed to delete campaign", e);
      }
    } else {
      onCampaignDeleted(campaignId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Delivered Impressions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalImpressions.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-500">+14.2%</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Affiliate Clicks</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalClicks.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-500">+8.6%</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average CTR</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {avgCtr}%
            </span>
            <span className="text-xs font-bold text-purple-500">High Quality</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Estimated Yield</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ${estimatedRevenue}
            </span>
            <span className="text-xs font-bold text-emerald-500">eCPM $4.20</span>
          </div>
        </div>
      </div>

      {/* Main Campaign Management Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-500" />
              Active Sponsor Campaigns & Monetization Slots
            </h3>
            <p className="text-xs text-slate-500">
              Live banner slots, target quotas, and affiliate click-through performance across Lots of Network
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterSlot}
              onChange={(e) => setFilterSlot(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Placement Slots</option>
              <option value="tool_header">Tool Header Slot</option>
              <option value="sidebar_banner">Sidebar Sticky Banner</option>
              <option value="footer_sponsor">Footer Global Sponsor</option>
            </select>

            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Campaign</span>
            </button>
          </div>
        </div>

        {/* Campaigns List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Campaign & Sponsor</th>
                <th className="pb-3">Slot Placement</th>
                <th className="pb-3">Impression Progress</th>
                <th className="pb-3">Clicks & CTR</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredCampaigns.map((camp) => {
                const progress = Math.min(100, Math.round((camp.impressions / camp.target_impressions) * 100));
                const ctr = camp.impressions > 0 ? ((camp.clicks / camp.impressions) * 100).toFixed(2) : "0.00";

                return (
                  <tr key={camp.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                    <td className="py-4 pl-2">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {camp.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px]">
                        <span>{camp.sponsor}</span>
                        <span>•</span>
                        <a
                          href={camp.target_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-0.5"
                        >
                          Target Link <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </div>
                    </td>

                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-semibold">
                        <Layers className="w-3 h-3 text-purple-400" />
                        {camp.slot}
                      </span>
                    </td>

                    <td className="py-4 w-48">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {camp.impressions.toLocaleString()}
                        </span>
                        <span className="text-slate-400">
                          / {camp.target_impressions.toLocaleString()} ({progress}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {camp.clicks.toLocaleString()} clicks
                      </div>
                      <div className="text-[11px] text-emerald-500 font-bold">
                        {ctr}% CTR
                      </div>
                    </td>

                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          camp.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${camp.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {camp.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 pr-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(camp)}
                          title={camp.status === "active" ? "Pause campaign" : "Resume campaign"}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                        >
                          {camp.status === "active" ? (
                            <Pause className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Play className="w-4 h-4 text-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(camp.id)}
                          title="Delete campaign"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
