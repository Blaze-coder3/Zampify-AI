import { AlertTriangle, Info, CheckCircle2, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

function AlertIcon({ type }: { type: string }) {
  if (type === "error") {
    return <div className="p-1.5 rounded-full bg-red-50 text-red-500 border border-red-100"><AlertTriangle size={14} /></div>;
  }
  if (type === "warning") {
    return <div className="p-1.5 rounded-full bg-amber-50 text-amber-500 border border-amber-100"><AlertTriangle size={14} /></div>;
  }
  if (type === "list") {
    return <div className="p-1.5 rounded-full bg-amber-50 text-amber-500 border border-amber-100"><ListTodo size={14} /></div>;
  }
  if (type === "info") {
    return <div className="p-1.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100"><Info size={14} /></div>;
  }
  return <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100"><CheckCircle2 size={14} /></div>;
}

export default function RecentAlerts({ data }: { data: any[] }) {
  if (!data) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-800">Recent Alerts</h3>
        <button className="text-xs font-semibold text-blue-600 hover:underline">View all</button>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        {data.map((alert, idx) => (
          <div key={idx} className="flex gap-3 group">
            <div className="shrink-0 mt-0.5">
              <AlertIcon type={alert.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors cursor-pointer">
                {alert.title}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {alert.subtitle}
              </p>
            </div>
            <div className="shrink-0 text-[10px] font-medium text-slate-400 mt-0.5">
              {alert.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
