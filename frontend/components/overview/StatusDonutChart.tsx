export default function StatusDonutChart({ data }: { data: Record<string, number> }) {
  if (!data) return null;

  const approved = data["approved"] || 0;
  const needsReview = data["needs_review"] || 0;
  const escalated = data["escalated"] || 0;
  const overdue = data["overdue"] || 0;
  const closed = data["closed"] || 0;
  
  const actualTotal = approved + needsReview + escalated + overdue + closed;
  const totalDivisor = actualTotal || 1;
  
  // Circumference = 2 * pi * r = 2 * 3.14159 * 40 = 251.3
  const c = 251.3;
  
  const p1 = (approved / totalDivisor) * c;
  const p2 = (needsReview / totalDivisor) * c;
  const p3 = (overdue / totalDivisor) * c; // Overdue is red
  const p4 = (escalated / totalDivisor) * c; // Escalated is purple
  const p5 = (closed / totalDivisor) * c;
  
  const offset2 = c - p1;
  const offset3 = offset2 - p2;
  const offset4 = offset3 - p3;
  const offset5 = offset4 - p4;

  const pct = (val: number) => ((val / totalDivisor) * 100).toFixed(1);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 w-full justify-center">
      <div className="relative w-40 h-40 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray={`${p1} ${c}`} />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray={`${p2} ${c}`} strokeDashoffset={offset2} />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="16" strokeDasharray={`${p3} ${c}`} strokeDashoffset={offset3} />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="16" strokeDasharray={`${p4} ${c}`} strokeDashoffset={offset4} />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#64748b" strokeWidth="16" strokeDasharray={`${p5} ${c}`} strokeDashoffset={offset5} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white m-4 rounded-full shadow-inner">
          <span className="text-2xl font-bold text-slate-800 tracking-tight">{actualTotal.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Total</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 text-xs w-full sm:w-48">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-slate-600 font-medium">Approved</span></div>
          <div className="flex items-center gap-2 text-slate-800"><span className="font-semibold">{approved.toLocaleString()}</span><span className="text-[10px] text-slate-500 w-10 text-right">({pct(approved)}%)</span></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-slate-600 font-medium">Needs Review</span></div>
          <div className="flex items-center gap-2 text-slate-800"><span className="font-semibold">{needsReview.toLocaleString()}</span><span className="text-[10px] text-slate-500 w-10 text-right">({pct(needsReview)}%)</span></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-slate-600 font-medium">Overdue</span></div>
          <div className="flex items-center gap-2 text-slate-800"><span className="font-semibold">{overdue.toLocaleString()}</span><span className="text-[10px] text-slate-500 w-10 text-right">({pct(overdue)}%)</span></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div><span className="text-slate-600 font-medium">Escalated</span></div>
          <div className="flex items-center gap-2 text-slate-800"><span className="font-semibold">{escalated.toLocaleString()}</span><span className="text-[10px] text-slate-500 w-10 text-right">({pct(escalated)}%)</span></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div><span className="text-slate-600 font-medium">Closed</span></div>
          <div className="flex items-center gap-2 text-slate-800"><span className="font-semibold">{closed.toLocaleString()}</span><span className="text-[10px] text-slate-500 w-10 text-right">({pct(closed)}%)</span></div>
        </div>
      </div>
    </div>
  );
}
