"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  Sparkles,
  Zap,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Edit3,
  Copy,
  Check,
  X,
  AlertCircle,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Users
} from "lucide-react";
import {
  AdminSubscriptionItem,
  Plan,
  AdminStats,
  adminApi,
  ApiError
} from "@/lib/api";

interface SubscriptionsViewProps {
  subscriptions: AdminSubscriptionItem[];
  plans: Plan[];
  stats?: AdminStats | null;
  token?: string | null;
  onSubscriptionUpdated?: (updated: AdminSubscriptionItem) => void;
  onPlanUpdated?: (updated: Plan) => void;
  onRefresh?: () => void;
}

export function SubscriptionsView({
  subscriptions = [],
  plans = [],
  stats,
  token,
  onSubscriptionUpdated,
  onPlanUpdated,
  onRefresh,
}: SubscriptionsViewProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Override Tier Modal State
  const [selectedSubForOverride, setSelectedSubForOverride] = useState<AdminSubscriptionItem | null>(null);
  const [overridePlanSlug, setOverridePlanSlug] = useState("free");
  const [overrideReason, setOverrideReason] = useState("");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Edit Plan Config Modal State
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<Plan | null>(null);
  const [editPlanName, setEditPlanName] = useState("");
  const [editPlanDescription, setEditPlanDescription] = useState("");
  const [editPlanMonthlyLimit, setEditPlanMonthlyLimit] = useState(1000);
  const [editPlanRateLimitRpm, setEditPlanRateLimitRpm] = useState(60);
  const [editPlanPriceCents, setEditPlanPriceCents] = useState(0);
  const [isSubmittingPlanEdit, setIsSubmittingPlanEdit] = useState(false);
  const [planEditError, setPlanEditError] = useState<string | null>(null);

  // KPI Calculations
  const totalSubs = subscriptions.length;
  const paidSubs = useMemo(() => {
    return subscriptions.filter(
      (s) => (s.plan_slug === "pro" || s.plan_slug === "enterprise") && s.status === "active"
    ).length;
  }, [subscriptions]);

  const totalMRR = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + (s.price_cents || 0) / 100, 0);
  }, [subscriptions]);

  const totalQuotaAllocated = useMemo(() => {
    return subscriptions.reduce((sum, s) => sum + (s.monthly_limit || 1000), 0);
  }, [subscriptions]);

  // Subscriptions Count by Plan
  const planCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    subscriptions.forEach((s) => {
      counts[s.plan_slug] = (counts[s.plan_slug] || 0) + 1;
    });
    return counts;
  }, [subscriptions]);

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchTier = tierFilter === "all" || s.plan_slug === tierFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        (s.user_email && s.user_email.toLowerCase().includes(term)) ||
        (s.user_name && s.user_name.toLowerCase().includes(term)) ||
        (s.plan_name && s.plan_name.toLowerCase().includes(term)) ||
        (s.stripe_customer_id && s.stripe_customer_id.toLowerCase().includes(term)) ||
        (s.stripe_subscription_id && s.stripe_subscription_id.toLowerCase().includes(term));
      return matchTier && matchStatus && matchSearch;
    });
  }, [subscriptions, tierFilter, statusFilter, searchTerm]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleManualRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Open Override Modal
  const handleOpenOverride = (sub: AdminSubscriptionItem) => {
    setSelectedSubForOverride(sub);
    setOverridePlanSlug(sub.plan_slug);
    setOverrideReason(`Admin manual tier adjustment for ${sub.user_email || "developer"}`);
    setOverrideError(null);
  };

  // Submit Override
  const handleSubmitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedSubForOverride) return;

    setIsSubmittingOverride(true);
    setOverrideError(null);

    try {
      const updated = await adminApi.updateUserSubscription(token, selectedSubForOverride.user_id, {
        plan_slug: overridePlanSlug,
        reason: overrideReason.trim() || "Admin tier override",
      });
      if (onSubscriptionUpdated) {
        onSubscriptionUpdated(updated);
      }
      setSelectedSubForOverride(null);
    } catch (err: any) {
      console.error("Failed to override subscription:", err);
      setOverrideError(err?.detail || err?.message || "Failed to update subscription tier");
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  // Open Plan Edit Modal
  const handleOpenPlanEdit = (plan: Plan) => {
    setSelectedPlanForEdit(plan);
    setEditPlanName(plan.name);
    setEditPlanDescription(plan.description || "");
    setEditPlanMonthlyLimit(plan.monthly_limit);
    setEditPlanRateLimitRpm(plan.rate_limit_rpm);
    setEditPlanPriceCents(plan.price_cents);
    setPlanEditError(null);
  };

  // Submit Plan Edit
  const handleSubmitPlanEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedPlanForEdit) return;

    setIsSubmittingPlanEdit(true);
    setPlanEditError(null);

    try {
      const updated = await adminApi.updatePlan(token, selectedPlanForEdit.id, {
        name: editPlanName.trim(),
        description: editPlanDescription.trim() || undefined,
        monthly_limit: Number(editPlanMonthlyLimit),
        rate_limit_rpm: Number(editPlanRateLimitRpm),
        price_cents: Number(editPlanPriceCents),
      });
      if (onPlanUpdated) {
        onPlanUpdated(updated);
      }
      setSelectedPlanForEdit(null);
    } catch (err: any) {
      console.error("Failed to update plan configuration:", err);
      setPlanEditError(err?.detail || err?.message || "Failed to update plan config");
    } finally {
      setIsSubmittingPlanEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & KPI METRICS                             */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
            <span>Developer Subscriptions & Plan Tiers</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monetization engine, developer plan quotas, Stripe billing sync, and subscription overrides
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-500" : ""}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subscriptions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Subscriptions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalSubs}
            </span>
            <span className="text-xs text-slate-400 font-mono">developers</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold font-mono">100%</span>
            <span>registered developer accounts</span>
          </div>
        </div>

        {/* Active Paid Subscribers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Paid Subscribers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {paidSubs}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {totalSubs} ({totalSubs > 0 ? Math.round((paidSubs / totalSubs) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">Pro & Enterprise</span>
            <span>tier active plans</span>
          </div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Estimated MRR</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              ${totalMRR.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-mono">/month</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-purple-500 font-semibold">Stripe Recurring</span>
            <span>developer billing</span>
          </div>
        </div>

        {/* Total Monthly Capacity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total API Quota Capacity</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {(totalQuotaAllocated / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-slate-400 font-mono">reqs / mo</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-indigo-500 font-semibold">Global Quota</span>
            <span>enforced via Redis/DB</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PLAN TIERS CONFIGURATION CARDS                       */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Developer Plan Architecture</span>
          </h3>
          <span className="text-xs text-slate-400">
            Click &quot;Configure Limits&quot; to tune rate limits and monthly quotas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isPro = p.slug === "pro";
            const isEnterprise = p.slug === "enterprise";
            const subscribersCount = planCounts[p.slug] || 0;

            return (
              <div
                key={p.id}
                className={`p-5 rounded-3xl bg-white dark:bg-[#0b101d] border transition relative shadow-xs flex flex-col justify-between ${
                  isEnterprise
                    ? "border-indigo-500/30 dark:border-indigo-500/20 hover:border-indigo-500/50"
                    : isPro
                    ? "border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500/50"
                    : "border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isEnterprise
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                          : isPro
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {p.name}
                    </span>

                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {subscribersCount} active
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ${(p.price_cents / 100).toFixed(0)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/month</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-8">
                    {p.description || "Standard developer API access quota."}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        Monthly Limit
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {p.monthly_limit.toLocaleString()} reqs
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        Rate Limit
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {p.rate_limit_rpm} req/min
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Stripe Sync
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-32">
                        {p.stripe_price_id || "Direct / Free"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => handleOpenPlanEdit(p)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Configure Limits</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DEVELOPER SUBSCRIPTIONS TABLE                        */}
      {/* ======================================================== */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-5">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Developer Accounts & Active Subscriptions
            </h3>
            <p className="text-xs text-slate-500">
              Audit user billing records, view Stripe customer identifiers, and override subscription tiers
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Tier */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free Tier</option>
              <option value="pro">Pro Tier</option>
              <option value="enterprise">Enterprise Tier</option>
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>

            {/* Search */}
            <div className="relative w-56 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search email, user, Stripe ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Developer User</th>
                <th className="pb-3">Subscription Tier</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Quota Limits</th>
                <th className="pb-3">Stripe Billing</th>
                <th className="pb-3">Created / Updated</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No developer subscriptions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((s) => {
                  const isPro = s.plan_slug === "pro";
                  const isEnterprise = s.plan_slug === "enterprise";

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition"
                    >
                      {/* User details */}
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {s.user_avatar ? (
                              <img
                                src={s.user_avatar}
                                alt={s.user_name || "User"}
                                className="w-full h-full rounded-xl object-cover"
                              />
                            ) : s.user_name ? (
                              s.user_name.split(" ").map((n) => n[0]).join("")
                            ) : (
                              (s.user_email || "U").substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {s.user_name || "Lots of Network User"}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {s.user_email || s.user_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isEnterprise
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                              : isPro
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          {s.plan_name} (${(s.price_cents / 100).toFixed(0)}/mo)
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            s.status === "active"
                              ? "text-emerald-500"
                              : s.status === "canceled"
                              ? "text-rose-500"
                              : "text-amber-500"
                          }`}
                        >
                          {s.status === "active" ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span className="capitalize">{s.status}</span>
                        </span>
                      </td>

                      {/* Quota Limits */}
                      <td className="py-4">
                        <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {s.monthly_limit.toLocaleString()} reqs/mo
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.rate_limit_rpm} req/min throttle
                        </div>
                      </td>

                      {/* Stripe info */}
                      <td className="py-4">
                        {s.stripe_customer_id ? (
                          <div className="space-y-0.5 font-mono text-[11px]">
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <span>{s.stripe_customer_id.substring(0, 14)}...</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(s.id + "_cust", s.stripe_customer_id!)}
                                className="p-0.5 text-slate-400 hover:text-indigo-500 transition cursor-pointer"
                                title="Copy Stripe Customer ID"
                              >
                                {copiedId === s.id + "_cust" ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {s.stripe_subscription_id && (
                              <div className="text-[10px] text-slate-400 truncate max-w-28">
                                Sub: {s.stripe_subscription_id.substring(0, 12)}...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Free Developer (No Stripe ID)
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-4 text-slate-500 font-mono text-[11px]">
                        <div>
                          {new Date(s.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        {s.current_period_end && (
                          <div className="text-[10px] text-indigo-400">
                            Renews:{" "}
                            {new Date(s.current_period_end).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-2 text-right">
                        <button
                          onClick={() => handleOpenOverride(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition cursor-pointer"
                          title="Override developer tier and synchronize API key quotas"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Change Tier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: OVERRIDE SUBSCRIPTION TIER                     */}
      {/* ======================================================== */}
      {selectedSubForOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Change Subscription Tier
                  </h3>
                  <p className="text-xs text-slate-500">
                    Developer: {selectedSubForOverride.user_email || selectedSubForOverride.user_id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubForOverride(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {overrideError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{overrideError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOverride} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Target Tier *
                </label>
                <select
                  value={overridePlanSlug}
                  onChange={(e) => setOverridePlanSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="free">Free Developer (1,000 reqs/mo, 60 rpm)</option>
                  <option value="pro">Pro Developer (50,000 reqs/mo, 300 rpm, $29/mo)</option>
                  <option value="enterprise">Enterprise Partner (500,000 reqs/mo, 1,200 rpm, $199/mo)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Audit Log Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Granted Pro tier for developer partnership"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Automatic Quota Sync Notice */}
              <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 space-y-1">
                <span className="text-[11px] font-bold text-indigo-500 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Instant API Quota Synchronization
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Saving this change will automatically upgrade or adjust all active API keys owned by this developer to match the target plan quota.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedSubForOverride(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmittingOverride ? "Updating..." : "Save Tier Override"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CONFIGURE PLAN LIMITS                          */}
      {/* ======================================================== */}
      {selectedPlanForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Configure Plan: {selectedPlanForEdit.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Slug: {selectedPlanForEdit.slug}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlanForEdit(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {planEditError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{planEditError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPlanEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Plan Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editPlanName}
                  onChange={(e) => setEditPlanName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editPlanDescription}
                  onChange={(e) => setEditPlanDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Monthly Limit (reqs) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={500}
                    required
                    value={editPlanMonthlyLimit}
                    onChange={(e) => setEditPlanMonthlyLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Rate Limit (RPM) *
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={editPlanRateLimitRpm}
                    onChange={(e) => setEditPlanRateLimitRpm(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Price in Cents (USD) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    step={100}
                    required
                    value={editPlanPriceCents}
                    onChange={(e) => setEditPlanPriceCents(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold font-mono text-purple-400 shrink-0">
                    = ${(editPlanPriceCents / 100).toFixed(2)}/mo
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForEdit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlanEdit}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmittingPlanEdit ? "Saving..." : "Save Plan Configuration"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
