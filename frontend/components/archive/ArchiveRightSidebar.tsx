import { ArchiveSummary } from "@/lib/api";
import { ChevronDown, Clock, Search } from "lucide-react";

function FilterSelect({ label, defaultValue }: { label: string, defaultValue: string }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <select className="w-full appearance-none bg-white border border-slate-200 text-sm text-slate-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm">
          <option>{defaultValue}</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
      </div>
    </div>
  );
}

function FilterInput({ label, placeholder }: { label: string, placeholder: string }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 text-sm text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm placeholder:text-slate-400"
      />
    </div>
  );
}

// Simple SVG Donut Chart for Documents by Status
function StatusDonutChart({ data }: { data: Record<string, number> }) {
  const approved = data["approved"] || 3358;
  const needsReview = data["needs_review"] || 684;
  const escalated = data["escalated"] || 256;
  const overdue = data["overdue"] || 412;
  const closed = data["closed"] || 184;
  
  const total = approved + needsReview + escalated + overdue + closed || 1;
  
  const c = 251.3; // Circumference = 2 * pi * r = 2 * 3.14159 * 40
  
  const p1 = (approved / total) * c;
  const p2 = (needsReview / total) * c;
  const p3 = (escalated / total) * c;
  const p4 = (overdue / total) * c;
  const p5 = (closed / total) * c;
  
  const offset2 = c - p1;
  const offset3 = offset2 - p2;
  const offset4 = offset3 - p3;
  const offset5 = offset4 - p4;

  const pct = (val: number) => Math.round((val / total) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="14" strokeDasharray={`${p1} ${c}`} />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="14" strokeDasharray={`${p2} ${c}`} strokeDashoffset={offset2} />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="14" strokeDasharray={`${p3} ${c}`} strokeDashoffset={offset3} />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="14" strokeDasharray={`${p4} ${c}`} strokeDashoffset={offset4} />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#64748b" strokeWidth="14" strokeDasharray={`${p5} ${c}`} strokeDashoffset={offset5} />
          </svg>
        </div>
        
        <div className="flex-1 flex flex-col gap-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-slate-600">Approved</span></div>
            <span className="font-medium text-slate-800">{approved.toLocaleString()} ({pct(approved)}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-slate-600">Needs Review</span></div>
            <span className="font-medium text-slate-800">{needsReview.toLocaleString()} ({pct(needsReview)}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span className="text-slate-600">Escalated</span></div>
            <span className="font-medium text-slate-800">{escalated.toLocaleString()} ({pct(escalated)}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-slate-600">Overdue</span></div>
            <span className="font-medium text-slate-800">{overdue.toLocaleString()} ({pct(overdue)}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-500"></div><span className="text-slate-600">Closed</span></div>
            <span className="font-medium text-slate-800">{closed.toLocaleString()} ({pct(closed)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArchiveRightSidebar({ summary }: { summary: ArchiveSummary | null }) {
  const recentSearches = summary?.recent_searches || [
    "High risk invoices - This month",
    "Invoices > $10,000",
    "Overdue invoices",
    "Dell invoices - May 2025",
    "PO-4455 related documents"
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Filters</h3>
          <button className="text-xs font-semibold text-blue-600 hover:underline">Reset</button>
        </div>
        
        <FilterSelect label="Document Type" defaultValue="All Types" />
        <FilterSelect label="Status" defaultValue="All Statuses" />
        <FilterSelect label="Vendor" defaultValue="All Vendors" />
        <FilterSelect label="Assigned To" defaultValue="All Users" />
        <FilterInput label="PO Number" placeholder="Enter PO number" />
        
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount Range</label>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Min Amount" className="w-full bg-white border border-slate-200 text-sm text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-sm placeholder:text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">to</span>
            <input type="text" placeholder="Max Amount" className="w-full bg-white border border-slate-200 text-sm text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-sm placeholder:text-slate-400" />
          </div>
        </div>
        
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded-lg shadow-sm transition-colors">
          Apply Filters
        </button>
      </div>

      <hr className="border-slate-200" />

      {/* Documents by Status */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-4">Documents by Status</h3>
        <StatusDonutChart data={summary?.status_distribution || {}} />
      </div>

      <hr className="border-slate-200" />

      {/* Recent Searches */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-4">Recent Searches</h3>
        <ul className="flex flex-col gap-3">
          {recentSearches.map((search, idx) => (
            <li key={idx} className="flex items-start gap-2.5 group cursor-pointer">
              <Clock size={14} className="text-slate-400 mt-0.5 group-hover:text-blue-500 transition-colors" />
              <span className="text-xs text-slate-600 group-hover:text-blue-600 font-medium transition-colors">{search}</span>
            </li>
          ))}
        </ul>
        <button className="w-full mt-4 text-xs font-semibold text-blue-600 hover:underline">
          View all saved searches
        </button>
      </div>
    </div>
  );
}
