import { Mail, ScanLine, FileSearch, ShieldCheck, FileKey, UserCheck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const stepIcons: Record<string, any> = {
  "Email Ingest": Mail,
  "OCR": ScanLine,
  "Data Extraction": FileSearch,
  "Validation": ShieldCheck,
  "Three-Way Match": FileKey,
  "Approval": UserCheck,
  "Payment Run": CreditCard,
};

function getRankBadge(rank: number) {
  if (rank === 1) return "bg-orange-100 text-orange-600";
  if (rank === 2) return "bg-amber-100 text-amber-600";
  if (rank === 3) return "bg-yellow-100 text-yellow-600";
  return "bg-slate-100 text-slate-500";
}

export default function TopBottlenecksTable({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Top Bottleneck Steps</h3>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center w-12">Rank</th>
              <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Process Step</th>
              <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Avg. Time (hrs)</th>
              <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">% of Total Time</th>
              <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">vs Prev. 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const Icon = stepIcons[row.step] || UserCheck;
              const isUp = row.trend_vs_prev > 0; // If time increased, it's bad (red). If decreased, it's good (green).
              const trendColor = isUp ? "text-red-500" : "text-emerald-500";
              const trendArrow = isUp ? "↑" : "↓";

              return (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-2.5 px-2">
                    <div className="flex justify-center">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold", getRankBadge(row.rank))}>
                        {row.rank}
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-blue-500 shrink-0" />
                      <span className="text-xs text-slate-700 font-medium whitespace-nowrap">{row.step}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-xs text-slate-800 font-semibold">{row.avg_time.toFixed(1)}</td>
                  <td className="py-2.5 px-2 text-center text-xs text-slate-600">{row.pct_total.toFixed(1)}%</td>
                  <td className={cn("py-2.5 px-2 text-center text-[11px] font-bold", trendColor)}>
                    {trendArrow} {Math.abs(row.trend_vs_prev).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
