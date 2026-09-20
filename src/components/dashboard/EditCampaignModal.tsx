"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Save, 
  Megaphone, 
  Link as LinkIcon, 
  Target, 
  Layers, 
  DollarSign, 
  ImageIcon, 
  UploadCloud, 
  Check, 
  ExternalLink,
  Eye,
  Maximize2,
  Activity
} from "lucide-react";
import { adminApi, Campaign, API_BASE_URL } from "@/lib/api";

interface EditCampaignModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCampaign: Campaign) => void;
  token?: string | null;
}

interface AdDimensionPreset {
  id: string;
  name: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  recommendedFor: string[];
}

const AD_DIMENSIONS: AdDimensionPreset[] = [
  { id: "728x90", name: "Leaderboard", label: "728 × 90", width: 728, height: 90, aspectRatio: "728 / 90", recommendedFor: ["tool_header", "footer_sponsor"] },
  { id: "300x250", name: "Medium Rectangle", label: "300 × 250", width: 300, height: 250, aspectRatio: "300 / 250", recommendedFor: ["sidebar_banner", "in_content"] },
  { id: "300x600", name: "Half Page / Skyscraper", label: "300 × 600", width: 300, height: 600, aspectRatio: "300 / 600", recommendedFor: ["sidebar_banner"] },
  { id: "970x90", name: "Billboard / Large", label: "970 × 90", width: 970, height: 90, aspectRatio: "970 / 90", recommendedFor: ["tool_header", "footer_sponsor"] },
  { id: "320x100", name: "Large Mobile Banner", label: "320 × 100", width: 320, height: 100, aspectRatio: "320 / 100", recommendedFor: ["tool_header", "sidebar_banner", "footer_sponsor", "in_content"] },
  { id: "custom", name: "Custom Size", label: "Custom", width: 0, height: 0, aspectRatio: "auto", recommendedFor: [] },
];

export function EditCampaignModal({ campaign, isOpen, onClose, onSuccess, token }: EditCampaignModalProps) {
  const [name, setName] = useState(campaign.name);
  const [sponsor, setSponsor] = useState(campaign.sponsor);
  const [targetUrl, setTargetUrl] = useState(campaign.target_url);
  const [slot, setSlot] = useState(campaign.slot);
  const [status, setStatus] = useState<"active" | "paused" | "completed">(campaign.status);
  const [payoutType, setPayoutType] = useState(campaign.payout_type || "CPA");
  const [targetImpressions, setTargetImpressions] = useState(campaign.target_impressions || 50000);

  // Creative & Dimensions state
  const initialDim = campaign.image_dimensions || "728x90";
  const isKnownPreset = AD_DIMENSIONS.some(d => d.id === initialDim);
  const [dimensionId, setDimensionId] = useState(isKnownPreset ? initialDim : "custom");
  const [customWidth, setCustomWidth] = useState(() => {
    if (!isKnownPreset && initialDim.includes("x")) {
      return Number(initialDim.split("x")[0]) || 728;
    }
    return 728;
  });
  const [customHeight, setCustomHeight] = useState(() => {
    if (!isKnownPreset && initialDim.includes("x")) {
      return Number(initialDim.split("x")[1]) || 90;
    }
    return 90;
  });

  const [imageSourceType, setImageSourceType] = useState<"url" | "upload">("url");
  const [imageUrl, setImageUrl] = useState(campaign.image_url || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset form if campaign changes
  useEffect(() => {
    setName(campaign.name);
    setSponsor(campaign.sponsor);
    setTargetUrl(campaign.target_url);
    setSlot(campaign.slot);
    setStatus(campaign.status);
    setPayoutType(campaign.payout_type || "CPA");
    setTargetImpressions(campaign.target_impressions || 50000);
    setImageUrl(campaign.image_url || "");
    const dim = campaign.image_dimensions || "728x90";
    if (AD_DIMENSIONS.some(d => d.id === dim)) {
      setDimensionId(dim);
    } else {
      setDimensionId("custom");
      if (dim.includes("x")) {
        setCustomWidth(Number(dim.split("x")[0]) || 728);
        setCustomHeight(Number(dim.split("x")[1]) || 90);
      }
    }
    setSelectedFile(null);
    setFilePreview(null);
    setError(null);
  }, [campaign]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (.png, .jpg, .webp, .gif, .svg)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds maximum allowed limit of 5MB");
      return;
    }

    setError(null);
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
  };

  if (!isOpen) return null;

  const activeDimensionStr = dimensionId === "custom" 
    ? `${customWidth}x${customHeight}` 
    : dimensionId;

  const activePreset = AD_DIMENSIONS.find(d => d.id === dimensionId);
  const previewImage = imageSourceType === "upload" ? (filePreview || imageUrl) : (imageUrl.trim() || campaign.image_url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !sponsor.trim() || !targetUrl.trim()) {
      setError("Please fill in all required fields (Campaign Name, Sponsor Brand, Target URL).");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl: string | null = campaign.image_url || null;

      // Handle media upload if new file was selected
      if (imageSourceType === "upload" && selectedFile) {
        setUploadProgress(true);
        if (token) {
          try {
            const uploadRes = await adminApi.uploadMedia(token, selectedFile);
            finalImageUrl = uploadRes.url.startsWith("http")
              ? uploadRes.url
              : `${API_BASE_URL}${uploadRes.url.startsWith("/") ? "" : "/"}${uploadRes.url}`;
          } catch (uploadErr: any) {
            console.warn("Upload endpoint failed, falling back to preview URL", uploadErr);
            finalImageUrl = filePreview;
          }
        } else {
          finalImageUrl = filePreview;
        }
        setUploadProgress(false);
      } else if (imageSourceType === "url") {
        finalImageUrl = imageUrl.trim() || null;
      }

      if (!token) {
        // Mock fallback if logged out
        const updated: Campaign = {
          ...campaign,
          name: name.trim(),
          sponsor: sponsor.trim(),
          target_url: targetUrl.trim(),
          image_url: finalImageUrl,
          image_dimensions: activeDimensionStr,
          slot,
          status,
          payout_type: payoutType,
          target_impressions: targetImpressions,
          updated_at: new Date().toISOString(),
        };
        onSuccess(updated);
        onClose();
        return;
      }

      const updated = await adminApi.updateCampaign(token, campaign.id, {
        name: name.trim(),
        sponsor: sponsor.trim(),
        target_url: targetUrl.trim(),
        image_url: finalImageUrl,
        image_dimensions: activeDimensionStr,
        slot,
        status,
        payout_type: payoutType,
        target_impressions: targetImpressions,
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to update campaign.");
    } finally {
      setSubmitting(false);
      setUploadProgress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
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
                Edit Sponsor Campaign
              </h3>
              <p className="text-xs text-slate-500">
                Update campaign settings, ad creative banner, sizing, and target link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Sponsor Brand *
              </label>
              <input
                type="text"
                required
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                Placement Slot
              </label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="tool_header">Tool Header Slot</option>
                <option value="sidebar_banner">Sidebar Sticky Banner</option>
                <option value="footer_sponsor">Footer Global Sponsor</option>
                <option value="in_content">In-Tool Native Recommendation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">Active (Delivering)</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-purple-500" />
                Target Affiliate / Referral URL *
              </label>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
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

          {/* ============================================================= */}
          {/* STANDARD AD DIMENSIONS PRESETS */}
          {/* ============================================================= */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-purple-500" />
                Standard Ad Dimension (IAB Standards)
              </label>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {activeDimensionStr} px
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AD_DIMENSIONS.map((preset) => {
                const isSelected = dimensionId === preset.id;
                const isRecommended = preset.recommendedFor.includes(slot);

                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => setDimensionId(preset.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold font-mono">{preset.label}</span>
                      {isSelected ? (
                        <Check className="w-3 h-3 text-purple-500" />
                      ) : isRecommended ? (
                        <span className="text-[9px] px-1 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                          Best fit
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {dimensionId === "custom" && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-slate-500">Width (px)</label>
                  <input
                    type="number"
                    min={50}
                    max={2000}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                </div>
                <span className="text-slate-400 font-bold self-end pb-2">×</span>
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-slate-500">Height (px)</label>
                  <input
                    type="number"
                    min={20}
                    max={2000}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ============================================================= */}
          {/* AD CREATIVE IMAGE (URL OR UPLOAD) */}
          {/* ============================================================= */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                Update Ad Creative Image
              </label>

              {/* Source Switcher */}
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-white/5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setImageSourceType("url")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    imageSourceType === "url"
                      ? "bg-white dark:bg-[#1a2333] text-purple-600 dark:text-purple-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-white"
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceType("upload")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    imageSourceType === "upload"
                      ? "bg-white dark:bg-[#1a2333] text-purple-600 dark:text-purple-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-white"
                  }`}
                >
                  Upload New File
                </button>
              </div>
            </div>

            {imageSourceType === "url" ? (
              <div className="space-y-1">
                <input
                  type="url"
                  placeholder="https://cdn.example.com/banners/ad_728x90.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Update external CDN banner URL or image link
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-purple-500/50 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50 dark:bg-white/[0.02]"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {selectedFile ? selectedFile.name : "Click to select new banner creative"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, WebP, GIF, SVG up to 5MB (Synced via Cloudinary CDN)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* LIVE AD CREATIVE VISUAL PREVIEW */}
            {/* ========================================================= */}
            <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-purple-500" />
                  Live Banner Preview ({activeDimensionStr})
                </span>
                {targetUrl && (
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-200/50 dark:bg-black/40 border border-slate-200 dark:border-white/5 overflow-hidden min-h-24">
                {previewImage ? (
                  <div 
                    className="relative max-w-full max-h-40 rounded-lg overflow-hidden border border-slate-300 dark:border-white/10 shadow-md group"
                    style={{
                      aspectRatio: activePreset?.aspectRatio || `${customWidth}/${customHeight}`,
                    }}
                  >
                    <img
                      src={previewImage}
                      alt="Ad Preview Creative"
                      className="w-full h-full object-cover"
                      onError={() => setError("Preview failed to load. Check that the image URL is publicly accessible.")}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold">
                      {sponsor || "Sponsor"} • {activeDimensionStr}
                    </div>
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-sm bg-black/70 text-[9px] font-mono text-white">
                      Ad • {activeDimensionStr}
                    </span>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center p-4 text-center rounded-lg border border-dashed border-slate-300 dark:border-white/10 w-full max-h-32 text-slate-400 text-xs"
                    style={{
                      aspectRatio: activePreset?.aspectRatio || `${customWidth}/${customHeight}`,
                    }}
                  >
                    <ImageIcon className="w-5 h-5 mb-1 opacity-40" />
                    <span className="font-semibold text-[11px]">Creative Banner Preview</span>
                    <span className="text-[10px] opacity-70">
                      Standard {activePreset?.name || "Banner"} ({activeDimensionStr})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {uploadProgress ? "Uploading Creative..." : submitting ? "Saving..." : "Save Changes"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
