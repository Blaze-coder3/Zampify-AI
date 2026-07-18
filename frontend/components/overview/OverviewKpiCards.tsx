import { FileText, CheckCircle2, Bot, UserCog, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

function KpiCard({ 
  title, 
  value, 
  pct,
  trendStr, 
  trendUp, 
  icon: Icon, 
  colorGroup 
}: { 
  title: string, 
  value: string | number, 
  pct?: number,
  trendStr: string, 
  trendUp: boolean,
  icon: any, 
  colorGroup: "blue" | "green" | "amber" | "red" | "purple"
}) {
  
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-blue-500", trend: "text-blue-500" },
    green: { bg: "bg-emerald-50", text: "text-emerald-500", trend: "text-emerald-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-500", trend: "text-amber-500" },
    red: { bg: "bg-red-50", text: "text-red-500", trend: "text-red-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-500", trend: "text-purple-500" }
  };

  const c = colors[colorGroup];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow flex-1 min-w-[160px]">
      <div className="flex flex-col justify-between relative z-10">
        <h3 className="text-xs font-semibold text-slate-700">{title}</h3>
        <div className="flex items-baseline gap-2 mt-2 mb-1">
          <span className="text-2xl font-bold text-slate-800 tracking-tight">{value}</span>
          {pct !== undefined && <span className="text-sm font-semibold text-slate-500">({pct}%)</span>}
        </div>
        <div className="flex items-center text-[11px] font-medium mt-auto">
          <span className={cn("mr-1", trendUp ? "text-emerald-500" : "text-amber-500")}>
            {trendUp ? "↑" : "↓"} {trendStr}
          </span>
          <span className="text-slate-400">vs last week</span>
        </div>
      </div>
      <div className="relative z-10">
        <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300", c.bg, c.text)}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Decorative gradient blur */}
      <div className={cn("absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-30", c.bg)}></div>
    </div>
  );
}

export default function OverviewKpiCards({ data }: { data: any }) {
  if (!data) return null;

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  };

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4">
      <KpiCard 
        title="Total Invoices" 
        value={data.total_invoices?.value?.toLocaleString() || "0"} 
        trendStr={`${data.total_invoices?.trend || 0}%`}
        trendUp={data.total_invoices?.up}
        icon={FileText} 
        colorGroup="blue" 
      />
      <KpiCard 
        title="Processed" 
        value={data.processed?.value?.toLocaleString() || "0"} 
        trendStr={`${data.processed?.trend || 0}%`}
        trendUp={data.processed?.up}
        icon={CheckCircle2} 
        colorGroup="green" 
      />
      <KpiCard 
        title="Auto Approved" 
        value={data.auto_approved?.value?.toLocaleString() || "0"} 
        pct={data.auto_approved?.pct}
        trendStr={`${data.auto_approved?.trend || 0}%`}
        trendUp={data.auto_approved?.up}
        icon={Bot} 
        colorGroup="green" 
      />
      <KpiCard 
        title="Needs Review" 
        value={data.needs_review?.value?.toLocaleString() || "0"} 
        pct={data.needs_review?.pct}
        trendStr={`${data.needs_review?.trend || 0}%`}
        trendUp={data.needs_review?.up}
        icon={UserCog} 
        colorGroup="amber" 
      />
      <KpiCard 
        title="Overdue" 
        value={data.overdue?.value?.toLocaleString() || "0"} 
        pct={data.overdue?.pct}
        trendStr={`${data.overdue?.trend || 0}%`}
        trendUp={data.overdue?.up}
        icon={Clock} 
        colorGroup="red" 
      />
      <KpiCard 
        title="Total Spend" 
        value={formatCurrency(data.total_spend?.value || 0)} 
        trendStr={`${data.total_spend?.trend || 0}%`}
        trendUp={data.total_spend?.up}
        icon={DollarSign} 
        colorGroup="purple" 
      />
    </div>
  );
}
