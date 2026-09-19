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
  Layers,
  Sparkles,
  Check
} from "lucide-react";
import { Campaign, adminApi, adsApi } from "@/lib/api";

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
  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

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

  const handleTestImpression = async (camp: Campaign) => {
    try {
      const res = await adsApi.recordImpression(camp.id);
      onCampaignUpdated({ ...camp, impressions: res.impressions });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestClick = async (camp: Campaign) => {
    try {
      const res = await adsApi.recordClick(camp.id);
      onCampaignUpdated({ ...camp, clicks: res.clicks });
    } catch (e) {
      console.error(e);
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
      {/* Top Banner Stats: Pure Impression & Click Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Delivered Impressions */}
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
            <span className="text-xs font-bold text-blue-500">Edge Deduped</span>
          </div>
        </div>

        {/* Card 2: Outbound Referral Clicks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Outbound Referral Clicks</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalClicks.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-indigo-500">Verified</span>
          </div>
        </div>

        {/* Card 3: Average Click-Through Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average CTR</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {avgCtr}%
            </span>
            <span className="text-xs font-bold text-emerald-500">Conversion Rate</span>
          </div>
        </div>

        {/* Card 4: Active Campaigns */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Campaigns</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {activeCount}
            </span>
            <span className="text-xs font-bold text-purple-500">of {campaigns.length} Total</span>
          </div>
        </div>
      </div>

      {/* Main Campaign Management Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-purple-500" />
              <span>Sponsor & Ad Campaigns</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track live impressions, referral clicks, and click-through rates across all placement slots
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
                <th className="pb-3">Slot</th>
                <th className="pb-3">Delivered Imp</th>
                <th className="pb-3">Referral Clicks</th>
                <th className="pb-3">CTR (%)</th>
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
                          <span>Visit URL</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    <td className="py-4">
                      <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                        {camp.slot}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {camp.impressions.toLocaleString()}
                      </div>
                      <div className="w-24 bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {progress}% of target
                      </span>
                    </td>

                    <td className="py-4 font-semibold text-slate-900 dark:text-white">
                      {camp.clicks.toLocaleString()}
                    </td>

                    <td className="py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {ctr}%
                    </td>

                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          camp.status === "active"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-white/5 text-slate-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            camp.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {camp.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(camp)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                          title={camp.status === "active" ? "Pause Campaign" : "Resume Campaign"}
                        >
                          {camp.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        
                        {/* Live Delivery Test Actions */}
                        <button
                          onClick={() => handleTestImpression(camp)}
                          className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[10px] font-bold rounded-md transition cursor-pointer"
                          title="Trigger live impression ping"
                        >
                          +1 Imp
                        </button>
                        <button
                          onClick={() => handleTestClick(camp)}
                          className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 text-[10px] font-bold rounded-md transition cursor-pointer"
                          title="Trigger live referral click"
                        >
                          +1 Click
                        </button>

                        <button
                          onClick={() => handleDelete(camp.id)}
                          className="p-1.5 text-red-400 hover:text-red-500 transition cursor-pointer"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
