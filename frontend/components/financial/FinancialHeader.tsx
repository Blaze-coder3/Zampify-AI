import { Calendar, Download, ChevronDown } from "lucide-react";

export default function FinancialHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Snapshot</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time view of spend, payments, and cash flow across the organization.</p>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <div className="flex flex-col mr-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Date Range</span>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors w-[220px] justify-between h-[36px]">
            <span>15 May – 21 May 2025</span>
            <Calendar size={14} className="text-slate-400" />
          </div>
        </div>
        
        <div className="flex flex-col mr-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Compare with</span>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors w-[220px] justify-between h-[36px]">
            <span>08 May – 14 May 2025</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm h-[36px] mt-4">
          <Download size={14} />
          Export
        </button>
      </div>
    </div>
  );
}
