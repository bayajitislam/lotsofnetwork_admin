"use client";

import React from "react";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RevenueDonut } from "@/components/dashboard/RevenueDonut";
import { CampaignsTable } from "@/components/dashboard/CampaignsTable";
import { ToolsHealthGrid } from "@/components/dashboard/ToolsHealthGrid";
import { Campaign } from "@/lib/api";

interface OverviewViewProps {
  campaigns: Campaign[];
  onManageCampaignsClick: () => void;
}

export function OverviewView({ campaigns, onManageCampaignsClick }: OverviewViewProps) {
  return (
    <div className="space-y-6">
      {/* Grid Layout (Matching exact 2-column hierarchy in reference image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Metric Cards + Monthly Activity Chart (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <MetricCards />
          <ActivityChart />
        </div>

        {/* RIGHT COLUMN: Earning Reports Donut + Campaign Progress (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <RevenueDonut />
          <CampaignsTable campaigns={campaigns} onManageClick={onManageCampaignsClick} />
        </div>
      </div>

      {/* Bottom Row: 22 Network Tools Live Health */}
      <ToolsHealthGrid />
    </div>
  );
}
