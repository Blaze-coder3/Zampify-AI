"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPoliciesDashboard, PoliciesDashboardData } from "@/lib/api";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";

import PolicyHeader from "@/components/admin/policies/PolicyHeader";
import PolicyKpis from "@/components/admin/policies/PolicyKpis";
import PolicyFilters from "@/components/admin/policies/PolicyFilters";
import PolicyList from "@/components/admin/policies/PolicyList";
import PolicyCategoriesDonut from "@/components/admin/policies/PolicyCategoriesDonut";
import PolicyStatusDonut from "@/components/admin/policies/PolicyStatusDonut";
import RecentPolicyChanges from "@/components/admin/policies/RecentPolicyChanges";
import PolicySimulatorWidget from "@/components/admin/policies/PolicySimulatorWidget";
import PolicyEffectiveness from "@/components/admin/policies/PolicyEffectiveness";
import ComplianceFrameworks from "@/components/admin/policies/ComplianceFrameworks";

export default function PolicyCenterPage() {
  const router = useRouter();
  const [data, setData] = useState<any>({} as any);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("zampify_token");
      if (!token) { router.push("/login"); return; }
      const res = await getPoliciesDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

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
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-6 pb-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
              <PolicyHeader />
              <PolicyKpis data={data?.kpis} />
              
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Left column: filters + policy list */}
                <div className="xl:flex-[3] flex flex-col gap-5">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <PolicyFilters />
                    <PolicyList data={data?.policy_list} />
                  </div>
                </div>
  
                {/* Right column: charts + activity */}
                <div className="xl:flex-[1] flex flex-col gap-5 min-w-[300px] max-w-[380px]">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <PolicyCategoriesDonut data={data?.categories_donut} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <PolicyStatusDonut data={data?.status_donut} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <RecentPolicyChanges data={data?.recent_changes} />
                  </div>
                </div>
              </div>
  
              {/* Bottom row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                  <PolicySimulatorWidget />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                  <PolicyEffectiveness data={data?.effectiveness} />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                  <ComplianceFrameworks data={data?.compliance_frameworks} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
