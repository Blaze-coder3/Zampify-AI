import { ChevronDown } from "lucide-react";

export default function ResourceUtilization({ data }: { data: any }) {
  if (!data) return null;

  const width = 350;
  const height = 120;
  
  // y-axis max value 100%
  const maxScaled = 100.0;
  
  const dx = width / (data.times.length - 1);

  // Path generator for line
  const generateLine = (key: string) => {
    return data[key].map((val: number, i: number) => {
      const y = height - (val / maxScaled) * height;
      return `${i === 0 ? 'M' : 'L'} ${i * dx} ${y}`;
    }).join(' ');
  };
  
  // Points generator for dots
  const getPoints = (key: string) => {
    return data[key].map((val: number, i: number) => {
      const y = height - (val / maxScaled) * height;
      return { x: i * dx, y };
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-800">Resource Utilization</h3>
        <div className="flex items-center gap-1.5 px-2 py-1 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
          Last 1 Hour <ChevronDown size={12} className="text-slate-400" />
        </div>
      </div>
      
      <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-600 mb-6 flex-wrap">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>CPU (%)</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Memory (%)</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Disk (%)</div>
      </div>

      <div className="flex-1 flex w-full relative mb-4">
        {/* Y Axis Labels */}
        <div className="flex flex-col justify-between text-[9px] font-semibold text-slate-400 w-6 pr-1 shrink-0 h-[120px]">
          <span className="-mt-1">100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span className="-mb-1">0%</span>
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 relative h-[120px]">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between z-0">
            {[...Array(5)].map((_, i: number) => (
              <div key={i} className="w-full border-t border-slate-100/80"></div>
            ))}
          </div>
          
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute inset-0 z-10" preserveAspectRatio="none">
            {/* Lines */}
            <path d={generateLine('cpu')} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={generateLine('memory')} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={generateLine('disk')} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Points CPU */}
            {getPoints('cpu').map((p: any, i: number) => (
              <circle key={`cpu-${i}`} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
            ))}
            {/* Points Memory */}
            {getPoints('memory').map((p: any, i: number) => (
              <circle key={`mem-${i}`} cx={p.x} cy={p.y} r="3" fill="#10b981" />
            ))}
            {/* Points Disk */}
            {getPoints('disk').map((p: any, i: number) => (
              <circle key={`dsk-${i}`} cx={p.x} cy={p.y} r="3" fill="#a855f7" />
            ))}
          </svg>
        </div>
      </div>
      
      {/* X Axis Labels */}
      <div className="flex justify-between text-[9px] font-semibold text-slate-400 pl-6 mb-4">
        {data.times.filter((_: any, i: number) => i % 2 === 0).map((t: string, i: number) => (
          <span key={i}>{t}</span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
        <div>
           <div className="text-[10px] text-slate-500 mb-0.5">CPU Usage</div>
           <div className="flex items-center gap-1.5">
             <span className="text-base font-bold text-slate-800">{data.current.cpu.value}%</span>
             <span className="text-[10px] font-bold text-emerald-500">↓ {Math.abs(data.current.cpu.trend)}%</span>
           </div>
        </div>
        <div>
           <div className="text-[10px] text-slate-500 mb-0.5">Memory Usage</div>
           <div className="flex items-center gap-1.5">
             <span className="text-base font-bold text-slate-800">{data.current.memory.value}%</span>
             <span className="text-[10px] font-bold text-red-500">↑ {Math.abs(data.current.memory.trend)}%</span>
           </div>
        </div>
        <div>
           <div className="text-[10px] text-slate-500 mb-0.5">Disk Usage</div>
           <div className="flex items-center gap-1.5">
             <span className="text-base font-bold text-slate-800">{data.current.disk.value}%</span>
             <span className="text-[10px] font-bold text-emerald-500">↓ {Math.abs(data.current.disk.trend)}%</span>
           </div>
        </div>
      </div>
    </div>
  );
}
