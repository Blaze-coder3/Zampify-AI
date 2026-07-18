import { cn } from "@/lib/utils";

export default function VendorBottleneck({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Bottleneck by Vendor</h3>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vendor</th>
              <th className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Avg. Cycle Time (days)</th>
              <th className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bottleneck Step</th>
              <th className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">vs Prev. 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const isUp = row.trend > 0;
              const trendColor = isUp ? "text-red-500" : "text-emerald-500";
              const trendArrow = isUp ? "↑" : "↓";

              return (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-3 px-2 text-xs text-slate-700 font-medium truncate max-w-[120px]">{row.vendor}</td>
                  <td className="py-3 px-2 text-xs text-slate-800 font-bold text-center">{row.cycle_time.toFixed(1)}</td>
                  <td className="py-3 px-2 text-xs text-slate-600">{row.step}</td>
                  <td className={cn("py-3 px-2 text-right text-[10px] font-bold", trendColor)}>
                    {trendArrow} {Math.abs(row.trend).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="pt-3 text-center mt-auto">
        <button className="text-xs font-semibold text-blue-600 hover:underline">View all vendors</button>
      </div>
    </div>
  );
}
