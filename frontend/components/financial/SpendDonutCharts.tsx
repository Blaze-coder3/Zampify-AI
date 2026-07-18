import { useMemo } from "react";

function createDonutSegments(data: any[], cx: number, cy: number, radius: number, strokeWidth: number) {
  let cumulativePercent = 0;
  
  return data.map(slice => {
    // start and end angles
    const startAngle = (cumulativePercent * 2 * Math.PI) - (Math.PI / 2);
    cumulativePercent += (slice.pct / 100);
    const endAngle = (cumulativePercent * 2 * Math.PI) - (Math.PI / 2);

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    
    // if pct > 50%, largeArcFlag = 1
    const largeArcFlag = slice.pct > 50 ? 1 : 0;
    
    // SVG path string for arc
    // format: M startX,startY A rx,ry x-axis-rotation large-arc-flag,sweep-flag endX,endY
    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    
    return {
      d,
      color: slice.color,
      key: slice.category || slice.term
    };
  });
}

export default function SpendDonutCharts({ data, title, isTerms = false }: { data: any[], title: string, isTerms?: boolean }) {
  if (!data || data.length === 0) return null;

  const segments = useMemo(() => createDonutSegments(data, 100, 100, 70, 20), [data]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-6">{title}</h3>
      
      <div className="flex flex-col xl:flex-row items-center gap-6 xl:gap-8 flex-1 justify-center xl:justify-start">
        {/* Donut Chart */}
        <div className="relative w-[200px] h-[200px] shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 origin-center drop-shadow-sm">
            {segments.map(seg => (
              <path
                key={seg.key}
                d={seg.d}
                fill="none"
                stroke={seg.color}
                strokeWidth={24}
                className="transition-all duration-300 hover:stroke-[28px] cursor-pointer"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">$8.74M</span>
            <span className="text-xs font-semibold text-slate-500">Total Spend</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 flex-1 min-w-[200px]">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="font-semibold text-slate-700 truncate max-w-[120px]">{item.category || item.term}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">${item.value.toFixed(2)}M</span>
                <span className="text-[10px] font-semibold text-slate-400 w-10 text-right">({item.pct.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
