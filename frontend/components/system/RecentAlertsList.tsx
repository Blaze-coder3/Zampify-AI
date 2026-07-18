import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecentAlertsList({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Recent Alerts</h3>
        <button className="text-xs font-semibold text-blue-600 hover:underline">View all alerts</button>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        {data.map((alert, idx) => {
          let Icon = Info;
          let iconColor = "text-blue-500";
          let bgClass = "bg-blue-50";
          let badgeText = "Info";
          let badgeClass = "text-blue-600 border-blue-200 bg-blue-50";

          if (alert.severity === "critical") {
            Icon = AlertTriangle;
            iconColor = "text-red-500";
            bgClass = "bg-red-50";
            badgeText = "Critical";
            badgeClass = "text-red-600 border-red-200 bg-red-50";
          } else if (alert.severity === "warning") {
            Icon = AlertCircle;
            iconColor = "text-orange-500";
            bgClass = "bg-orange-50";
            badgeText = "Warning";
            badgeClass = "text-orange-600 border-orange-200 bg-orange-50";
          } else if (alert.severity === "info" && alert.message.includes("completed")) {
            // green info
            iconColor = "text-emerald-500";
            bgClass = "bg-emerald-50";
            badgeClass = "text-emerald-600 border-emerald-200 bg-emerald-50";
          }

          return (
            <div key={idx} className="flex gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0 group hover:bg-slate-50 p-2 rounded-lg transition-colors -mx-2">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", bgClass, iconColor, bgClass.replace("bg-", "border-").replace("50", "200"))}>
                <Icon size={14} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-2">
                     <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider", badgeClass)}>{badgeText}</span>
                     <span className="text-xs font-bold text-slate-800 line-clamp-1">{alert.message}</span>
                   </div>
                   <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{alert.time}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 font-medium">Service: {alert.service}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
