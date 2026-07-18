export default function RecentPolicyChanges({ data }: { data: any[] | undefined }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-800">Recent Policy Changes</h3>
        <button className="text-xs font-semibold text-blue-600 hover:underline">View all</button>
      </div>
      <div className="flex flex-col gap-4">
        {data.map((item, i) => (
          <div key={i} className="flex gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-800">{item.title}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400">{item.time}</span>
                <span className="text-[10px] text-slate-400">·</span>
                <span className="text-[10px] text-slate-500 font-medium">by {item.by}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
