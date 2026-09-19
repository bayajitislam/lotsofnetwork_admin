"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Globe, 
  TrendingUp 
} from "lucide-react";

export function BlogStudioView() {
  const [search, setSearch] = useState("");
  const [submittingSlug, setSubmittingSlug] = useState<string | null>(null);
  const [indexedSlugs, setIndexedSlugs] = useState<Record<string, boolean>>({});

  const articles = [
    { slug: "how-to-calculate-subnet-mask", title: "How to Calculate Subnet Mask: Step-by-Step IPv4 & IPv6 Guide", category: "Subnetting", views: "142.8K", status: "Indexed" },
    { slug: "what-is-cidr-notation", title: "What is CIDR Notation? Complete CIDR Calculation and Routing Tutorial", category: "Subnetting", views: "98.4K", status: "Indexed" },
    { slug: "dns-propagation-checker-explained", title: "DNS Propagation Checker Explained: Global DNS Resolution & TTL", category: "DNS", views: "74.1K", status: "Indexed" },
    { slug: "what-is-reverse-dns-lookup-ptr", title: "What is Reverse DNS Lookup (PTR) and Why It Matters for Mail Servers", category: "DNS", views: "52.6K", status: "Indexed" },
    { slug: "how-traceroute-works", title: "How Traceroute Works: ICMP, UDP, TTL & Interpreting Hops", category: "Routing", views: "68.3K", status: "Indexed" },
    { slug: "what-is-an-asn-autonomous-system", title: "What is an ASN (Autonomous System Number)? BGP Routing Decoded", category: "Routing", views: "41.9K", status: "Indexed" },
    { slug: "understanding-bgp-routing", title: "Understanding Border Gateway Protocol (BGP): How the Global Internet Routes Traffic", category: "Routing", views: "38.5K", status: "Indexed" },
    { slug: "what-is-mtu-and-mss-packet-size", title: "What is MTU and MSS? Packet Fragmentation and Network Performance", category: "Protocols", views: "29.7K", status: "Indexed" },
    { slug: "how-to-check-open-ports", title: "How to Check Open Ports on Linux, Windows, and Mac (TCP & UDP)", category: "Security", views: "88.2K", status: "Indexed" },
    { slug: "what-is-dnssec", title: "What is DNSSEC? Domain Name Security Extensions Explained Simply", category: "Security", views: "34.1K", status: "Indexed" },
    { slug: "ipv4-vs-ipv6-difference", title: "IPv4 vs IPv6: Technical Differences, Address Space, and Migration", category: "Subnetting", views: "115.4K", status: "Indexed" },
    { slug: "what-is-mac-address-oui", title: "What is a MAC Address and OUI? Device Hardware Identification Guide", category: "Hardware", views: "24.6K", status: "Indexed" },
  ];

  const filtered = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.slug.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmitIndexing = (slug: string) => {
    setSubmittingSlug(slug);
    setTimeout(() => {
      setIndexedSlugs(prev => ({ ...prev, [slug]: true }));
      setSubmittingSlug(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top SEO Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Indexed Articles</span>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            37 Articles
          </div>
          <span className="text-xs text-emerald-500 font-semibold">100% Indexing Coverage</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Organic Impressions</span>
          <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
            812.4K / mo
          </div>
          <span className="text-xs text-blue-500 font-semibold">+18.4% MoM growth</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Google Indexing API</span>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
            Instant Ping
          </div>
          <span className="text-xs text-purple-500 font-semibold">Ready for submission</span>
        </div>
      </div>

      {/* Articles Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Blog Articles & Google Indexing Console
            </h3>
            <p className="text-xs text-slate-500">
              Manage SEO rankings, content metadata, and broadcast real-time Indexing API pings to search engines
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search 37 indexed articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Article & Slug</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Organic Views</th>
                <th className="pb-3">SERP Status</th>
                <th className="pb-3 pr-2 text-right">Google Indexing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((art) => {
                const isSubmitting = submittingSlug === art.slug;
                const wasPushed = indexedSlugs[art.slug];

                return (
                  <tr key={art.slug} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                    <td className="py-4 pl-2">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        /blog/{art.slug}
                      </div>
                    </td>

                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                        {art.category}
                      </span>
                    </td>

                    <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {art.views}
                    </td>

                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {art.status}
                      </span>
                    </td>

                    <td className="py-4 pr-2 text-right">
                      <button
                        onClick={() => handleSubmitIndexing(art.slug)}
                        disabled={isSubmitting || wasPushed}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-75 ${
                          wasPushed
                            ? "bg-emerald-500 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                        }`}
                      >
                        {wasPushed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pushed to Google</span>
                          </>
                        ) : (
                          <>
                            <Send className={`w-3.5 h-3.5 ${isSubmitting ? "animate-pulse" : ""}`} />
                            <span>{isSubmitting ? "Broadcasting..." : "Index Now"}</span>
                          </>
                        )}
                      </button>
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
