export default function UserStatusDistribution({ data }: { data: any[] | undefined }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-bold text-slate-800 mb-5">Status Distribution</h3>
      <div className="flex flex-col gap-4">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="font-medium text-slate-700">{item.label}</span>
              </div>
              <span className="font-bold text-slate-700">{item.count.toLocaleString()} ({item.pct}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
