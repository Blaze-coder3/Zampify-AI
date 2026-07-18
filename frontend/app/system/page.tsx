"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSystemStatus, SystemGraphData } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";

import SystemHeader from "@/components/system/SystemHeader";
import SystemKpis from "@/components/system/SystemKpis";
import ArchitectureGraph from "@/components/system/ArchitectureGraph";
import ResourceUtilization from "@/components/system/ResourceUtilization";
import ServiceResponseTable from "@/components/system/ServiceResponseTable";
import SystemHealthCharts from "@/components/system/SystemHealthCharts";
import RecentAlertsList from "@/components/system/RecentAlertsList";

export default function SystemGraphPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>({} as any);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("zampify_token");
      if (!token) { router.push("/login"); return; }
      
      // Route protection
      if (user?.role === 'specialist') { router.push('/'); return; }
      if (user?.role === 'manager') { router.push('/overview'); return; }
      
      const res = await getSystemStatus();
      setData(res);
    } catch (e) {
      console.error(e);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
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
            <SystemHeader />
            <SystemKpis data={data?.kpis} />
            
            <div className="flex flex-col xl:flex-row gap-6">
              <div className="xl:flex-[2] flex flex-col gap-6">
                <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
                  <ArchitectureGraph />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SystemHealthCharts data={data?.system_health_charts} />
                </div>
              </div>
              
              <div className="xl:flex-1 flex flex-col gap-6 min-w-[350px]">
                <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
                  <ResourceUtilization data={data?.resource_utilization} />
                </div>
                <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
                  <ServiceResponseTable data={data?.top_services} />
                </div>
                <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col flex-1">
                  <RecentAlertsList data={data?.recent_alerts} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
