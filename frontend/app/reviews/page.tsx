"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listInvoices, InvoiceSummary, getAnalyticsSummary, AnalyticsSummary } from "@/lib/api";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import ReviewsHeader from "@/components/reviews/ReviewsHeader";
import StatCards from "@/components/reviews/StatCards";
import ReviewsTable from "@/components/reviews/ReviewsTable";
import RightAnalyticsPanel from "@/components/reviews/RightAnalyticsPanel";

export default function MyReviewsPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [analytics, setAnalytics] = useState<any>({} as any);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("zampify_token");
      if (!token) { router.push("/login"); return; }
      
      const [invoicesRes, analyticsRes] = await Promise.all([
        listInvoices(),
        getAnalyticsSummary()
      ]);
      
      setInvoices(invoicesRes.data);
      setAnalytics(analyticsRes);
    } catch (e) {
      console.error(e);
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

  if (loading && invoices.length === 0) {
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
            <div className="p-6 pb-2 max-w-[1600px] w-full mx-auto">
              <ReviewsHeader />
              <StatCards analytics={analytics} />
              
              <div className="flex flex-col lg:flex-row gap-6 mt-6">
                {/* Main Left Content: The Table */}
                <div className="flex-1 min-w-0">
                  <ReviewsTable invoices={invoices} />
                </div>
                
                {/* Right Sidebar: Analytics */}
                <div className="w-full lg:w-80 shrink-0">
                  <RightAnalyticsPanel analytics={analytics} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
