export default function AgingSummary({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  // Find max count to scale the bars relative to the container
  const maxCount = Math.max(...data.map(d => d.count), 1);

  // Gradient colors for the bars to match mockup (red to orange to dark red)
  const colors = [
    "bg-red-500",      // 1-7 Days
    "bg-amber-400",    // 8-15 Days
    "bg-orange-400",   // 16-30 Days
    "bg-red-700"       // > 30 Days
  ];

  return (
    <div className="w-full flex flex-col gap-6 justify-center">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center text-xs">
          <span className="w-24 text-slate-600 font-medium shrink-0">{item.label}</span>
          <div className="flex-1 mx-4 bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${colors[idx % colors.length]}`} 
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            ></div>
          </div>
          <div className="w-20 text-right flex justify-end gap-2 text-slate-800">
            <span className="font-bold">{item.count}</span>
            <span className="text-slate-500 w-8">({item.pct}%)</span>
          </div>
        </div>
      ))}
    </div>
  );
}
