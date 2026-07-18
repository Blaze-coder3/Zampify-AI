import { ChevronDown } from "lucide-react";

// Sparkline SVG generator
function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const width = 80;
  const height = 24;
  const dx = width / (data.length - 1);
  
  const points = data.map((val, i) => {
    const y = height - ((val - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'} ${i * dx} ${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ServiceResponseTable({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Top Services by Response Time</h3>
        <div className="flex items-center gap-1.5 px-2 py-1 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
          Last 1 Hour <ChevronDown size={12} className="text-slate-400" />
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Service</th>
              <th className="pb-3 px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Avg Response Time</th>
              <th className="pb-3 px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              // Decide color based on response time thresholds
              let color = "#3b82f6"; // blue
              if (row.avg_time > 800) color = "#ef4444"; // red
              else if (row.avg_time > 500) color = "#f59e0b"; // orange
              else if (row.avg_time < 300) color = "#10b981"; // green

              return (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-2.5 px-1 text-xs text-slate-700 font-medium">{row.service}</td>
                  <td className="py-2.5 px-1 text-xs text-slate-800 font-bold text-center">
                    {row.avg_time} ms
                  </td>
                  <td className="py-2.5 px-1 flex justify-end">
                    <Sparkline data={row.trend_data} color={color} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="pt-2 text-center mt-auto">
        <button className="text-xs font-semibold text-blue-600 hover:underline">View all services</button>
      </div>
    </div>
  );
}
