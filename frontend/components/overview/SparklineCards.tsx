import { cn } from "@/lib/utils";

function Sparkline({ color, up }: { color: string, up: boolean }) {
  // Generate a random-looking sparkline that fits the trend
  const pts = up 
    ? [20, 18, 15, 12, 14, 10, 8, 5, 2] // Trending up (smaller y is higher visually)
    : [2, 5, 4, 8, 12, 10, 15, 18, 20]; // Trending down

  const max = 20;
  const width = 60;
  const height = 20;
  const dx = width / (pts.length - 1);

  const d = pts.map((y, i) => {
    return `${i === 0 ? 'M' : 'L'} ${i * dx} ${(y / max) * height}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniCard({ 
  title, 
  value, 
  unit, 
  trend, 
  colorStr 
}: { 
  title: string, 
  value: string | number, 
  unit: string, 
  trend: number,
  colorStr: "blue" | "green" | "purple" | "orange" | "red"
}) {
  const up = trend > 0;
  const trendColor = up ? "text-emerald-500" : "text-amber-500";
  const trendIcon = up ? "↑" : "↓";
  
  const lineColors = {
    blue: "#3b82f6",
    green: "#10b981",
    purple: "#8b5cf6",
    orange: "#f59e0b",
    red: "#ef4444"
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex-1 min-w-[160px] hover:shadow-md transition-shadow">
      <h3 className="text-xs font-semibold text-slate-700 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            {title.includes("Cost Savings") && <span className="text-xl font-bold text-slate-800 tracking-tight">$</span>}
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              {title.includes("Cost Savings") ? (value as number).toLocaleString() : value}
            </span>
            <span className="text-sm font-semibold text-blue-600">{unit}</span>
          </div>
          <div className="flex items-center text-[10px] font-medium mt-1 text-slate-400">
            <span className={cn("mr-1 font-semibold", trendColor)}>
              {trendIcon} {Math.abs(trend)}%
            </span>
            vs last week
          </div>
        </div>
        <div className="mb-2">
          <Sparkline color={lineColors[colorStr]} up={up} />
        </div>
      </div>
    </div>
  );
}

export default function SparklineCards({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4">
      <MiniCard 
        title="Average Processing Time" 
        value={data.avg_processing_time?.value} 
        unit={data.avg_processing_time?.unit} 
        trend={data.avg_processing_time?.trend} 
        colorStr="blue" 
      />
      <MiniCard 
        title="SLA Compliance" 
        value={data.sla_compliance?.value} 
        unit={data.sla_compliance?.unit} 
        trend={data.sla_compliance?.trend} 
        colorStr="green" 
      />
      <MiniCard 
        title="First Time Straight Through Rate" 
        value={data.first_time_str?.value} 
        unit={data.first_time_str?.unit} 
        trend={data.first_time_str?.trend} 
        colorStr="purple" 
      />
      <MiniCard 
        title="Cost Savings (Auto Processing)" 
        value={data.cost_savings?.value} 
        unit="" // Handled in component with $ 
        trend={data.cost_savings?.trend} 
        colorStr="blue" 
      />
      <MiniCard 
        title="Exceptions Rate" 
        value={data.exceptions_rate?.value} 
        unit={data.exceptions_rate?.unit} 
        trend={data.exceptions_rate?.trend} 
        colorStr="orange" 
      />
      <MiniCard 
        title="Duplicate Invoices" 
        value={data.duplicate_invoices?.value} 
        unit={data.duplicate_invoices?.unit} 
        trend={data.duplicate_invoices?.trend} 
        colorStr="red" 
      />
    </div>
  );
}
