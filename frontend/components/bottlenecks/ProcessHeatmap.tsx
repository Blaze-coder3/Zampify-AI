import { Info, Mail, ScanLine, FileSearch, ShieldCheck, FileKey, UserCheck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

// Generate sparkline for the trend column
function TrendSparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const width = 60;
  const height = 16;
  const dx = width / (data.length - 1);

  // If start value > end value, trend is down (good), if start < end, trend is up (bad)
  const isUp = data[data.length - 1] > data[0];
  const color = isUp ? "#ef4444" : "#10b981"; // Red if increasing cycle time, Green if decreasing

  const d = data.map((y, i) => {
    // scale y between 2 and height-2 for padding
    const scaledY = height - 2 - ((y - min) / (max - min || 1)) * (height - 4);
    return `${i === 0 ? 'M' : 'L'} ${i * dx} ${scaledY}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const stepIcons: Record<string, any> = {
  "Email Ingest": Mail,
  "OCR": ScanLine,
  "Data Extraction": FileSearch,
  "Validation": ShieldCheck,
  "Three-Way Match": FileKey,
  "Approval": UserCheck,
  "Payment Run": CreditCard,
};

export default function ProcessHeatmap({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  // Flatten to find min and max values across ALL cells to compute heat scale
  let minVal = Infinity;
  let maxVal = -Infinity;
  data.forEach(row => {
    row.days.forEach((v: number) => {
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    });
  });

  const getHeatColor = (val: number) => {
    // Normalize between 0 and 1
    const norm = (val - minVal) / (maxVal - minVal || 1);
    
    // Simple custom scale mapping
    if (norm < 0.2) return "bg-green-200 text-green-900";
    if (norm < 0.4) return "bg-green-300 text-green-900";
    if (norm < 0.6) return "bg-yellow-200 text-yellow-900";
    if (norm < 0.8) return "bg-orange-300 text-orange-900";
    return "bg-red-400 text-red-900";
  };

  const dates = ["15 May", "16 May", "17 May", "18 May", "19 May", "20 May", "21 May"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 mb-5">
        <h3 className="text-sm font-bold text-slate-800">Process Step Heatmap (Avg. Time in Hours)</h3>
        <Info size={14} className="text-slate-400" />
      </div>
      
      <div className="flex-1 overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse border-spacing-1" style={{ borderSpacing: '4px', borderCollapse: 'separate' }}>
          <thead>
            <tr>
              <th className="pb-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-[140px]">Process Step</th>
              {dates.map((d, i) => (
                <th key={i} className="pb-3 px-2 text-[11px] font-semibold text-slate-800 text-center">{d}</th>
              ))}
              <th className="pb-3 px-2 text-[11px] font-semibold text-slate-800 text-center">Avg. (hrs)</th>
              <th className="pb-3 px-2 text-[11px] font-semibold text-slate-800 text-center">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const Icon = stepIcons[row.step] || Info;
              return (
                <tr key={idx}>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-blue-500 shrink-0" />
                      <span className="text-xs text-slate-600 font-medium whitespace-nowrap">{row.step}</span>
                    </div>
                  </td>
                  {row.days.map((val: number, i: number) => (
                    <td key={i} className={cn("p-2 text-center text-xs font-semibold rounded-md", getHeatColor(val))}>
                      {val.toFixed(1)}
                    </td>
                  ))}
                  <td className="py-2.5 px-2 text-center text-xs font-semibold text-slate-800">
                    {row.avg.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center justify-center">
                      <TrendSparkline data={row.trend} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-4 text-xs font-semibold text-slate-600 ml-[140px]">
        <span>Low (Good)</span>
        <div className="h-2 w-64 rounded-full bg-gradient-to-r from-green-300 via-yellow-200 to-red-400"></div>
        <span>High (Bottleneck)</span>
      </div>
    </div>
  );
}
