"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUsersDashboard, UsersDashboardData } from "@/lib/api";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";

import UserHeader from "@/components/admin/users/UserHeader";
import UserKpis from "@/components/admin/users/UserKpis";
import UserFilters from "@/components/admin/users/UserFilters";
import UserList from "@/components/admin/users/UserList";
import UsersByRoleDonut from "@/components/admin/users/UsersByRoleDonut";
import UsersByDepartmentDonut from "@/components/admin/users/UsersByDepartmentDonut";
import UserStatusDistribution from "@/components/admin/users/UserStatusDistribution";
import RecentUserActivities from "@/components/admin/users/RecentUserActivities";
import MFAAdoptionWidget from "@/components/admin/users/MFAAdoptionWidget";
import UserAccessSummary from "@/components/admin/users/UserAccessSummary";
import QuickActions from "@/components/admin/users/QuickActions";

export default function UserManagementPage() {
  const router = useRouter();
  const [data, setData] = useState<any>({} as any);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("zampify_token");
      if (!token) { router.push("/login"); return; }
      const res = await getUsersDashboard();
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
              <UserHeader />
              <UserKpis data={data?.kpis} />
  
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Left: filters + table */}
                <div className="xl:flex-[3] flex flex-col gap-5">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <UserFilters />
                    <UserList data={data?.user_list} />
                  </div>
                </div>
  
                {/* Right: charts */}
                <div className="xl:flex-[1] flex flex-col gap-5 min-w-[300px] max-w-[380px]">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <UsersByRoleDonut data={data?.roles_donut} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <UsersByDepartmentDonut data={data?.departments_donut} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <UserStatusDistribution data={data?.status_distribution} />
                  </div>
                </div>
              </div>
  
              {/* Bottom row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:col-span-1">
                  <RecentUserActivities data={data?.recent_activities} />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                  <MFAAdoptionWidget data={data?.mfa_adoption} />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                  <UserAccessSummary data={data?.access_summary} />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                  <QuickActions data={data?.quick_actions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
