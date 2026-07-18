"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listInvoices, InvoiceSummary, getArchiveSummary, ArchiveSummary } from "@/lib/api";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import ArchiveHeader from "@/components/archive/ArchiveHeader";
import ArchiveStatCards from "@/components/archive/ArchiveStatCards";
import ArchiveSearchTabs from "@/components/archive/ArchiveSearchTabs";
import ArchiveTable from "@/components/archive/ArchiveTable";
import ArchiveRightSidebar from "@/components/archive/ArchiveRightSidebar";

export default function SearchAndArchivePage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [archiveSummary, setArchiveSummary] = useState<any>({} as any);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("zampify_token");
      if (!token) { router.push("/login"); return; }
      
      const [invoicesRes, summaryRes] = await Promise.all([
        listInvoices(),
        getArchiveSummary()
      ]);
      
      setInvoices(invoicesRes.data);
      setArchiveSummary(summaryRes);
    } catch (e) {
      console.error(e);
      // fallback in case of backend failure for demo
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
            <div className="p-6 pb-2 max-w-[1600px] w-full mx-auto flex-1 flex flex-col min-h-0">
              <ArchiveHeader />
              <ArchiveStatCards summary={archiveSummary} />
              <ArchiveSearchTabs />
              
              <div className="flex flex-col xl:flex-row gap-6 mt-4 flex-1 min-h-0">
                {/* Main Left Content: The Table */}
                <div className="flex-1 min-w-0 flex flex-col pb-6">
                  <ArchiveTable invoices={invoices} />
                </div>
                
                {/* Right Sidebar: Filters and Analytics */}
                <div className="w-full xl:w-[320px] shrink-0 pb-6">
                  <ArchiveRightSidebar summary={archiveSummary} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
