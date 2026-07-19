import { 
  ExternalLink, Check, Mail, ScanText, FileText, 
  ShieldCheck, Gavel, Bell, ChevronRight, RefreshCcw, 
  Filter, MoreVertical, Lock, CheckCircle2, 
  ArrowUp, ArrowRight, ArrowDown, ChevronLeft
} from "lucide-react";
import { InvoiceSummary } from "@/lib/api";
import { cn } from "@/lib/utils";

interface InvoiceListViewProps {
  invoices: InvoiceSummary[];
  selectedInvoiceId?: string;
  onSelectInvoice: (invoice: InvoiceSummary) => void;
  onRefresh: () => void;
}

const pipelineStages = [
  { name: 'Email Ingest', count: 125, icon: Mail, active: false },
  { name: 'OCR', count: 125, icon: ScanText, active: false },
  { name: 'Extraction', count: 124, icon: FileText, active: false },
  { name: 'Validation', count: 14, icon: ShieldCheck, active: true },
  { name: 'Decision', count: '-', icon: Gavel, active: false },
  { name: 'Notification', count: '-', icon: Bell, active: false },
];

export default function InvoiceListView({ invoices, selectedInvoiceId, onSelectInvoice, onRefresh }: InvoiceListViewProps) {
  // Use mock data styling mapping for demo purposes.
  // In a real app, map backend statuses to these visual attributes.
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden min-w-[500px]">
      {/* Welcome Banner */}
      <div className="bg-white p-6 border-b border-slate-200 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center">
              Welcome back, Priya! <span className="ml-2 text-2xl">👋</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">You have {invoices.filter(i => i.status === 'needs_review').length} exceptions requiring your attention.</p>
          </div>
          <button className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 text-blue-600 bg-white transition-colors">
            <ExternalLink size={18} />
          </button>
        </div>

        {/* Pipeline Stepper */}
        <div className="mt-8 relative">
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 z-0"></div>
          
          <div className="flex justify-between relative z-10">
            {pipelineStages.map((stage, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white",
                  stage.active ? "border-blue-500 text-blue-600 shadow-sm" : 
                  idx < 3 ? "border-green-500 text-green-500" : "border-slate-200 text-slate-400"
                )}>
                  {idx < 3 ? <Check size={20} /> : <stage.icon size={18} />}
                </div>
                <div className="mt-2 text-center">
                  <div className={cn("text-xs font-semibold", stage.active ? "text-slate-800" : "text-slate-600")}>{stage.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{stage.count}</div>
                </div>
                {idx > 0 && (
                  <div className="absolute top-5 -ml-20 text-slate-300 bg-white px-1">
                    <ChevronRight size={14} className={idx === 3 ? "text-blue-500" : ""} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
            <h2 className="text-base font-semibold text-slate-800">Processing Pipeline ({invoices.length})</h2>
            <div className="flex items-center space-x-2">
              <button onClick={onRefresh} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"><RefreshCcw size={16} /></button>
              <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"><Filter size={16} /></button>
              <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"><MoreVertical size={16} /></button>
            </div>
          </div>
          
          {/* Sub Filters */}
          <div className="px-4 py-3 border-b border-slate-100 flex space-x-2 shrink-0 overflow-x-auto">
            <button className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 flex items-center whitespace-nowrap transition-colors">
              <Lock size={12} className="mr-1.5" /> All {invoices.length}
            </button>
            <button className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-100 flex items-center whitespace-nowrap transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span> Needs Review {invoices.filter(i => i.status === 'needs_review').length}
            </button>
            <button className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100 flex items-center whitespace-nowrap transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> Processing {invoices.filter(i => i.status !== 'needs_review' && i.status !== 'approved').length}
            </button>
            <button className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100 flex items-center whitespace-nowrap transition-colors">
              <CheckCircle2 size={12} className="mr-1.5" /> Approved {invoices.filter(i => i.status === 'approved').length}
            </button>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 bg-slate-50/50 sticky top-0 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice ID</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Current Stage</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const conf = inv.overall_confidence || 0;
                  const isHighRisk = conf < 0.7;
                  const isMediumRisk = conf >= 0.7 && conf < 0.9;
                  const priority = isHighRisk ? 'High' : isMediumRisk ? 'Medium' : 'Low';
                  
                  return (
                    <tr 
                      key={inv.id} 
                      onClick={() => onSelectInvoice(inv)}
                      className={cn(
                        "hover:bg-blue-50/50 cursor-pointer transition-colors",
                        selectedInvoiceId === inv.id ? "bg-blue-50/80 border-l-2 border-blue-500" : "border-l-2 border-transparent"
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-slate-700">{inv.id}</td>
                      <td className="px-4 py-3 text-slate-600">{inv.vendor_name || "Unknown"}</td>
                      <td className="px-4 py-3 text-right text-slate-700 font-medium">
                        ${inv.grand_total ? inv.grand_total.toLocaleString('en-US', {minimumFractionDigits: 2}) : "0.00"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 capitalize">{inv.status.replace("_", " ")}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center text-xs font-medium",
                          isHighRisk ? "text-red-600" : isMediumRisk ? "text-amber-600" : "text-green-600"
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full mr-1.5",
                            isHighRisk ? "bg-red-500" : isMediumRisk ? "bg-amber-500" : "bg-green-500"
                          )}></span>
                          {isHighRisk ? 'High' : isMediumRisk ? 'Medium' : 'Low'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center text-xs font-medium",
                          priority === 'High' ? "text-red-600" : priority === 'Medium' ? "text-amber-600" : "text-slate-600"
                        )}>
                          {priority === 'High' && <ArrowUp size={12} className="mr-1" />}
                          {priority === 'Medium' && <ArrowRight size={12} className="mr-1 text-amber-500" />}
                          {priority === 'Low' && <ArrowDown size={12} className="mr-1 text-green-500" />}
                          {priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">Unassigned</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {Math.floor((Date.now() - new Date(inv.received_at || Date.now()).getTime()) / 60000)}m
                      </td>
                      <td className="pr-4 pl-1 text-right text-slate-300"><ChevronRight size={16} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-center bg-white shrink-0">
            <div className="flex space-x-1">
              <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-400 hover:bg-slate-50 transition-colors" disabled><ChevronLeft size={14} /></button>
              <button className="px-3 py-1 border border-blue-500 bg-blue-50 text-blue-600 rounded-md text-sm font-medium">1</button>
              <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 text-sm transition-colors">2</button>
              <button className="px-3 py-1 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
