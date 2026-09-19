"use client";

import React, { useState, useEffect } from "react";
import { Plus, Download, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RevenueDonut } from "@/components/dashboard/RevenueDonut";
import { CampaignsTable } from "@/components/dashboard/CampaignsTable";
import { ToolsHealthGrid } from "@/components/dashboard/ToolsHealthGrid";

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState("overview");
  const [activeFilter, setActiveFilter] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const filterTabs = [
    { id: "overview", label: "Overview" },
    { id: "telemetry", label: "Tool Telemetry" },
    { id: "ads", label: "Ad Engine" },
    { id: "freemium", label: "API Freemium" },
    { id: "crashes", label: "Crash Logs" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#060911] transition-colors duration-300">
      
      {/* Left Sidebar (Dark Sleek Navigation - Matching Reference) */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        adminName="Bayajit Islam"
        adminEmail="realbayajitislam@gmail.com"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Header adminName="Bayajit Islam" onSearch={setSearchQuery} />

        {/* Dashboard Body */}
        <main className="p-6 sm:p-8 space-y-7 max-w-7xl w-full mx-auto">
          
          {/* Subheader: Section Title + Filter Tabs + Primary Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Dashboard
              </h2>
              
              {/* Category Pills (Matching reference: Overview, Visual tagger, Terminals, Products, Discounts) */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeFilter === tab.id
                        ? "bg-white dark:bg-[#0b101d] text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button (Matches reference: + Create new data in purple pill) */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create new campaign</span>
              </button>
            </div>
          </div>

          {/* Grid Layout (Matching exact 2-column hierarchy in reference image) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Metric Cards + Monthly Activity Chart (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Top Row: Total Earning & Total Spending */}
              <MetricCards />

              {/* Middle Row: Monthly Activity Line Chart */}
              <ActivityChart />

            </div>

            {/* RIGHT COLUMN: Earning Reports Donut + Campaign Progress (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Earning Reports Radial Donut */}
              <RevenueDonut />

              {/* Active Campaigns Progress Card */}
              <CampaignsTable />

            </div>
          </div>

          {/* Bottom Row: 22 Network Tools Live Health */}
          <ToolsHealthGrid />

        </main>
      </div>
    </div>
  );
}
