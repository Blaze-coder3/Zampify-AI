import { ChevronDown } from "lucide-react";

export default function BottleneckTrendChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const width = 400;
  const height = 150;
  
  // Calculate max stacked value for scaling
  const maxTotal = Math.max(...data.map(d => d.approval + d.three_way + d.validation + d.others));
  const maxScaled = Math.ceil(maxTotal / 10) * 10; // Round up to nearest 10 (e.g. 40)
  
  const dx = width / (data.length - 1);

  // Helper to generate path for stacked areas
  // We need top and bottom paths for each layer to fill correctly
  const generateArea = (keys: string[]) => {
    // Generate the top edge
    const topPoints = data.map((d, i) => {
      let sum = 0;
      keys.forEach(k => sum += d[k]);
      return { x: i * dx, y: height - (sum / maxScaled) * height };
    });
    
    // Generate the bottom edge (reverse order to close path)
    const bottomKeys = keys.slice(0, -1);
    const bottomPoints = [...data].reverse().map((d, idx) => {
      const i = data.length - 1 - idx;
      let sum = 0;
      bottomKeys.forEach(k => sum += d[k]);
      return { x: i * dx, y: height - (sum / maxScaled) * height };
    });

    const pathData = [
      ...topPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`),
      ...bottomPoints.map(p => `L ${p.x} ${p.y}`),
      'Z'
    ].join(' ');

    return pathData;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Bottleneck Trend (Over Time)</h3>
        <div className="flex items-center gap-1.5 px-2 py-1 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
          Daily <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-[9px] font-semibold text-slate-500 mb-6 flex-wrap justify-center">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Approval</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div>Three-Way Match</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Validation</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div>Others</div>
      </div>

      <div className="flex-1 flex w-full h-full relative">
        {/* Y Axis Labels */}
        <div className="flex flex-col justify-between text-[9px] font-semibold text-slate-400 w-6 pr-1 shrink-0 h-[150px]">
          <span className="-mt-2">{maxScaled}</span>
          <span>{maxScaled * 0.75}</span>
          <span>{maxScaled * 0.5}</span>
          <span>{maxScaled * 0.25}</span>
          <span className="-mb-2">0</span>
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 relative h-[150px]">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between z-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full border-t border-slate-100/60"></div>
            ))}
          </div>
          
          {/* Y Axis Label Rotated */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-semibold text-slate-400 whitespace-nowrap z-20">
            Avg. Time (Hrs)
          </div>
          
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute inset-0 z-10" preserveAspectRatio="none">
            {/* Stacking order from bottom to top: others, validation, three_way, approval */}
            <path d={generateArea(['others'])} fill="#94a3b8" opacity="0.9" />
            <path d={generateArea(['others', 'validation'])} fill="#a855f7" opacity="0.9" />
            <path d={generateArea(['others', 'validation', 'three_way'])} fill="#fb923c" opacity="0.9" />
            <path d={generateArea(['others', 'validation', 'three_way', 'approval'])} fill="#ef4444" opacity="0.9" />
          </svg>
        </div>
      </div>
      
      {/* X Axis Labels */}
      <div className="flex justify-between text-[9px] font-semibold text-slate-400 mt-2 pl-6">
        {data.map((d, i) => (
          <span key={i} className="whitespace-nowrap">{d.date}</span>
        ))}
      </div>
      
      <div className="pt-4 text-center mt-auto">
        <button className="text-xs font-semibold text-blue-600 hover:underline">View full trend analysis</button>
      </div>
    </div>
  );
}
