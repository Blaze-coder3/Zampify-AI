import { ChevronDown } from "lucide-react";

export default function InvoiceTrendChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const width = 450;
  const height = 200;
  
  // Find max value for Y-axis scaling (around 1500 based on mockup)
  const maxValue = 1500; 
  
  const dx = width / (data.length - 1);

  // Helper to generate path d attribute
  const generatePath = (key: string) => {
    return data.map((d, i) => {
      const x = i * dx;
      const y = height - (d[key] / maxValue) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Invoice Processing Trend</h3>
        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
          Daily <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-600 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Processed</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Auto Approved</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Needs Review</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>Overdue</div>
      </div>

      <div className="flex-1 flex w-full h-full relative">
        {/* Y Axis Labels */}
        <div className="flex flex-col justify-between text-[10px] text-slate-400 w-8 pr-2 shrink-0 h-[200px]">
          <span>1.5K</span>
          <span>1.25K</span>
          <span>1K</span>
          <span>750</span>
          <span>500</span>
          <span>250</span>
          <span>0</span>
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 relative h-[200px]">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-full border-t border-slate-100"></div>
            ))}
          </div>
          
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute inset-0 z-10" preserveAspectRatio="none">
            {/* Lines */}
            <path d={generatePath('processed')} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={generatePath('auto_approved')} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={generatePath('needs_review')} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={generatePath('overdue')} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Dots */}
            {data.map((d, i) => (
              <g key={i}>
                <circle cx={i * dx} cy={height - (d.processed / maxValue) * height} r="3" fill="#3b82f6" className="ring-2 ring-white" />
                <circle cx={i * dx} cy={height - (d.auto_approved / maxValue) * height} r="3" fill="#10b981" className="ring-2 ring-white" />
                <circle cx={i * dx} cy={height - (d.needs_review / maxValue) * height} r="3" fill="#f59e0b" className="ring-2 ring-white" />
                <circle cx={i * dx} cy={height - (d.overdue / maxValue) * height} r="3" fill="#ef4444" className="ring-2 ring-white" />
              </g>
            ))}
          </svg>
        </div>
      </div>
      
      {/* X Axis Labels */}
      <div className="flex justify-between text-[10px] text-slate-400 mt-2 pl-8">
        {data.map((d, i) => (
          <span key={i} className="whitespace-nowrap">{d.date}</span>
        ))}
      </div>
    </>
  );
}
