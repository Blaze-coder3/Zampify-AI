import { MoreVertical, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { InvoiceSummary } from "@/lib/api";

function DocumentTypePill({ type }: { type: string }) {
  if (type === "Credit Note") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200 rounded-full whitespace-nowrap">Credit Note</span>;
  }
  if (type === "Purchase Order") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full whitespace-nowrap">Purchase Order</span>;
  }
  return <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded-full whitespace-nowrap">Invoice</span>;
}

function StatusPill({ status }: { status: string }) {
  const s = status?.toLowerCase() || "";
  
  if (s === "approved") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full whitespace-nowrap">Approved</span>;
  }
  if (s === "needs review" || s === "needs_review") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200 rounded-full whitespace-nowrap">Needs Review</span>;
  }
  if (s === "escalated") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200 rounded-full whitespace-nowrap">Escalated</span>;
  }
  if (s === "closed") {
    return <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 rounded-full whitespace-nowrap">Closed</span>;
  }
  return <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 rounded-full whitespace-nowrap capitalize">{status?.replace("_", " ")}</span>;
}

export default function ArchiveTable({ 
  invoices,
  searchQuery,
  onSearchChange,
  onSelectInvoice
}: { 
  invoices: InvoiceSummary[],
  searchQuery?: string,
  onSearchChange?: (q: string) => void,
  onSelectInvoice?: (inv: InvoiceSummary) => void
}) {
  let filteredInvoices = invoices;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredInvoices = filteredInvoices.filter(i => 
      (i.vendor_name || '').toLowerCase().includes(q) || 
      (i.invoice_number || '').toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q)
    );
  }

  const rows = filteredInvoices.map((inv) => {
    return {
      original: inv,
      id: inv.invoice_number || inv.id.substring(0, 8),
      vendor: inv.vendor_name || "Unknown",
      date: new Date(inv.received_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: inv.grand_total ? `$${inv.grand_total.toLocaleString(undefined, {minimumFractionDigits: 2})}` : "$0.00",
      type: "Invoice",
      status: inv.status,
      poNumber: "-", // Would map to PO if available in summary
      dueDate: "-",  // Would map to due date if available in summary
      archivedOn: new Date(inv.received_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-3 px-4 w-12 text-center">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice ID</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Date</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">PO Number</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Archived On</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr 
                key={idx} 
                className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                onClick={() => onSelectInvoice?.(row.original)}
              >
                <td className="py-3 px-4 text-center">
                  <input type="checkbox" onClick={(e) => e.stopPropagation()} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </td>
                <td className="py-3 px-4 text-sm font-medium text-blue-600">{row.id}</td>
                <td className="py-3 px-4 text-sm text-slate-700 font-medium">{row.vendor}</td>
                <td className="py-3 px-4 text-sm text-slate-500">{row.date}</td>
                <td className={`py-3 px-4 text-sm font-medium ${row.amount.startsWith("-") ? "text-red-500" : "text-slate-900"}`}>{row.amount}</td>
                <td className="py-3 px-4"><DocumentTypePill type={row.type} /></td>
                <td className="py-3 px-4 text-center"><StatusPill status={row.status} /></td>
                <td className="py-3 px-4 text-sm text-slate-500">{row.poNumber}</td>
                <td className="py-3 px-4 text-sm text-slate-500">{row.dueDate}</td>
                <td className="py-3 px-4 text-sm text-slate-500">{row.archivedOn}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 transition-colors"
                      onClick={(e) => { e.stopPropagation(); onSelectInvoice?.(row.original); }}
                    >
                      <Eye size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 transition-colors">
                      <Download size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded border border-transparent transition-colors">
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
            <button className="px-3 py-1 rounded-md text-sm font-medium border border-transparent text-slate-500 hover:bg-slate-100 transition-colors">1</button>
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-600"><ChevronRight size={18} /></button>
          <select className="ml-4 px-2 py-1 border border-slate-200 rounded text-sm text-slate-600 bg-white focus:outline-none">
            <option>10 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}
