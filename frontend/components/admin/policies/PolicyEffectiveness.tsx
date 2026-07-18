import { cn } from "@/lib/utils";

export default function PolicyEffectiveness({ data }: { data: any }) {
  if (!data) return null;

  const metrics = [
    { label: "Violations Prevented", key: "violations_prevented", goodUp: true },
    { label: "False Positives",      key: "false_positives",      goodUp: false },
    { label: "Exceptions Granted",   key: "exceptions_granted",   goodUp: false },
    { label: "Auto-Approvals",       key: "auto_approvals",       goodUp: true },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-800">Policy Effectiveness</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Last 30 Days</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map(m => {
          const d = data[m.key];
          if (!d) return null;
          const up = d.trend > 0;
          const isGood = up === m.goodUp;
          return (
            <div key={m.key} className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-500 mb-1">{m.label}</span>
              <span className="text-xl font-bold text-slate-800">{d.value.toLocaleString()}</span>
              <div className={cn("text-[10px] font-bold mt-0.5", isGood ? "text-emerald-500" : "text-red-500")}>
                {up ? "↑" : "↓"} {Math.abs(d.trend)}%
              </div>
            </div>
          );
        })}
      </div>
      <button className="mt-auto pt-4 text-xs font-semibold text-blue-600 hover:underline text-center">
        View effectiveness report
      </button>
    </div>
  );
}
