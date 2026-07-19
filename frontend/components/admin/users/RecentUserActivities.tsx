import { cn } from "@/lib/utils";

const AVATAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500"];

export default function RecentUserActivities({ data }: { data: any[] | undefined }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-800">Recent User Activities</h3>
        <button className="text-xs font-semibold text-blue-600 hover:underline">View all activities</button>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {data.map((item, i) => {
          const initials = item.user.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
          const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <div key={i} className="flex gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden", avatarColor)}>
                {item.user.includes("Priya") ? (
                  <img src="/priya.png" alt="Priya" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="text-[11px] font-bold text-slate-800">{item.user}</span>
                  <span className="text-[11px] text-slate-500">{item.action}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.time} · Changed by {item.changed_by}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
