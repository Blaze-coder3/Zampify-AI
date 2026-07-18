import { Bookmark, SlidersHorizontal, Download } from "lucide-react";

export default function ArchiveHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Search & Archive</h1>
        <p className="text-sm text-slate-500 mt-1">Search, view and manage all invoices, documents and communications.</p>
      </div>

      <div className="flex items-center gap-3 mt-4 sm:mt-0">
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <Bookmark size={15} className="text-blue-500" />
          Saved Searches
        </button>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <SlidersHorizontal size={15} className="text-blue-500" />
          Advanced Search
        </button>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download size={15} />
          Export
        </button>
      </div>
    </div>
  );
}
