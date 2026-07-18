import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function MiniAreaChart({ 
  title, 
  data, 
  times,
  maxVal,
  labels,
  stats,
  color,
  fillColor
}: { 
  title: string, 
  data: number[], 
  times: string[],
  maxVal: number,
  labels: string[],
  stats: { current: string | number, currentLabel: string, peak: string | number, peakLabel: string, avg: string | number, avgLabel: string },
  color: string,
  fillColor: string
}) {
  const width = 300;
  const height = 120;
  
  const dx = width / (data.length - 1);

  const pathD = data.map((val, i) => {
    const y = height - (val / maxVal) * height;
    return `${i === 0 ? 'M' : 'L'} ${i * dx} ${y}`;
  }).join(' ');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="flex flex-col border border-slate-200 bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-800">{title}</h3>
        <div className="flex items-center gap-1.5 px-2 py-1 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
          Last 1 Hour <ChevronDown size={12} className="text-slate-400" />
        </div>
      </div>
      
      <div className="flex-1 flex w-full relative mb-3">
        {/* Y Axis Labels */}
        <div className="flex flex-col justify-between text-[9px] font-semibold text-slate-400 w-8 pr-1 shrink-0 h-[120px]">
          <span className="-mt-1">{labels[0]}</span>
          <span>{labels[1]}</span>
          <span>{labels[2]}</span>
          <span>{labels[3]}</span>
          <span className="-mb-1">{labels[4]}</span>
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 relative h-[120px]">
          <div className="absolute inset-0 flex flex-col justify-between z-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full border-t border-slate-100/80"></div>
            ))}
          </div>
          
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute inset-0 z-10" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillColor} stopOpacity="0.5" />
                <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#grad-${title.replace(/\s+/g, '')})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Last point dot */}
            <circle cx={width} cy={height - (data[data.length - 1] / maxVal) * height} r="3" fill={color} className="shadow-sm" />
          </svg>
        </div>
      </div>
      
      {/* X Axis Labels */}
      <div className="flex justify-between text-[9px] font-semibold text-slate-400 pl-8 mb-4">
        {times.filter((_: any, i: number) => i % 2 === 0).map((t: string, i: number) => (
          <span key={i}>{t}</span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
        <div>
           <div className="text-[10px] text-slate-500 mb-0.5">{stats.currentLabel}</div>
           <div className="text-sm font-bold text-slate-800">{stats.current}</div>
        </div>
        <div>
           <div className="text-[10px] text-slate-500 mb-0.5">{stats.peakLabel}</div>
           <div className="text-sm font-bold text-slate-800">{stats.peak}</div>
        </div>
        <div>
           <div className="text-[10px] text-slate-500 mb-0.5">{stats.avgLabel}</div>
           <div className="text-sm font-bold text-slate-800">{stats.avg}</div>
        </div>
      </div>
    </div>
  );
}

export default function SystemHealthCharts({ data }: { data: any }) {
  if (!data) return null;

  return (
    <>
      <MiniAreaChart
        title="Request Rate (Requests/Second)"
        data={data.request_rate.data}
        times={data.times}
        maxVal={2000}
        labels={["2K", "1.5K", "1K", "500", "0"]}
        stats={{
          current: `${data.request_rate.current.toLocaleString()} req/s`, currentLabel: "Current",
          peak: `${data.request_rate.peak.toLocaleString()} req/s`, peakLabel: "Peak",
          avg: `${data.request_rate.average.toLocaleString()} req/s`, avgLabel: "Average"
        }}
        color="#3b82f6" // blue
        fillColor="#3b82f6"
      />
      
      <MiniAreaChart
        title="Error Rate (%)"
        data={data.error_rate.data}
        times={data.times}
        maxVal={0.8}
        labels={["0.8%", "0.6%", "0.4%", "0.2%", "0%"]}
        stats={{
          current: `${data.error_rate.current}%`, currentLabel: "Current",
          peak: `${data.error_rate.peak}%`, peakLabel: "Peak",
          avg: `${data.error_rate.average}%`, avgLabel: "Average"
        }}
        color="#ef4444" // red
        fillColor="#ef4444"
      />
      
      <MiniAreaChart
        title="Database Connections"
        data={data.db_connections.data}
        times={data.times}
        maxVal={1000}
        labels={["1K", "750", "500", "250", "0"]}
        stats={{
          current: data.db_connections.current, currentLabel: "Current",
          peak: data.db_connections.max, peakLabel: "Max",
          avg: data.db_connections.idle, avgLabel: "Idle"
        }}
        color="#10b981" // green
        fillColor="#10b981"
      />
    </>
  );
}
