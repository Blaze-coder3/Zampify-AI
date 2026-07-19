"use client";

import { useState, useEffect, useCallback } from "react";
import { getOverviewSummary } from "@/lib/api";

import OverviewHeader from "@/components/overview/OverviewHeader";
import OverviewKpiCards from "@/components/overview/OverviewKpiCards";
import InvoiceTrendChart from "@/components/overview/InvoiceTrendChart";
import StatusDonutChart from "@/components/overview/StatusDonutChart";
import AgingSummary from "@/components/overview/AgingSummary";
import SparklineCards from "@/components/overview/SparklineCards";
import TopVendorsTable from "@/components/overview/TopVendorsTable";
import TeamPerformanceTable from "@/components/overview/TeamPerformanceTable";
import RecentAlerts from "@/components/overview/RecentAlerts";

export default function OverviewDashboard() {
  const [data, setData] = useState<any>({} as any);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("zampify_token");
      if (!token) return;
      
      const res = await getOverviewSummary();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6 pb-8">
      <OverviewHeader />
      <OverviewKpiCards data={data?.kpis} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col min-h-[340px]">
          <InvoiceTrendChart data={data?.processing_trends} />
        </div>
        <div className="xl:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col min-h-[340px]">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Invoices by Status</h3>
          <div className="flex-1 flex items-center justify-center">
            <StatusDonutChart data={data?.status_distribution} />
          </div>
        </div>
        <div className="xl:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col min-h-[340px]">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Aging Summary (Overdue)</h3>
          <div className="flex-1 flex items-center">
            <AgingSummary data={data?.aging_summary} />
          </div>
        </div>
      </div>

      <SparklineCards data={data?.sparklines} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 h-full">
          <TopVendorsTable data={data?.top_vendors} />
        </div>
        <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 h-full">
          <TeamPerformanceTable data={data?.team_performance} />
        </div>
        <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 h-full">
          <RecentAlerts data={data?.recent_alerts} />
        </div>
      </div>
      
    </div>
  );
}
