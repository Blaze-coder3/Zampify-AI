import { cn } from "@/lib/utils";

export default function DepartmentBottleneck({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  // Assume data is ordered by cycle time descending as per mockup
  const maxCount = Math.max(...data.map(d => d.cycle_time), 1);

  // Gradient colors for the bars: top ones are red, then orange, yellow, green
  const getBarColor = (idx: number, len: number) => {
    const pct = idx / Math.max(len - 1, 1);
    if (pct < 0.25) return "bg-red-500";
    if (pct < 0.5) return "bg-orange-500";
    if (pct < 0.75) return "bg-amber-400";
    return "bg-emerald-500";
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-6">Bottleneck by Department</h3>
      
      <div className="flex text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
        <span className="w-[100px] shrink-0">Department</span>
        <span className="flex-1 text-center">Avg. Cycle Time (days)</span>
        <span className="w-[80px] text-right">vs Prev. 7 Days</span>
      </div>

      <div className="w-full flex flex-col gap-4 flex-1 justify-center">
        {data.map((item, idx) => {
          const isUp = item.trend > 0;
          const trendColor = isUp ? "text-red-500" : "text-emerald-500";
          
          return (
            <div key={idx} className="flex items-center text-xs">
              <span className="w-[100px] text-slate-700 font-medium shrink-0 truncate pr-2">{item.dept}</span>
              <div className="w-8 text-slate-800 font-bold text-right pr-2">{item.cycle_time.toFixed(1)}</div>
              <div className="flex-1 mr-4 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", getBarColor(idx, data.length))} 
                  style={{ width: `${(item.cycle_time / maxCount) * 100}%` }}
                ></div>
              </div>
              <div className={cn("w-[70px] text-right text-[10px] font-bold", trendColor)}>
                {isUp ? "↑" : "↓"} {Math.abs(item.trend).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-5 text-center mt-auto">
        <button className="text-xs font-semibold text-blue-600 hover:underline">View department analysis</button>
      </div>
    </div>
  );
}
