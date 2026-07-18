import { cn } from "@/lib/utils";

function CashFlowRow({ label, amount, trend, isTotal = false, colorClass = "" }: { label: string, amount: number, trend: number, isTotal?: boolean, colorClass?: string }) {
  const isUp = trend > 0;
  const trendColor = isUp ? "text-emerald-500" : "text-red-500";
  const trendArrow = isUp ? "↑" : "↓";

  return (
    <div className={cn("flex items-center justify-between py-3", isTotal ? "border-t border-slate-200 mt-2" : "border-b border-slate-50")}>
      <span className={cn("text-xs font-medium", isTotal ? "text-slate-800 font-bold" : "text-slate-600")}>{label}</span>
      <div className="flex items-center gap-6 w-[180px] justify-end">
        <span className={cn("text-xs font-bold", colorClass || "text-slate-800")}>
          ${amount.toLocaleString()}
        </span>
        <span className={cn("text-[10px] font-bold w-12 text-right", trendColor)}>
          {trendArrow} {Math.abs(trend).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function CashFlowSummary({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Cash Flow Summary (USD)</h3>
      
      <div className="flex items-center justify-end text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 pr-2 gap-12">
        <span>This Period</span>
        <span>vs Prev. 7 Days</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <CashFlowRow label="Opening Balance" amount={data.opening_balance.amount} trend={data.opening_balance.trend} />
        <CashFlowRow label="Cash Inflow" amount={data.cash_inflow.amount} trend={data.cash_inflow.trend} />
        <CashFlowRow label="Cash Outflow" amount={data.cash_outflow.amount} trend={data.cash_outflow.trend} />
        <CashFlowRow label="Closing Balance" amount={data.closing_balance.amount} trend={data.closing_balance.trend} />
        
        <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Net Cash Flow</span>
            <div className="flex items-center gap-6 w-[180px] justify-end">
              <span className="text-xs font-bold text-emerald-700">
                ${data.net_cash_flow.amount.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold w-12 text-right text-emerald-600">
                {data.net_cash_flow.trend > 0 ? "↑" : "↓"} {Math.abs(data.net_cash_flow.trend).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
