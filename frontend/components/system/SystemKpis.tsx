import { CheckCircle2, Box, Clock, Activity, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function KpiCard({ 
  title, 
  value, 
  unit,
  subtext,
  subtextNodes,
  trend, 
  trendUp, 
  icon: Icon, 
  colorGroup 
}: { 
  title: string, 
  value: string | number, 
  unit?: string,
  subtext?: string,
  subtextNodes?: React.ReactNode,
  trend?: number, 
  trendUp?: boolean,
  icon: any, 
  colorGroup: "blue" | "green" | "red"
}) {
  
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-blue-500", border: "border-blue-200" },
    green: { bg: "bg-emerald-50", text: "text-emerald-500", border: "border-emerald-200" },
    red: { bg: "bg-red-50", text: "text-red-500", border: "border-red-200" },
  };

  const c = colors[colorGroup];
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow flex-1 min-w-[150px]">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 border", c.bg, c.text, c.border)}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      
      <div className="flex flex-col justify-center w-full">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-slate-800 tracking-tight">{value}</span>
          {unit && <span className="text-xs font-semibold text-slate-600">{unit}</span>}
        </div>
        
        {subtext && (
          <div className="text-[11px] text-slate-500 mt-1 font-medium">{subtext}</div>
        )}
        
        {subtextNodes && (
          <div className="mt-1">{subtextNodes}</div>
        )}
        
        {trend !== undefined && (
          <div className="flex items-center text-[10px] font-bold mt-1">
            <span className={cn("mr-1", trendUp ? "text-emerald-500" : "text-red-500")}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
            <span className="text-slate-400 font-medium">vs last hour</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SystemKpis({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4">
      <KpiCard 
        title="Overall Status" 
        value={data.status?.value} 
        subtext={data.status?.subtext}
        icon={CheckCircle2} 
        colorGroup={data.status?.is_healthy ? "green" : "red"} 
      />
      <KpiCard 
        title="Services" 
        value={data.services?.total} 
        subtextNodes={
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{data.services?.healthy} Healthy</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>{data.services?.degraded} Degraded</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{data.services?.down} Down</span>
          </div>
        }
        icon={Box} 
        colorGroup="blue" 
      />
      <KpiCard 
        title="Response Time (Avg)" 
        value={data.response_time?.value} 
        unit={data.response_time?.unit}
        trend={data.response_time?.trend}
        trendUp={data.response_time?.up}
        icon={Clock} 
        colorGroup="blue" 
      />
      <KpiCard 
        title="Throughput" 
        value={data.throughput?.value.toLocaleString()} 
        unit={data.throughput?.unit}
        trend={data.throughput?.trend}
        trendUp={data.throughput?.up}
        icon={Activity} 
        colorGroup="blue" 
      />
      <KpiCard 
        title="Error Rate" 
        value={data.error_rate?.value} 
        unit={data.error_rate?.unit}
        trend={data.error_rate?.trend}
        trendUp={data.error_rate?.up}
        icon={AlertTriangle} 
        colorGroup="red" 
      />
      <KpiCard 
        title="Active Users" 
        value={data.active_users?.value.toLocaleString()} 
        trend={data.active_users?.trend}
        trendUp={data.active_users?.up}
        icon={Users} 
        colorGroup="blue" 
      />
    </div>
  );
}
