"use client";

import { useState } from "react";
import { RefreshCcw, Filter, ArrowUpDown, CheckCircle2, AlertTriangle, FileText, Bot, Clock, ChevronRight, ArrowUp, ArrowRight, ArrowDown, Mail, AlertCircle, Search, User, HelpCircle, ChevronDown, ChevronLeft, X, Tag as TagIcon, Check } from "lucide-react";
import { InvoiceSummary, CommunicationCase, bulkApproveInvoices, bulkAssignInvoices, bulkTagInvoices } from "@/lib/api";
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
  activeFilters?: string[];
}

const AI_RECOMMENDATIONS: Record<string, { label: string; icon: any; color: string }> = {
  "Ready for Approval": { label: "Ready for Approval", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  "Review Required": { label: "Review Required", icon: AlertTriangle, color: "text-orange-600 bg-orange-50 border-orange-200" },
  "Duplicate Suspected": { label: "Duplicate Suspected", icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-200" },
  "Price Variance": { label: "Price Variance", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-200" },
  "Missing PO": { label: "Missing PO", icon: AlertTriangle, color: "text-purple-600 bg-purple-50 border-purple-200" },
  "Needs Vendor Reply": { label: "Needs Vendor Reply", icon: ArrowRight, color: "text-blue-600 bg-blue-50 border-blue-200" },
  "Processing": { label: "Processing", icon: RefreshCcw, color: "text-slate-600 bg-slate-50 border-slate-200" },
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
  activeFilter, activeFilters = []
}: SmartWorkQueueProps) {
  
  const { user } = useAuth();
  const isCommunicationView = activeFolder !== "VendorInvoices";
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  // Feature states
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc'|'desc' } | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const handleSort = (key: string) => {
    let direction: 'asc'|'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = isCommunicationView ? filteredCases.map(c => c.id) : filteredInvoices.map(i => i.id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkApproveInvoices(Array.from(selectedIds));
      setSelectedIds(new Set());
      onRefresh();
    } catch (e) {
      alert("Failed to approve selected.");
    }
  };

  const handleBulkAssign = async (userId: string) => {
    if (selectedIds.size === 0) return;
    try {
      await bulkAssignInvoices(Array.from(selectedIds), userId);
      setSelectedIds(new Set());
      setShowAssignModal(false);
      onRefresh();
    } catch (e) {
      alert("Failed to assign selected.");
    }
  };
  
  const handleBulkTag = async () => {
    if (selectedIds.size === 0 || !tagInput.trim()) return;
    try {
      await bulkTagInvoices(Array.from(selectedIds), tagInput.trim());
      setTagInput('');
      setSelectedIds(new Set());
      setShowTagModal(false);
      onRefresh();
    } catch (e) {
      alert("Failed to tag selected.");
    }
  };
  
  // Apply filtering based on activeFilter
  let filteredInvoices = invoices;
  let filteredCases = cases;

  // Merge activeFilter (singular top cards) and activeFilters (plural sidebar)
  const allFilters = new Set(activeFilters);
  if (activeFilter) allFilters.add(activeFilter);

  // Apply Quick Action Card filters
  if (activeFilter === 'needs_review') {
    filteredInvoices = filteredInvoices.filter(i => i.status === 'needs_review');
  } else if (activeFilter === 'waiting_vendor') {
    filteredInvoices = filteredInvoices.filter(i => i.status === 'triage');
  } else if (activeFilter === 'due_2h') {
    const twoHoursAgo = new Date(Date.now() - 22 * 60 * 60 * 1000); // matching backend SLA logic
    filteredInvoices = filteredInvoices.filter(i => 
      i.received_at && new Date(i.received_at) < twoHoursAgo &&
      !['approved', 'rejected', 'archived', 'failed'].includes(i.status)
    );
  } else if (activeFilter === 'approved' || activeFilter === 'ready_approve') {
    filteredInvoices = filteredInvoices.filter(i => i.status === 'needs_review' && i.overall_confidence && i.overall_confidence >= 80);
  } else if (activeFilter === 'duplicate') {
    filteredInvoices = filteredInvoices.filter(i => {
      if (i.triggered_rules && Array.isArray(i.triggered_rules)) {
        return i.triggered_rules.some((r: any) => r.rule_id === 'BR-004' && r.status !== 'pass');
      }
      return false;
    });
  }
  // Text search
  if (filterQuery) {
    const q = filterQuery.toLowerCase();
    filteredInvoices = filteredInvoices.filter(i => 
      (i.vendor_name || '').toLowerCase().includes(q) || 
      (i.invoice_number || '').toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortConfig) {
    filteredInvoices = [...filteredInvoices].sort((a, b) => {
      let aVal: any = a[sortConfig.key as keyof typeof a];
      let bVal: any = b[sortConfig.key as keyof typeof b];
      
      if (sortConfig.key === 'received_at') {
        aVal = a.received_at ? new Date(a.received_at).getTime() : 0;
        bVal = b.received_at ? new Date(b.received_at).getTime() : 0;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  if (allFilters.size > 0) {
      if (allFilters.has('approved')) {
          filteredInvoices = filteredInvoices.filter(i => i.status === 'approved' || i.status === 'completed');
      } else {
          filteredInvoices = filteredInvoices.filter(i => !['approved', 'completed', 'rejected'].includes(i.status));
      }
      if (allFilters.has('needs_review')) {
          filteredInvoices = filteredInvoices.filter(i => i.status === 'needs_review');
          filteredCases = filteredCases.filter(c => c.status === 'NeedsReview');
      }
      if (allFilters.has('waiting_vendor')) {
          filteredInvoices = filteredInvoices.filter(i => i.status === 'triage');
          filteredCases = filteredCases.filter(c => c.status === 'WaitingVendor');
      }
      if (allFilters.has('due_2h') || allFilters.has('due_today') || allFilters.has('urgent')) {
          filteredInvoices = filteredInvoices.filter(i => {
              if (!i.received_at) return false;
              const ageMs = new Date().getTime() - new Date(i.received_at).getTime();
              return ageMs > 22 * 60 * 60 * 1000 && !['approved', 'rejected', 'archived', 'failed'].includes(i.status || '');
          });
          filteredCases = filteredCases.filter(c => c.priority === 'High');
      }
      if (allFilters.has('duplicate')) {
          filteredInvoices = filteredInvoices.filter(i => i.status === 'failed');
      }
  }

  // Calculate pagination bounds
  const totalItems = isCommunicationView ? filteredCases.length : filteredInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  if (isCommunicationView) {
      filteredCases = filteredCases.slice(startIndex, endIndex);
  } else {
      filteredInvoices = filteredInvoices.slice(startIndex, endIndex);
  }


  

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-row items-center justify-between py-4 px-5 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">
            {isCommunicationView ? "Communication Queue" : "Smart Work Queue"}
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            ({totalItems})
          </span>
          <span title="This smart queue prioritizes urgent items and detects duplicates automatically.">
            <HelpCircle className="w-4 h-4 text-gray-400 ml-1 cursor-help" />
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilterModal(true)} className="relative h-8 px-3 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 gap-2">
            <Filter className="w-3.5 h-3.5" /> {filterQuery ? "Filtered" : "Filter"}
            {filterQuery && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full"></span>}
          </button>
          <button onClick={onRefresh} className="p-1.5 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors shadow-sm ml-2">
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" onChange={handleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === totalItems} />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select All</span>
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
                  <th onClick={() => handleSort('id')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">ID {sortConfig?.key==='id' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('invoice_number')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">Invoice ID {sortConfig?.key==='invoice_number' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('vendor_name')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">Vendor {sortConfig?.key==='vendor_name' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('ai_recommendation')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">AI Recommendation {sortConfig?.key==='ai_recommendation' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('overall_confidence')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">Confidence {sortConfig?.key==='overall_confidence' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('received_at')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">SLA Remaining {sortConfig?.key==='received_at' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('priority')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">Priority {sortConfig?.key==='priority' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('assignee_id')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">Assigned To {sortConfig?.key==='assignee_id' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
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
              const priority = inv.priority || 'Medium';
              
              const recKey = inv.ai_recommendation || "Processing";
              const rec = AI_RECOMMENDATIONS[recKey] || AI_RECOMMENDATIONS["Processing"] || AI_RECOMMENDATIONS.default;
              const RecIcon = rec.icon;
              
              const slaStr = inv.sla_remaining || "24h 0m";
              const isSlaUrgent = slaStr === "Overdue" || (slaStr.includes('h') && parseInt(slaStr.split('h')[0]) < 2);

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
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={selectedIds.has(inv.id)} onChange={() => handleSelectOne(inv.id)} onClick={e => e.stopPropagation()}/>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-slate-800">{inv.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800">{inv.invoice_number || "-"}</span>
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
                        {slaStr}
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700">
                        {inv.assigned_to_name ? inv.assigned_to_name.split(' ').map(n => n[0]).join('') : "U"}
                      </div>
                      <span className="text-xs font-medium text-slate-700">{inv.assigned_to_name || "Unassigned"}</span>
                    </div>
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
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={selectedIds.has(c.id)} onChange={() => handleSelectOne(c.id)} onClick={e => e.stopPropagation()}/>
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
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} {isCommunicationView ? 'threads' : 'invoices'}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4"/>
          </button>
          
          <span className="px-3 text-sm text-gray-600 font-medium">
            Page {safeCurrentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages || totalPages === 0}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4"/>
          </button>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded p-1 bg-white text-slate-700 cursor-pointer"
          >
            <option value={6}>6 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Modals */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-96 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-slate-800">Filter Invoices</h3>
              <button onClick={() => setShowFilterModal(false)}><X className="w-4 h-4 text-slate-500"/></button>
            </div>
            <div className="p-4">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Search Query (Vendor, ID, Invoice #)</label>
              <input 
                autoFocus
                type="text" 
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Search..." 
                className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border"
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t">
              <button onClick={() => { setFilterQuery(''); setShowFilterModal(false); }} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-md">Clear</button>
              <button onClick={() => setShowFilterModal(false)} className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md">Apply</button>
            </div>
          </div>
        </div>
      )}
      
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-80 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-slate-800">Assign To</h3>
              <button onClick={() => setShowAssignModal(false)}><X className="w-4 h-4 text-slate-500"/></button>
            </div>
            <div className="p-2">
               {[
                 {id: '1', name: 'Sarah (AP Lead)'}, 
                 {id: '2', name: 'John Doe'},
                 {id: '3', name: 'Accounting Team'}
               ].map(u => (
                 <button key={u.id} onClick={() => handleBulkAssign(u.id)} className="w-full text-left p-3 hover:bg-slate-50 text-sm flex items-center gap-2 border-b last:border-0 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">{u.name[0]}</div>
                    {u.name}
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}
      
      {showTagModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowTagModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-96 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-slate-800">Add Tag</h3>
              <button onClick={() => setShowTagModal(false)}><X className="w-4 h-4 text-slate-500"/></button>
            </div>
            <div className="p-4">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tag Name</label>
              <input 
                autoFocus
                type="text" 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="e.g. Urgent Review, Audit..." 
                className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border"
                onKeyDown={e => e.key === 'Enter' && handleBulkTag()}
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t">
              <button onClick={() => setShowTagModal(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-md">Cancel</button>
              <button onClick={handleBulkTag} disabled={!tagInput.trim()} className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50">Save Tag</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
