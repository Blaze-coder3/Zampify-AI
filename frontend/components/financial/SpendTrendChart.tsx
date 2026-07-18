import { ChevronDown } from "lucide-react";

export default function SpendTrendChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const width = 450;
  const height = 180;
  
  // y-axis max value 4M
  const maxScaled = 4.0;
  
  const dx = width / (data.length - 1);

  // Path generator for line
  const generateLine = (key: string) => {
    return data.map((d, i) => {
      const val = d[key];
      const y = height - (val / maxScaled) * height;
      return `${i === 0 ? 'M' : 'L'} ${i * dx} ${y}`;
    }).join(' ');
  };
  
  // Points generator for dots
  const getPoints = (key: string) => {
    return data.map((d, i) => {
      const val = d[key];
      const y = height - (val / maxScaled) * height;
      return { x: i * dx, y };
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Spend Trend (USD)</h3>
        <div className="flex items-center gap-1.5 px-2 py-1 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
          Daily <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-600 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>Total Spend</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>Payments Made</div>
      </div>

      <div className="flex-1 flex w-full h-full relative">
        {/* Y Axis Labels */}
        <div className="flex flex-col justify-between text-[10px] font-semibold text-slate-400 w-6 pr-2 shrink-0 h-[180px]">
          <span className="-mt-2">4M</span>
          <span>3M</span>
          <span>2M</span>
          <span>1M</span>
          <span className="-mb-2">0</span>
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 relative h-[180px]">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between z-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full border-t border-slate-100/80"></div>
            ))}
          </div>
          
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute inset-0 z-10" preserveAspectRatio="none">
            {/* Lines */}
            <path d={generateLine('total_spend')} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={generateLine('payments_made')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Points Total Spend */}
            {getPoints('total_spend').map((p, i) => (
              <circle key={`ts-${i}`} cx={p.x} cy={p.y} r="4" fill="#3b82f6" className="transition-all hover:r-5 hover:fill-blue-600 cursor-pointer" />
            ))}
            
            {/* Points Payments Made */}
            {getPoints('payments_made').map((p, i) => (
              <circle key={`pm-${i}`} cx={p.x} cy={p.y} r="4" fill="#10b981" className="transition-all hover:r-5 hover:fill-emerald-600 cursor-pointer" />
            ))}
          </svg>
        </div>
      </div>
      
      {/* X Axis Labels */}
      <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-3 pl-8">
        {data.map((d, i) => (
          <span key={i} className="whitespace-nowrap">{d.date}</span>
        ))}
      </div>
    </div>
  );
}
