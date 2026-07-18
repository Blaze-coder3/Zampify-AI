export default function MonthlySpendBarChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const width = 600;
  const height = 160;
  const maxVal = 10; // max Y axis value (10M)
  
  const barWidth = 30;
  const spacing = width / data.length;

  // Path generator for the dashed budget line
  const budgetLinePoints = data.map((d, i) => {
    const x = i * spacing + spacing / 2;
    const y = height - (d.budget / maxVal) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-6">Monthly Spend Trend (USD)</h3>
      
      <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-600 mb-6">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-500"></div>Actual Spend</div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0 border-t-2 border-dashed border-blue-200"></div>Budget
        </div>
      </div>

      <div className="flex-1 flex w-full h-full relative">
        {/* Y Axis Labels */}
        <div className="flex flex-col justify-between text-[10px] font-semibold text-slate-400 w-6 pr-2 shrink-0 h-[160px]">
          <span className="-mt-2">10M</span>
          <span>8M</span>
          <span>6M</span>
          <span>4M</span>
          <span>2M</span>
          <span className="-mb-2">0</span>
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 relative h-[160px]">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between z-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full border-t border-slate-100/80"></div>
            ))}
          </div>
          
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute inset-0 z-10" preserveAspectRatio="none">
            {/* Bars */}
            {data.map((d, i) => {
              const x = i * spacing + spacing / 2 - barWidth / 2;
              const barHeight = (d.actual / maxVal) * height;
              const y = height - barHeight;
              
              return (
                <g key={`bar-${i}`}>
                  {/* rounded top corners */}
                  <path 
                    d={`M ${x},${height} L ${x},${y + 4} Q ${x},${y} ${x + 4},${y} L ${x + barWidth - 4},${y} Q ${x + barWidth},${y} ${x + barWidth},${y + 4} L ${x + barWidth},${height} Z`}
                    fill="#3b82f6" 
                    className="transition-all hover:fill-blue-600 cursor-pointer"
                  />
                  {/* Label above bar */}
                  <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">
                    ${d.actual.toFixed(1)}M
                  </text>
                </g>
              );
            })}
            
            {/* Budget Line */}
            <path d={budgetLinePoints} fill="none" stroke="#bfdbfe" strokeWidth="2.5" strokeDasharray="6 4" />
            
            {/* Budget Label on first and last point */}
            {data.length > 0 && (
              <>
                <text x={spacing / 2} y={height - (data[0].budget / maxVal) * height - 8} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#94a3b8">
                  ${data[0].budget.toFixed(1)}M
                </text>
                <text x={(data.length - 1) * spacing + spacing / 2} y={height - (data[data.length - 1].budget / maxVal) * height - 8} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#94a3b8">
                  ${data[data.length - 1].budget.toFixed(1)}M
                </text>
              </>
            )}
          </svg>
        </div>
      </div>
      
      {/* X Axis Labels */}
      <div className="flex justify-between text-[10px] font-semibold text-slate-500 mt-3 pl-8">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center whitespace-nowrap">{d.month}</div>
        ))}
      </div>
    </div>
  );
}
