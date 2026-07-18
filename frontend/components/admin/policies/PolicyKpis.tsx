import { FileText, CheckCircle2, Clock, ShieldAlert, ShieldCheck, FileCheck } from "lucide-react";
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
            <span className={cn("mr-1", trendUp ? "text-emerald-500" : "text-red-500")}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
            <span className="text-slate-400 font-medium">vs prev. 7 days</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PolicyKpis({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="flex flex-wrap xl:flex-nowrap gap-4">
      <KpiCard title="Total Policies"       value={data.total_policies?.value}         subtext={data.total_policies?.subtext}        icon={FileText}     colorGroup="blue"   />
      <KpiCard title="Active Policies"      value={data.active_policies?.value}        subtext={data.active_policies?.subtext}       icon={CheckCircle2} colorGroup="green"  />
      <KpiCard title="Policies in Review"   value={data.in_review?.value}              subtext={data.in_review?.subtext}             icon={Clock}        colorGroup="orange" />
      <KpiCard title="Policy Violations (7 days)" value={data.policy_violations?.value} trend={data.policy_violations?.trend} trendUp={data.policy_violations?.up} icon={ShieldAlert}  colorGroup="red"    />
      <KpiCard title="Compliance Coverage"  value={data.compliance_coverage?.value}    unit={data.compliance_coverage?.unit}  trend={data.compliance_coverage?.trend} trendUp={data.compliance_coverage?.up} icon={ShieldCheck}  colorGroup="green"  />
      <KpiCard title="Exceptions Granted (7 days)" value={data.exceptions_granted?.value} trend={data.exceptions_granted?.trend} trendUp={data.exceptions_granted?.up} icon={FileCheck}    colorGroup="purple" />
    </div>
  );
}
