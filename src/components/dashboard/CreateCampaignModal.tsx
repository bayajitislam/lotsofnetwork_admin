"use client";

import React, { useState } from "react";
import { X, Sparkles, Megaphone, Link as LinkIcon, Target, Layers, DollarSign } from "lucide-react";
import { adminApi, Campaign } from "@/lib/api";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCampaign: Campaign) => void;
  token?: string | null;
}

export function CreateCampaignModal({ isOpen, onClose, onSuccess, token }: CreateCampaignModalProps) {
  const [name, setName] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [slot, setSlot] = useState("tool_header");
  const [payoutType, setPayoutType] = useState("CPA");
  const [targetImpressions, setTargetImpressions] = useState(50000);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !sponsor.trim() || !targetUrl.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      if (!token) {
        // Fallback demo mock if visitor not logged in
        const mockCampaign: Campaign = {
          id: `camp-${Date.now()}`,
          name: name.trim(),
          sponsor: sponsor.trim(),
          target_url: targetUrl.trim(),
          slot,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          payout_type: payoutType,
          target_impressions: targetImpressions,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        onSuccess(mockCampaign);
        onClose();
        return;
      }

      const created = await adminApi.createCampaign(token, {
        name: name.trim(),
        sponsor: sponsor.trim(),
        target_url: targetUrl.trim(),
        slot,
        target_impressions: Number(targetImpressions),
        payout_type: payoutType,
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to create campaign.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Launch Sponsor Campaign
              </h3>
              <p className="text-xs text-slate-500">
                Deploy affiliate tracking link or partner banner slot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Hostinger Cloud VPS Fall Special"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Sponsor Brand *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Hostinger"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                Banner Placement Slot
              </label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="tool_header">Tool Header Slot (Above IP Lookup)</option>
                <option value="sidebar_banner">Sidebar Sticky Banner</option>
                <option value="footer_sponsor">Footer Global Sponsor</option>
                <option value="in_content">In-Tool Native Recommendation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Payout Model
              </label>
              <select
                value={payoutType}
                onChange={(e) => setPayoutType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="CPA">CPA - Cost Per Acquisition</option>
                <option value="CPC">CPC - Cost Per Click</option>
                <option value="Fixed Sponsor">Fixed Monthly Sponsor</option>
                <option value="RevShare">Revenue Share (Tiered)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-500" />
                Target Impression Cap
              </label>
              <input
                type="number"
                min={1}
                step="any"
                value={targetImpressions}
                onChange={(e) => setTargetImpressions(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-purple-500" />
              Target Affiliate / Referral URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com?ref=lotsofnetwork"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? "Publishing..." : "Launch Campaign"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
