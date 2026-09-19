"use client";

import React from "react";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RevenueDonut } from "@/components/dashboard/RevenueDonut";
import { CampaignsTable } from "@/components/dashboard/CampaignsTable";
import { ToolsHealthGrid } from "@/components/dashboard/ToolsHealthGrid";
import { Campaign, AdminStats, ToolTelemetry } from "@/lib/api";

interface OverviewViewProps {
  campaigns: Campaign[];
  stats?: AdminStats | null;
  telemetry?: ToolTelemetry[];
  onManageCampaignsClick: () => void;
}

export function OverviewView({ campaigns, stats, telemetry, onManageCampaignsClick }: OverviewViewProps) {
  return (
    <div className="space-y-6">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Metric Cards + Monthly Activity Chart (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <MetricCards stats={stats} />
          <ActivityChart stats={stats} />
        </div>

        {/* RIGHT COLUMN: Earning Reports Donut + Campaign Progress (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <RevenueDonut stats={stats} />
          <CampaignsTable campaigns={campaigns} onManageClick={onManageCampaignsClick} />
        </div>
      </div>

      {/* Bottom Row: Active Network Tools Live Health */}
      <ToolsHealthGrid telemetry={telemetry} />
    </div>
  );
}
