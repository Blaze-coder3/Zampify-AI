"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getBottlenecksSummary, BottlenecksDashboardData } from "@/lib/api";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";

import BottleneckHeader from "@/components/bottlenecks/BottleneckHeader";
import BottleneckKpis from "@/components/bottlenecks/BottleneckKpis";
import ProcessHeatmap from "@/components/bottlenecks/ProcessHeatmap";
import TopBottlenecksTable from "@/components/bottlenecks/TopBottlenecksTable";
import DepartmentBottleneck from "@/components/bottlenecks/DepartmentBottleneck";
import VendorBottleneck from "@/components/bottlenecks/VendorBottleneck";
import BottleneckTrendChart from "@/components/bottlenecks/BottleneckTrendChart";
import BottleneckInsight from "@/components/bottlenecks/BottleneckInsight";

export default function BottlenecksPage() {
  const router = useRouter();
  const [data, setData] = useState<any>({} as any);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("zampify_token");
      if (!token) { router.push("/login"); return; }
      
      const res = await getBottlenecksSummary();
      setData(res);
    } catch (e) {
      console.error(e);
      // fallback for demo
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex font-sans text-slate-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6 pb-8">
            <BottleneckHeader />
            <BottleneckKpis data={data?.kpis} />
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
                <ProcessHeatmap data={data?.heatmap} />
              </div>
              <div className="xl:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
                <TopBottlenecksTable data={data?.top_bottlenecks} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
                <DepartmentBottleneck data={data?.department_bottlenecks} />
              </div>
              <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
                <VendorBottleneck data={data?.vendor_bottlenecks} />
              </div>
              <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
                <BottleneckTrendChart data={data?.trend_over_time} />
              </div>
            </div>
            
            <BottleneckInsight />
          </div>
        </main>
      </div>
    </div>
  );
}
