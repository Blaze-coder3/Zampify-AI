import { Search, ChevronDown } from "lucide-react";

export default function PolicyFilters() {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search policies..." className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 w-44" />
      </div>
      {["All Categories", "All Status", "All Policy Types"].map(label => (
        <button key={label} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors">
          {label} <ChevronDown size={12} className="text-slate-400" />
        </button>
      ))}
      <button className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors">More Filters</button>
      <button className="text-xs font-semibold text-blue-600 hover:underline px-1">Clear</button>
    </div>
  );
}
