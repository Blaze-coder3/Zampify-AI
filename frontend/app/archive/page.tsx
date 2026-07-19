"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { listInvoices, InvoiceSummary, getInvoice, InvoiceDetail, ArchiveSummary } from "@/lib/api";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import ArchiveHeader from "@/components/archive/ArchiveHeader";
import ArchiveStatCards from "@/components/archive/ArchiveStatCards";
import ArchiveSearchTabs from "@/components/archive/ArchiveSearchTabs";
import ArchiveTable from "@/components/archive/ArchiveTable";
import InvoiceDetailView from "@/components/InvoiceDetailView";

export default function SearchAndArchivePage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Documents");
  const [dateFilter, setDateFilter] = useState("");

  const archiveSummary = useMemo(() => {
    if (!invoices.length) return {
      kpis: {
        total_invoices: 0,
        archived: 0,
        exceptions: 0,
        total_spend: 0,
        vendors_count: 0
      },
      status_distribution: {
        approved: 0,
        needs_review: 0,
        escalated: 0,
        overdue: 0,
        closed: 0
      },
      recent_searches: []
    };
    const total_invoices = invoices.length;
    const archived = invoices.filter(i => ['approved', 'rejected', 'completed', 'archived'].includes(i.status || '')).length;
    const exceptions = invoices.filter(i => ['needs_review', 'failed'].includes(i.status || '') || i.decision === 'investigating').length;
    const total_spend = invoices.filter(i => i.status !== 'rejected').reduce((sum, i) => sum + (i.grand_total || 0), 0);
    const vendors = new Set(invoices.filter(i => i.vendor_name).map(i => i.vendor_name)).size;
    
    const status_distribution = {
      approved: invoices.filter(i => i.status === 'approved' || i.status === 'completed').length,
      needs_review: invoices.filter(i => i.status === 'needs_review' || i.decision === 'investigating').length,
      escalated: invoices.filter(i => i.status === 'escalated').length,
      overdue: invoices.filter(i => i.status === 'failed' || i.status === 'rejected').length, // mapping rejected/failed here for the donut
      closed: invoices.filter(i => i.status === 'archived').length
    };
    
    return {
      kpis: {
        total_invoices,
        archived,
        exceptions,
        total_spend,
        vendors_count: vendors
      },
      status_distribution,
      recent_searches: []
    };
  }, [invoices]);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("zampify_token");
      if (!token) { router.push("/login"); return; }
      
      const invoicesRes = await listInvoices();
      setInvoices(invoicesRes.data);
    } catch (e) {
      console.error(e);
      // fallback in case of backend failure for demo
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSelectInvoice = async (summary: InvoiceSummary) => {
    try {
      const res = await getInvoice(summary.id);
      setSelectedInvoice(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load invoice details.");
    }
  };

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
              <ArchiveHeader />
              <ArchiveStatCards summary={archiveSummary} />
              <ArchiveSearchTabs 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
              />
              
              <div className="mt-4 pb-6">
                <ArchiveTable 
                  invoices={invoices} 
                  searchQuery={searchQuery} 
                  onSearchChange={setSearchQuery} 
                  activeTab={activeTab}
                  dateFilter={dateFilter}
                  onSelectInvoice={handleSelectInvoice} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedInvoice && (
        <InvoiceDetailView 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
          onRefresh={load} 
        />
      )}
    </div>
  );
}
