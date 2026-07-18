"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listInvoices, getInvoice, InvoiceSummary, InvoiceDetail, listCommunicationCases, CommunicationCase, getDashboardStats, getPipelineStatus, DashboardStats } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import InvoiceDetailView from "@/components/InvoiceDetailView";

// New Workspace Components
import TodaysWorkHeader from "@/components/workspace/TodaysWorkHeader";
import QuickActionCards from "@/components/workspace/QuickActionCards";
import SmartWorkQueue from "@/components/workspace/SmartWorkQueue";
import AICopilot from "@/components/workspace/AICopilot";
import TodaysPipeline from "@/components/workspace/TodaysPipeline";
import ActivityFeed from "@/components/workspace/ActivityFeed";
import MyPerformance from "@/components/workspace/MyPerformance";
import ComposeModal from "@/components/workspace/ComposeModal";
import CommunicationDetailView from "@/components/workspace/CommunicationDetailView";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [cases, setCases] = useState<CommunicationCase[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [pipeline, setPipeline] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<any>(null);
  const [activeFolder, setActiveFolder] = useState<string>("VendorInvoices");
  const [activeFilters, setActiveFilters] = useState<string[]>(["assigned_to_me"]);
  const [showActiveCaseModal, setShowActiveCaseModal] = useState(false);
  const [recommendedCase, setRecommendedCase] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("zampify_token");
      if (!token) { router.push("/login"); return; }

      // Route protection
      if (user.role === 'manager') { router.push('/overview'); return; }
      if (user.role === 'admin') { router.push('/system'); return; }
      
      const casesRes = await listCommunicationCases(activeFolder, activeFilters);
      setCases(casesRes.data);

      // Only fetch pure invoices if we are in an invoice-related context
      if (activeFolder === "VendorInvoices" || activeFolder === "Inbox") {
        const invoicesRes = await listInvoices(undefined, 50);
        setInvoices(invoicesRes.data);
      } else {
        setInvoices([]);
      }

      // Fetch global dashboard stats
      const [statsRes, pipelineRes] = await Promise.all([
        getDashboardStats(),
        getPipelineStatus()
      ]);
      setStats(statsRes.data);
      setPipeline(pipelineRes.data);

    } catch (e) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router, activeFolder, activeFilters]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const handleSelectCase = async (c: CommunicationCase) => {
    setSelectedInvoice(null);
    if (c.intent === "Invoice" && c.invoiceId) {
      try {
        localStorage.setItem("zampify_last_case_id", c.invoiceId);
        const res = await getInvoice(c.invoiceId);
        setSelectedInvoice(res.data);
      } catch (e) {
        console.error("Invoice not found in database:", e);
        // Fallback to showing the communication view if the invoice doesn't exist (mock data gap)
        setSelectedCase(c);
      }
    } else {
      setSelectedCase(c);
    }
  };

  const handleSelectInvoice = async (summary: InvoiceSummary) => {
    setSelectedCase(null);
    try {
      localStorage.setItem("zampify_last_case_id", summary.id);
      const res = await getInvoice(summary.id);
      setSelectedInvoice(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load invoice details.");
    }
  };

  const handleStartProcessing = () => {
    // AI Prioritization Engine (mock)
    // Evaluate Queue -> Rank Cases -> Highest Priority Case
    const sorted = [...invoices]
      .filter(i => i.status !== 'approved' && i.status !== 'completed')
      .sort((a, b) => {
        // Mock scoring: prioritize 'needs_review' and lower confidence
        const scoreA = (a.status === 'needs_review' ? 10 : 0) - (a.overall_confidence || 0);
        const scoreB = (b.status === 'needs_review' ? 10 : 0) - (b.overall_confidence || 0);
        return scoreB - scoreA; // Descending
      });
      
    const nextCase = sorted[0];
    if (!nextCase) {
      alert("Queue is empty!");
      return;
    }

    const activeCaseId = localStorage.getItem("zampify_last_case_id");
    
    // If an unfinished case exists and it's not the recommended one
    if (activeCaseId && activeCaseId !== nextCase.id) {
      setRecommendedCase(nextCase);
      setShowActiveCaseModal(true);
    } else {
      handleSelectInvoice(nextCase);
    }
  };

  const handleResumeLastCase = () => {
    const activeCaseId = localStorage.getItem("zampify_last_case_id");
    
    if (activeCaseId) {
      const activeCase = invoices.find(i => i.id === activeCaseId);
      if (activeCase && activeCase.status !== 'approved') {
        handleSelectInvoice(activeCase);
        return;
      }
    }
    
    alert("✓ Great job!\n\nNo unfinished invoices found.");
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  const toggleSidebarFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex font-sans text-slate-800">
      <Sidebar 
        activeFolder={activeFolder}
        activeFilters={activeFilters}
        onSelectFolder={setActiveFolder}
        onToggleFilter={toggleSidebarFilter}
        counts={{
          'VendorInvoices': stats?.total_invoices || 0,
          'Exceptions': stats?.failed || 0,
          'Inbox': cases.length,
          'reviews': stats?.needs_review || 0,
          'needs_review': stats?.needs_review || 0,
          'duplicate': invoices.filter(i => i.status === 'failed').length, // Using failed as proxy for duplicates
          'urgent': stats?.needs_review || 0, // Using needs_review as urgent proxy
          'due_today': invoices.filter(i => i.status === 'validating').length, 
          'waiting_vendor': cases.filter(c => c.status === "WaitingVendor").length
        }}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        
        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 p-6 overflow-y-auto min-w-0">
            <div className="max-w-[1200px] mx-auto">
              <TodaysWorkHeader 
                onRefresh={load} 
                onStartProcessing={handleStartProcessing} 
                onResumeLastCase={handleResumeLastCase}
                stats={stats}
              />
              
              <QuickActionCards onFilter={handleFilter} invoices={invoices} stats={stats} />
              
              <div className="mb-6">
                 <SmartWorkQueue 
                   cases={cases}
                   invoices={invoices} 
                   activeFolder={activeFolder}
                   selectedInvoiceId={selectedInvoice?.id} 
                   selectedCaseId={selectedCase?.id}
                   onSelectInvoice={handleSelectInvoice}
                   onSelectCase={handleSelectCase}
                   onRefresh={load}
                   activeFilter={activeFilter}
                 />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pb-12">
                 <TodaysPipeline pipeline={pipeline} />
                 <ActivityFeed invoices={invoices} />
                 <MyPerformance stats={stats} />
              </div>
            </div>
          </main>
          
          <aside className="w-[320px] 2xl:w-[360px] shrink-0 border-l border-gray-200 bg-gray-50/50 flex flex-col overflow-y-auto p-6 hidden lg:flex">
             <AICopilot stats={stats} cases={cases} invoices={invoices} />
          </aside>

          {selectedInvoice && (
            <InvoiceDetailView 
              invoice={selectedInvoice} 
              onClose={() => setSelectedInvoice(null)} 
              onRefresh={load} 
            />
          )}

          {selectedCase && !selectedInvoice && (
            <CommunicationDetailView 
              caseDetail={selectedCase}
              onClose={() => setSelectedCase(null)}
            />
          )}
        </div>
        {/* Active Case Modal */}
        {showActiveCaseModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-96 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-xl">⚠️</span> You have an unfinished case
                </h3>
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-sm font-bold text-slate-800">{localStorage.getItem("zampify_last_case_id")?.substring(0,8).toUpperCase()}</div>
                  <div className="text-xs text-slate-500">Currently in progress</div>
                </div>
              </div>
              
              <div className="p-2 flex flex-col">
                <button 
                  onClick={() => {
                    setShowActiveCaseModal(false);
                    handleResumeLastCase();
                  }}
                  className="px-4 py-3 text-left hover:bg-slate-50 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                  <span className="text-sm font-medium text-slate-700">Resume Current Case</span>
                </button>
                
                <button 
                  onClick={() => {
                    setShowActiveCaseModal(false);
                    if (recommendedCase) handleSelectInvoice(recommendedCase);
                  }}
                  className="px-4 py-3 text-left hover:bg-slate-50 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-blue-700">Open Recommended Case</span>
                    <span className="text-[10px] text-slate-500">{recommendedCase?.id.substring(0,8).toUpperCase()} (High Priority)</span>
                  </div>
                </button>
              </div>
              
              <div className="p-3 border-t border-slate-100 bg-slate-50 text-right">
                <button 
                  onClick={() => setShowActiveCaseModal(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
