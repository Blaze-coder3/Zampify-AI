import { Clock, Timer, Gauge, AlertTriangle, CheckCircle2, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

function KpiCard({ 
  title, 
  value, 
  unit,
  trend, 
  trendUp, 
  icon: Icon, 
  colorGroup 
}: { 
  title: string, 
  value: string | number, 
  unit?: string,
  trend: number, 
  trendUp: boolean,
  icon: any, 
  colorGroup: "blue" | "orange" | "purple" | "red" | "green"
}) {
  
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-blue-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-500" },
    red: { bg: "bg-red-50", text: "text-red-500" },
    green: { bg: "bg-emerald-50", text: "text-emerald-500" }
  };

  const c = colors[colorGroup];
  
  // Trend color logic based on the specific metric type (e.g. up is good for completion, bad for cycle time)
  // For the heatmap mockup, most trends are showing in a specific red/green way, we will pass 'trendUp' 
  // as true if it's a "good" thing, false if it's "bad".
  const trendColor = trendUp ? "text-emerald-500" : "text-red-500";
  const trendIcon = trendUp ? "↑" : "↑"; // Wait, in the mockup almost all are up arrows, but colored red if it's worse.

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow flex-1 min-w-[160px]">
      <div className="flex flex-col justify-between relative z-10">
        <h3 className="text-xs font-semibold text-slate-700">{title}</h3>
        <div className="flex items-baseline gap-1 mt-2 mb-1">
          <span className="text-2xl font-bold text-slate-800 tracking-tight">{value}</span>
          {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
        </div>
        <div className="flex items-center text-[11px] font-medium mt-auto">
          <span className={cn("mr-1", trendColor)}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span className="text-slate-400">vs prev. 7 days</span>
        </div>
      </div>
      <div className="relative z-10">
        <div className={cn("p-2.5 rounded-xl border transition-transform group-hover:scale-110 duration-300", c.bg, c.text, c.text.replace("text-", "border-").replace("500", "200"))}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Decorative gradient blur */}
      <div className={cn("absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-30", c.bg)}></div>
    </div>
  );
}

export default function BottleneckKpis({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4">
      <KpiCard 
        title="Avg. Cycle Time" 
        value={data.avg_cycle_time?.value} 
        unit={data.avg_cycle_time?.unit}
        trend={data.avg_cycle_time?.trend}
        trendUp={data.avg_cycle_time?.up}
        icon={Clock} 
        colorGroup="blue" 
      />
      <KpiCard 
        title="Max Cycle Time" 
        value={data.max_cycle_time?.value} 
        unit={data.max_cycle_time?.unit}
        trend={data.max_cycle_time?.trend}
        trendUp={data.max_cycle_time?.up}
        icon={Timer} 
        colorGroup="orange" 
      />
      <KpiCard 
        title="% In Bottleneck" 
        value={data.pct_in_bottleneck?.value} 
        unit={data.pct_in_bottleneck?.unit}
        trend={data.pct_in_bottleneck?.trend}
        trendUp={data.pct_in_bottleneck?.up}
        icon={Gauge} 
        colorGroup="purple" 
      />
      <KpiCard 
        title="Bottleneck Invoices" 
        value={data.bottleneck_invoices?.value?.toLocaleString() || "0"} 
        trend={data.bottleneck_invoices?.trend}
        trendUp={data.bottleneck_invoices?.up}
        icon={AlertTriangle} 
        colorGroup="red" 
      />
      <KpiCard 
        title="On-Time Completion" 
        value={data.on_time_completion?.value} 
        unit={data.on_time_completion?.unit}
        trend={data.on_time_completion?.trend}
        trendUp={data.on_time_completion?.up}
        icon={CheckCircle2} 
        colorGroup="green" 
      />
      <KpiCard 
        title="SLA Breaches" 
        value={data.sla_breaches?.value} 
        trend={data.sla_breaches?.trend}
        trendUp={data.sla_breaches?.up}
        icon={ShieldX} 
        colorGroup="red" 
      />
    </div>
  );
}
