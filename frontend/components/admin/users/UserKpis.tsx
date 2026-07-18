import { Users, UserCheck, UserX, Lock, UserPlus, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

function KpiCard({ title, value, unit, subtext, trend, trendUp, icon: Icon, colorGroup }: {
  title: string; value: any; unit?: string; subtext?: string; trend?: number; trendUp?: boolean; icon: any; colorGroup: "blue" | "green" | "orange" | "red" | "purple";
}) {
  const colors = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-500",   border: "border-blue-200" },
    green:  { bg: "bg-emerald-50",text: "text-emerald-500",border: "border-emerald-200" },
    orange: { bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-200" },
    red:    { bg: "bg-red-50",    text: "text-red-500",    border: "border-red-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-500", border: "border-purple-200" },
  };
  const c = colors[colorGroup];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex shadow-sm hover:shadow-md transition-shadow flex-1 min-w-[140px]">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 border", c.bg, c.text, c.border)}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col justify-center w-full">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-slate-800 tracking-tight">{typeof value === "number" ? value.toLocaleString() : value}</span>
          {unit && <span className="text-xs font-semibold text-slate-600">{unit}</span>}
        </div>
        {subtext && <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{subtext}</div>}
        {trend !== undefined && (
          <div className="flex items-center text-[10px] font-bold mt-1">
            <span className={cn("mr-1", trendUp ? "text-emerald-500" : "text-red-500")}>{trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%</span>
            <span className="text-slate-400 font-medium">vs prev. 30 days</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserKpis({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="flex flex-wrap xl:flex-nowrap gap-4">
      <KpiCard title="Total Users"       value={data.total_users?.value}     trend={data.total_users?.trend}     trendUp={data.total_users?.up}    icon={Users}      colorGroup="blue"   />
      <KpiCard title="Active Users"      value={data.active_users?.value}    subtext={data.active_users?.subtext}                                    icon={UserCheck}  colorGroup="green"  />
      <KpiCard title="Inactive Users"    value={data.inactive_users?.value}  trend={data.inactive_users?.trend}  trendUp={data.inactive_users?.up}  icon={UserX}      colorGroup="orange" />
      <KpiCard title="Locked Users"      value={data.locked_users?.value}    trend={data.locked_users?.trend}    trendUp={data.locked_users?.up}    icon={Lock}       colorGroup="red"    />
      <KpiCard title="New Users (30d)"   value={data.new_users?.value}       trend={data.new_users?.trend}       trendUp={data.new_users?.up}       icon={UserPlus}   colorGroup="blue"   />
      <KpiCard title="MFA Enabled"       value={data.mfa_enabled?.value}     unit={data.mfa_enabled?.unit}       trend={data.mfa_enabled?.trend}    trendUp={data.mfa_enabled?.up} icon={ShieldCheck} colorGroup="green" />
    </div>
  );
}
