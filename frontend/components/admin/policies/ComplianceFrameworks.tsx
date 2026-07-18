import { CheckCircle2, Shield } from "lucide-react";

export default function ComplianceFrameworks({ data }: { data: any[] | undefined }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <Shield size={16} className="text-slate-500" />
        <h3 className="text-sm font-bold text-slate-800">Compliance Frameworks</h3>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span className="text-[11px] font-medium text-slate-700">{item.name}</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{item.status}</span>
          </div>
        ))}
      </div>
      <button className="mt-auto pt-4 text-xs font-semibold text-blue-600 hover:underline text-center">
        View compliances report
      </button>
    </div>
  );
}
