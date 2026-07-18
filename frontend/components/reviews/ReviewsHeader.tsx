import { Calendar, ChevronDown, Download } from "lucide-react";

export default function ReviewsHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">Review and take action on invoices requiring your attention.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 md:mt-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Range</span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <span>15 May - 21 May 2025</span>
            <Calendar size={14} className="text-slate-400" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">View</span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors w-40 justify-between">
            <span>Assigned to me</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95">
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
}
