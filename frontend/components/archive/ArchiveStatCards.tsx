import { ArchiveSummary } from "@/lib/api";
import { FileText, Archive as ArchiveIcon, AlertTriangle, DollarSign, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({ 
  title, 
  value, 
  subtext, 
  subtextTrend = null, 
  icon: Icon, 
  iconColorClass, 
  iconBgClass 
}: { 
  title: string, 
  value: string | number, 
  subtext: string, 
  subtextTrend?: "up" | "down" | null,
  icon: any, 
  iconColorClass: string, 
  iconBgClass: string 
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow flex-1 min-w-[200px]">
      <div className="flex flex-col justify-between relative z-10">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
        <div className="text-3xl font-bold text-slate-800 mt-2 mb-1 tracking-tight">{value}</div>
        <div className="flex items-center text-xs text-slate-500 mt-auto">
          {subtextTrend === "up" && <span className="text-blue-500 font-bold mr-1">↑</span>}
          {subtextTrend === "down" && <span className="text-red-500 font-bold mr-1">↓</span>}
          <span className={subtextTrend ? "text-blue-600 font-medium mr-1" : ""}>{subtext.split(" ")[0]}</span>
          {subtext.substring(subtext.indexOf(" ") + 1)}
        </div>
      </div>
      <div className="relative z-10">
        <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300", iconBgClass, iconColorClass)}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Decorative gradient blur in background */}
      <div className={cn("absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-30", iconBgClass)}></div>
    </div>
  );
}

export default function ArchiveStatCards({ summary }: { summary: ArchiveSummary | null }) {
  const kpis = summary?.kpis || {
    total_invoices: 4892,
    archived: 3984,
    exceptions: 684,
    total_spend: 8740000,
    vendors_count: 512
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  };

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4 mb-5">
      <StatCard 
        title="Total Invoices" 
        value={kpis.total_invoices.toLocaleString()} 
        subtext="12% vs last month" 
        subtextTrend="up"
        icon={FileText} 
        iconColorClass="text-blue-500" 
        iconBgClass="bg-blue-50" 
      />
      
      <StatCard 
        title="Archived" 
        value={kpis.archived.toLocaleString()} 
        subtext={`${Math.round((kpis.archived / Math.max(kpis.total_invoices, 1)) * 100)}% of total`} 
        icon={ArchiveIcon} 
        iconColorClass="text-emerald-500" 
        iconBgClass="bg-emerald-50" 
      />
      
      <StatCard 
        title="Exceptions" 
        value={kpis.exceptions.toLocaleString()} 
        subtext={`${Math.round((kpis.exceptions / Math.max(kpis.total_invoices, 1)) * 100)}% of total`} 
        icon={AlertTriangle} 
        iconColorClass="text-amber-500" 
        iconBgClass="bg-amber-50" 
      />
      
      <StatCard 
        title="Total Spend" 
        value={formatCurrency(kpis.total_spend)} 
        subtext="18% vs last month" 
        subtextTrend="up"
        icon={DollarSign} 
        iconColorClass="text-purple-500" 
        iconBgClass="bg-purple-50" 
      />
      
      <StatCard 
        title="Vendors" 
        value={kpis.vendors_count.toLocaleString()} 
        subtext="Active vendors" 
        icon={Users} 
        iconColorClass="text-blue-500" 
        iconBgClass="bg-blue-50" 
      />
    </div>
  );
}
