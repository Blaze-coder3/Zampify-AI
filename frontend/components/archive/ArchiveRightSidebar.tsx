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

    </div>
  );
}
