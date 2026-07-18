import { Clock, RefreshCw, Download, Info } from "lucide-react";

export default function SystemHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Graph</h1>
          <Info size={16} className="text-slate-400" />
        </div>
        <p className="text-sm text-slate-500 mt-1">Real-time system architecture, service dependencies, and performance monitoring.</p>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors h-[36px]">
          <Clock size={14} className="text-slate-400" />
          <span>Last 1 Hour</span>
          <svg className="w-4 h-4 text-slate-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
        
        <button className="flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm h-[36px]">
          <RefreshCw size={14} />
        </button>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm h-[36px]">
          <Download size={14} />
          Export
        </button>
      </div>
    </div>
  );
}
