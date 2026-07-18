import { cn } from "@/lib/utils";

function getSlaColor(pct: number) {
  if (pct >= 90) return "text-emerald-500";
  if (pct >= 80) return "text-amber-500";
  return "text-red-500";
}

function getReviewTimePill(hrs: number) {
  if (hrs < 2.0) return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (hrs < 2.5) return "bg-emerald-50 text-emerald-600 border-emerald-200";
  return "bg-amber-50 text-amber-600 border-amber-200";
}

export default function TeamPerformanceTable({ data }: { data: any[] }) {
  if (!data) return null;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Team Performance</h3>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Team Member</th>
              <th className="py-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Processed</th>
              <th className="py-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Approved %</th>
              <th className="py-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">SLA %</th>
              <th className="py-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Avg. Review Time</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {row.avatar}
                    </div>
                    <span className="text-xs text-slate-700 font-medium whitespace-nowrap">{row.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-xs text-slate-600 text-center">{row.processed}</td>
                <td className="py-3 px-2 text-xs text-slate-600 text-center">{row.approved_pct}%</td>
                <td className={cn("py-3 px-2 text-xs font-semibold text-center", getSlaColor(row.sla_pct))}>{row.sla_pct}%</td>
                <td className="py-3 px-2 text-center">
                  <span className={cn("px-2 py-0.5 text-[10px] font-medium border rounded-full whitespace-nowrap", getReviewTimePill(row.avg_review_hrs))}>
                    {row.avg_review_hrs} hrs
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pt-3 text-center">
        <button className="text-xs font-semibold text-blue-600 hover:underline">View full team performance</button>
      </div>
    </div>
  );
}
