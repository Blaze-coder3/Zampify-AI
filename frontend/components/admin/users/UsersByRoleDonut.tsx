import { useMemo } from "react";

function createDonutSegments(data: any[], cx: number, cy: number, radius: number) {
  let cumPct = 0;
  return data.map(item => {
    const startAngle = (cumPct / 100) * 2 * Math.PI - Math.PI / 2;
    cumPct += item.pct;
    const endAngle = (cumPct / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const large = item.pct > 50 ? 1 : 0;
    return { d: `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`, ...item };
  });
}

export default function UsersByRoleDonut({ data }: { data: any[] | undefined }) {
  if (!data || data.length === 0) return null;
  const segments = useMemo(() => createDonutSegments(data, 85, 85, 62), [data]);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-bold text-slate-800 mb-5">Users by Role</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-[170px] h-[170px] shrink-0">
          <svg viewBox="0 0 170 170" className="w-full h-full -rotate-90 origin-center drop-shadow-sm">
            {segments.map((seg, i) => (
              <path key={i} d={seg.d} fill="none" stroke={seg.color} strokeWidth={22} className="hover:stroke-[26px] transition-all cursor-pointer" />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-800">{total.toLocaleString()}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 text-[11px]">{item.label}</span>
              </div>
              <span className="font-bold text-slate-700 text-[11px]">{item.count} ({item.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
