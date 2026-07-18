import { DollarSign, FileText, Wallet, Clock, AlertTriangle, Tag } from "lucide-react";
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
  
  const trendColor = trendUp ? "text-emerald-500" : "text-red-500";
  const trendIcon = trend > 0 ? "↑" : "↓";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow flex-1 min-w-[160px]">
      <div className="flex flex-col justify-between relative z-10">
        <h3 className="text-xs font-semibold text-slate-700">{title}</h3>
        <div className="flex items-baseline gap-1 mt-2 mb-1">
          {unit && unit !== "K" && unit !== "M" && unit !== "%" && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            {(title.includes("Spend") || title.includes("Payments") || title.includes("Amount") || title.includes("Discounts")) ? "$" : ""}
            {value}
            {unit === "K" || unit === "M" || unit === "%" ? unit : ""}
          </span>
        </div>
        <div className="flex items-center text-[11px] font-medium mt-auto">
          <span className={cn("mr-1", trendColor)}>
            {trendIcon} {Math.abs(trend)}%
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

export default function FinancialKpis({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4">
      <KpiCard 
        title="Total Spend (USD)" 
        value={data.total_spend?.value} 
        unit={data.total_spend?.unit}
        trend={data.total_spend?.trend}
        trendUp={data.total_spend?.up}
        icon={DollarSign} 
        colorGroup="purple" 
      />
      <KpiCard 
        title="Invoices Processed" 
        value={data.processed?.value?.toLocaleString() || "0"} 
        trend={data.processed?.trend}
        trendUp={data.processed?.up}
        icon={FileText} 
        colorGroup="blue" 
      />
      <KpiCard 
        title="Payments Made" 
        value={data.payments_made?.value} 
        unit={data.payments_made?.unit}
        trend={data.payments_made?.trend}
        trendUp={data.payments_made?.up}
        icon={Wallet} 
        colorGroup="green" 
      />
      <KpiCard 
        title="Amount Pending" 
        value={data.amount_pending?.value} 
        unit={data.amount_pending?.unit}
        trend={data.amount_pending?.trend}
        trendUp={data.amount_pending?.up}
        icon={Clock} 
        colorGroup="orange" 
      />
      <KpiCard 
        title="Overdue Amount" 
        value={data.overdue_amount?.value} 
        unit={data.overdue_amount?.unit}
        trend={data.overdue_amount?.trend}
        trendUp={data.overdue_amount?.up}
        icon={AlertTriangle} 
        colorGroup="red" 
      />
      <KpiCard 
        title="Discounts Captured" 
        value={data.discounts_captured?.value} 
        unit={data.discounts_captured?.unit}
        trend={data.discounts_captured?.trend}
        trendUp={data.discounts_captured?.up}
        icon={Tag} 
        colorGroup="green" 
      />
    </div>
  );
}
