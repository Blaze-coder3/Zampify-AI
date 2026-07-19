"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listInvoices, getInvoice, InvoiceSummary, InvoiceDetail, listCommunicationCases, CommunicationCase, DashboardStats } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import InvoiceDetailView from "@/components/InvoiceDetailView";

import TodaysWorkHeader from "@/components/workspace/TodaysWorkHeader";
import QuickActionCards from "@/components/workspace/QuickActionCards";
import SmartWorkQueue from "@/components/workspace/SmartWorkQueue";
import ComposeModal from "@/components/workspace/ComposeModal";
import CommunicationDetailView from "@/components/workspace/CommunicationDetailView";

import OverviewDashboard from "@/components/overview/OverviewDashboard";
import BottlenecksDashboard from "@/components/bottlenecks/BottlenecksDashboard";
import FinancialDashboard from "@/components/financial/FinancialDashboard";

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
  const [activeTab, setActiveTab] = useState<string>("workspace");
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
      if (user.role === 'admin') { router.push('/system'); return; }
      
      const casesRes = await listCommunicationCases(activeFolder, activeFilters);
      setCases(casesRes.data);

      let invs: InvoiceSummary[] = [];
      // Only fetch pure invoices if we are in an invoice-related context
      if (activeFolder === "VendorInvoices" || activeFolder === "Inbox") {
        const invoicesRes = await listInvoices(undefined, 50);
        invs = invoicesRes.data;
        setInvoices(invs);
      } else {
        setInvoices([]);
      }

      const duplicates = invs.filter(i => {
        if (i.triggered_rules && Array.isArray(i.triggered_rules)) {
          return i.triggered_rules.some((r: any) => r.rule_id === 'BR-004' && r.status !== 'pass');
        }
        return false;
      }).length;
      
      const readyToApprove = invs.filter(i => i.status === 'needs_review' && i.overall_confidence && i.overall_confidence >= 80).length;

      // Compute stats locally instead of broken API calls
      setStats({
        needs_review: invs.filter(i => i.status === 'needs_review' || i.decision === 'investigating').length,
        waiting_on_vendor: casesRes.data.filter(c => c.status === 'WaitingVendor').length + invs.filter(i => i.status === 'pending_vendor').length,
        due_within_2h: invs.filter(i => i.priority === 'High' && (i.status === 'needs_review' || i.decision === 'investigating')).length,
        duplicates_detected: duplicates,
        ready_to_approve: readyToApprove,
        total_invoices: invs.length,
        failed: invs.filter(i => i.status === 'failed').length
      });

      setPipeline({
        received: invs.length,
        classifying: invs.filter(i => i.status === 'processing').length,
        needs_review: invs.filter(i => i.status === 'needs_review' || i.decision === 'investigating').length,
        approved: invs.filter(i => i.status === 'approved' || i.status === 'completed').length,
      });

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
          'duplicate': stats?.duplicates_detected || 0,
          'urgent': stats?.due_within_2h || 0,
          'due_today': stats?.due_within_2h || 0, 
          'waiting_vendor': stats?.waiting_on_vendor || 0
        }}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        
        {/* Tab Navigation */}
        <div className="bg-white border-b border-slate-200 px-8 pt-4 flex-shrink-0">
          <nav className="flex space-x-8 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('workspace')} 
              className={cn("pb-3 border-b-2 transition-colors", activeTab === 'workspace' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800')}
            >
              Workspace
            </button>
            <button 
              onClick={() => setActiveTab('overview')} 
              className={cn("pb-3 border-b-2 transition-colors", activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800')}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('bottlenecks')} 
              className={cn("pb-3 border-b-2 transition-colors", activeTab === 'bottlenecks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800')}
            >
              Bottlenecks
            </button>
            <button 
              onClick={() => setActiveTab('financial')} 
              className={cn("pb-3 border-b-2 transition-colors", activeTab === 'financial' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800')}
            >
              Financial Snapshot
            </button>
          </nav>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 p-6 overflow-y-auto min-w-0">
            {activeTab === 'workspace' && (
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
                     activeFilters={activeFilters}
                   />
                </div>
              </div>
            )}

            {activeTab === 'overview' && <OverviewDashboard />}
            {activeTab === 'bottlenecks' && <BottlenecksDashboard />}
            {activeTab === 'financial' && <FinancialDashboard />}
          </main>

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
