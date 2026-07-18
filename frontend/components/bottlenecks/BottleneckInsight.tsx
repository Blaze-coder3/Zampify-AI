import { Info, ChevronRight } from "lucide-react";

export default function BottleneckInsight() {
  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
      <div className="flex items-start md:items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
          <Info size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">
            The <span className="font-bold">Approval</span> step is the primary bottleneck, contributing <span className="font-bold">37.6%</span> of total cycle time.
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            Consider reviewing approval rules and workload distribution.
          </p>
        </div>
      </div>
      
      <button className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm shrink-0">
        View Recommendations
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
