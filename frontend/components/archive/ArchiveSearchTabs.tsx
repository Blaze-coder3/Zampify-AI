import { useState } from "react";
import { Search, Calendar, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  "All Documents", 
  "Invoices", 
  "Purchase Orders", 
  "Credit Notes", 
  "Vendor Emails", 
  "Attachments", 
  "Deleted"
];

export default function ArchiveSearchTabs({ searchQuery, onSearchChange }: { searchQuery: string, onSearchChange: (q: string) => void }) {
  const [activeTab, setActiveTab] = useState("All Documents");

  return (
    <div className="flex flex-col mb-4">
      {/* Search and Date Row */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by invoice number, vendor name, PO number, amount, email subject..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors w-[260px] justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <span>15 May 2024 – 21 May 2025</span>
            </div>
            <Trash2 size={14} className="text-slate-300 hover:text-slate-500" />
          </div>
          
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 whitespace-nowrap">
            Clear All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto hide-scrollbar">
        {TABS.map(tab => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-3 text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors border-b-2",
              activeTab === tab 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            )}
          >
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
}
