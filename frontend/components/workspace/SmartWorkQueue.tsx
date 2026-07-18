"use client";

import { RefreshCcw, Filter, ArrowUpDown, CheckCircle2, AlertTriangle, FileText, Bot, Clock, ChevronRight, ArrowUp, ArrowRight, ArrowDown, Mail, AlertCircle, Search, User, HelpCircle, ChevronDown, ChevronLeft } from "lucide-react";
import { InvoiceSummary, CommunicationCase } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SmartWorkQueueProps {
  cases?: CommunicationCase[];
  invoices: InvoiceSummary[];
  activeFolder?: string;
  selectedInvoiceId?: string;
  selectedCaseId?: string;
  onSelectInvoice: (invoice: InvoiceSummary) => void;
  onSelectCase?: (c: CommunicationCase) => void;
  onRefresh: () => void;
  activeFilter?: string | null;
}

const AI_RECOMMENDATIONS: Record<string, { label: string; icon: any; color: string }> = {
  "approved": { label: "Ready for Approval", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  "needs_review": { label: "Review Required", icon: AlertTriangle, color: "text-orange-600 bg-orange-50 border-orange-200" },
  "duplicate": { label: "Duplicate Suspected", icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-200" },
  "variance": { label: "Price Variance", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-200" },
  "missing_po": { label: "Missing PO", icon: AlertTriangle, color: "text-purple-600 bg-purple-50 border-purple-200" },
  "waiting_vendor": { label: "Needs Vendor Reply", icon: ArrowRight, color: "text-blue-600 bg-blue-50 border-blue-200" },
  "default": { label: "Processing", icon: RefreshCcw, color: "text-slate-600 bg-slate-50 border-slate-200" }
};

export default function SmartWorkQueue({ 
  cases = [], 
  invoices, 
  activeFolder = "VendorInvoices",
  selectedInvoiceId, 
  selectedCaseId,
  onSelectInvoice, 
  onSelectCase,
  onRefresh, 
  activeFilter 
}: SmartWorkQueueProps) {
  
  const { user } = useAuth();
  const isCommunicationView = activeFolder !== "VendorInvoices";
  
  // Apply filtering based on activeFilter
  let filteredInvoices = invoices;
  let filteredCases = cases;

  if (activeFilter) {
    if (activeFilter === 'approved') {
       filteredInvoices = invoices.filter(i => i.status === 'approved');
       filteredCases = cases.filter(c => c.status === 'Closed');
    } else if (activeFilter === 'needs_review') {
       filteredInvoices = invoices.filter(i => i.status === 'needs_review');
       filteredCases = cases.filter(c => c.status === 'NeedsReview');
    } else {
       if (activeFilter === 'waiting_vendor') {
           filteredInvoices = invoices.filter(i => i.status !== 'approved' && i.status !== 'needs_review').slice(0, 5);
           filteredCases = cases.filter(c => c.status === 'WaitingVendor');
       } else if (activeFilter === 'due_2h') {
           filteredInvoices = invoices.slice(0, 3);
           filteredCases = cases.slice(0, 2);
       } else if (activeFilter === 'duplicate') {
           filteredInvoices = invoices.filter(i => i.overall_confidence && i.overall_confidence < 0.6).slice(0, 2);
       }
    }
  }

  const itemsCount = isCommunicationView ? filteredCases.length : filteredInvoices.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-row items-center justify-between py-4 px-5 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">
            {isCommunicationView ? "Communication Queue" : "Smart Work Queue"}
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            ({itemsCount})
          </span>
          <HelpCircle className="w-4 h-4 text-gray-400 ml-1" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm text-gray-600 gap-2 cursor-pointer mr-2">
            View: <span className="font-semibold text-blue-600">Smart (Recommended)</span> <ChevronDown className="w-4 h-4" />
          </div>
          <button 
            className="h-8 px-3 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 gap-2"
          >
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button 
            className="h-8 px-3 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 gap-2"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort
          </button>
          <button onClick={onRefresh} className="p-1.5 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors shadow-sm ml-2">
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select All</span>
         </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50">Assign</button>
            <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50">Tag</button>
            {!isCommunicationView && user.role !== 'admin' && <button className="px-3 py-1 bg-white border border-slate-200 text-emerald-600 text-xs font-medium rounded shadow-sm hover:bg-emerald-50 transition-colors disabled:opacity-50">Approve Selected</button>}
         </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white sticky top-0 z-10 shadow-sm">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 w-10"></th>
              {!isCommunicationView ? (
                <>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Recommendation</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intent</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Confidence</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                </>
              )}
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!isCommunicationView ? filteredInvoices.map((inv) => {
              const conf = inv.overall_confidence || 0;
              const confPct = conf > 1 ? Math.round(conf) : Math.round(conf * 100);
              const isHighRisk = confPct < 70;
              const isMediumRisk = confPct >= 70 && confPct < 90;
              const priority = isHighRisk ? 'High' : isMediumRisk ? 'Medium' : 'Low';
              
              let recKey = "default";
              if (inv.status === "approved") recKey = "approved";
              else if (inv.status === "needs_review") {
                  if (conf < 0.5) recKey = "duplicate";
                  else if (conf < 0.7) recKey = "variance";
                  else recKey = "needs_review";
              }

              const rec = AI_RECOMMENDATIONS[recKey] || AI_RECOMMENDATIONS.default;
              const RecIcon = rec.icon;
              const slaHours = Math.floor(Math.random() * 48);
              const isSlaUrgent = slaHours < 4;

              return (
                <tr 
                  key={inv.id} 
                  onClick={() => onSelectInvoice(inv)}
                  className={cn(
                    "hover:bg-blue-50/40 cursor-pointer transition-colors group",
                    selectedInvoiceId === inv.id ? "bg-blue-50 border-l-2 border-blue-500" : "border-l-2 border-transparent"
                  )}
                >
                  <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" onClick={e => e.stopPropagation()}/>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{inv.id.substring(0,8).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-500">${inv.grand_total?.toLocaleString() || '0.00'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-slate-700">{inv.vendor_name || "Unknown Vendor"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold", rec.color)}>
                      <RecIcon size={12} />
                      {rec.label}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", confPct >= 90 ? "bg-emerald-500" : confPct >= 70 ? "bg-amber-500" : "bg-red-500")} style={{width: `${confPct}%`}} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{confPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-bold", isSlaUrgent ? "text-red-600" : "text-slate-600")}>
                        {slaHours}h left
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center text-[11px] font-bold",
                      priority === 'High' ? "text-red-600" : priority === 'Medium' ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {priority === 'High' && <ArrowUp size={12} className="mr-1" />}
                      {priority === 'Medium' && <ArrowRight size={12} className="mr-1" />}
                      {priority === 'Low' && <ArrowDown size={12} className="mr-1" />}
                      {priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </td>
                </tr>
              )
            }) : filteredCases.map((c) => {
              const priority = c.priority;
              return (
                <tr 
                  key={c.id} 
                  onClick={() => onSelectCase && onSelectCase(c)}
                  className={cn(
                    "hover:bg-blue-50/40 cursor-pointer transition-colors group",
                    selectedCaseId === c.id ? "bg-blue-50 border-l-2 border-blue-500" : "border-l-2 border-transparent"
                  )}
                >
                  <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" onClick={e => e.stopPropagation()}/>
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 truncate">{c.subject}</span>
                      <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-600">
                        {c.intent === "Invoice" ? <FileText size={10} /> : c.intent === "Unknown" ? <AlertCircle size={10} /> : <Mail size={10} />}
                        {c.intent.replace(/([A-Z])/g, ' $1').trim()}
                     </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-slate-700">{c.vendor.name}</span>
                  </td>
                  <td className="px-4 py-3">
                     <span className={cn("text-xs font-bold", c.status === "Closed" ? "text-slate-400" : c.status === "NeedsReview" ? "text-orange-600" : "text-blue-600")}>
                        {c.status.replace(/([A-Z])/g, ' $1').trim()}
                     </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700">
                          {c.assignedTo.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs font-medium text-slate-700">{c.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 border border-slate-200 border-dashed rounded px-2 py-0.5 bg-slate-50">
                        <User size={10} /> Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", c.aiConfidence >= 0.9 ? "bg-emerald-500" : c.aiConfidence >= 0.7 ? "bg-amber-500" : "bg-red-500")} style={{width: `${Math.round(c.aiConfidence * 100)}%`}} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{Math.round(c.aiConfidence * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center text-[11px] font-bold",
                      priority === 'High' ? "text-red-600" : priority === 'Medium' ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {priority === 'High' && <ArrowUp size={12} className="mr-1" />}
                      {priority === 'Medium' && <ArrowRight size={12} className="mr-1" />}
                      {priority === 'Low' && <ArrowDown size={12} className="mr-1" />}
                      {priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="border-t border-gray-100 p-4 flex items-center justify-between bg-white mt-auto shrink-0">
        <div className="text-sm text-gray-500">
          Showing 1 to {itemsCount > 6 ? 6 : itemsCount} of {itemsCount} {isCommunicationView ? 'threads' : 'invoices'}
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 opacity-50 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4"/>
          </button>
          <button className="w-8 h-8 rounded-md border border-blue-600 bg-blue-50 text-blue-600 text-sm font-medium">1</button>
          <button className="w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">2</button>
          <button className="w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">3</button>
          <span className="px-2 text-gray-400">...</span>
          <button className="w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">14</button>
          <button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 transition-colors">
            <ChevronRight className="w-4 h-4"/>
          </button>
        </div>
        <div className="text-sm text-gray-500">6 / page</div>
      </div>
    </div>
  );
}
