import { useState } from "react";
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { InvoiceSummary } from "@/lib/api";
import { cn } from "@/lib/utils";

const TABS = ["All Reviews", "Needs Review", "Due Today", "Overdue", "Escalated", "Completed"];

function StatusPill({ status }: { status: string }) {
  // Normalize string for matching
  const s = status?.toLowerCase() || "";
  
  if (s === "needs review" || s === "needs_review") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200 rounded-full">Needs Review</span>;
  }
  if (s === "escalated") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200 rounded-full">Escalated</span>;
  }
  if (s === "overdue") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-full">Overdue</span>;
  }
  if (s === "due today" || s === "due_today") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded-full">Due Today</span>;
  }
  if (s === "completed") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">Completed</span>;
  }
  // Default fallback
  return <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 rounded-full capitalize">{status?.replace("_", " ")}</span>;
}

function RiskPill({ level }: { level: "High" | "Medium" | "Low" }) {
  if (level === "High") {
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600"><span className="text-red-500">↑</span> High</span>;
  }
  if (level === "Medium") {
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500"><span className="text-amber-500">♦</span> Medium</span>;
  }
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500"><span className="text-emerald-500">↓</span> Low</span>;
}

export default function ReviewsTable({ invoices }: { invoices: InvoiceSummary[] }) {
  const [activeTab, setActiveTab] = useState("All Reviews");

  // In a real app, map real invoices to these fields
  // Using some dummy data merged with real invoice data where possible
  const rows = invoices.map((inv) => {
    const risk = (inv.overall_confidence || 100) < 70 ? "High" : (inv.overall_confidence || 100) < 90 ? "Medium" : "Low";
    
    return {
      id: inv.invoice_number,
      vendor: inv.vendor_name || "Unknown",
      date: new Date(inv.received_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: inv.grand_total ? `$${inv.grand_total.toLocaleString(undefined, {minimumFractionDigits: 2})}` : "$0.00",
      type: "Invoice",
      risk: risk as any,
      priority: risk as any,
      dueDate: "-",
      assignedBy: "-",
      age: "0m",
      status: inv.status
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center px-6 border-b border-slate-200 overflow-x-auto hide-scrollbar">
        {TABS.map(tab => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-4 text-sm font-medium cursor-pointer whitespace-nowrap transition-colors border-b-2",
              activeTab === tab 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by invoice, vendor, PO..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white min-w-[120px] focus:outline-none">
            <option>Risk Level (All)</option>
          </select>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white min-w-[120px] focus:outline-none">
            <option>Priority (All)</option>
          </select>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white min-w-[120px] focus:outline-none">
            <option>Invoice Type (All)</option>
          </select>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white min-w-[120px] focus:outline-none">
            <option>Status (All)</option>
          </select>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice ID</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Date</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned By</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                <td className="py-3 px-6 text-sm font-medium text-blue-600 cursor-pointer">{row.id}</td>
                <td className="py-3 px-4 text-sm text-slate-700 font-medium">{row.vendor}</td>
                <td className="py-3 px-4 text-sm text-slate-500">{row.date}</td>
                <td className="py-3 px-4 text-sm text-slate-900 font-medium">{row.amount}</td>
                <td className="py-3 px-4 text-sm text-slate-500">{row.type}</td>
                <td className="py-3 px-4"><RiskPill level={row.risk} /></td>
                <td className="py-3 px-4"><RiskPill level={row.priority} /></td>
                <td className="py-3 px-4 text-sm text-slate-500">{row.dueDate}</td>
                <td className="py-3 px-4 text-sm text-slate-500">{row.assignedBy}</td>
                <td className="py-3 px-4 text-sm text-slate-500">{row.age}</td>
                <td className="py-3 px-4 text-center"><StatusPill status={row.status} /></td>
                <td className="py-3 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">Review</button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="text-sm text-slate-500">
          Showing {rows.length === 0 ? 0 : 1} to {rows.length} of {rows.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-600 disabled:opacity-50"><ChevronLeft size={18} /></button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-blue-600 bg-blue-50 text-blue-600 text-sm font-medium">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 hover:border-slate-300">2</button>
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-600"><ChevronRight size={18} /></button>
          <select className="ml-4 px-2 py-1 border border-slate-200 rounded text-sm text-slate-600 bg-white focus:outline-none">
            <option>10 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}
