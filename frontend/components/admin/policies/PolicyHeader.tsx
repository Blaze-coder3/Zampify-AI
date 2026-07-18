import { FlaskConical, Upload, Plus, ChevronDown } from "lucide-react";

export default function PolicyHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Policy Centre</h1>
        <p className="text-sm text-slate-500 mt-1">Manage business rules, validation policies, approval workflows and compliance settings.</p>
      </div>
      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors h-[36px]">
          <FlaskConical size={14} className="text-slate-500" />
          Policy Simulator
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors h-[36px]">
          <Upload size={14} className="text-slate-500" />
          Import Policy
        </button>
        <div className="flex items-center">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-l-lg text-sm font-medium transition-colors shadow-sm h-[36px]">
            <Plus size={14} />
            Create Policy
          </button>
          <button className="flex items-center bg-blue-700 hover:bg-blue-800 text-white px-2 py-2 rounded-r-lg text-sm font-medium transition-colors shadow-sm h-[36px] border-l border-blue-500">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
