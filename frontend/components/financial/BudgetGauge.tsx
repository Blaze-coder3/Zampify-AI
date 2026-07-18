export default function BudgetGauge({ data }: { data: any }) {
  if (!data) return null;

  const pct = data.utilized_pct;
  const radius = 80;
  const circumference = Math.PI * radius; // Half circle
  const dashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-6">Spend vs Budget</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center pt-4">
        <div className="relative w-[220px] h-[110px] overflow-hidden flex justify-center">
          {/* Background track */}
          <svg className="w-[200px] h-[200px] absolute bottom-0 origin-bottom" viewBox="0 0 200 200">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Value arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#10b981"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          <div className="absolute bottom-2 flex flex-col items-center">
            <span className="text-3xl font-bold text-slate-800">{pct}%</span>
            <span className="text-xs font-semibold text-slate-500">Budget Utilized</span>
          </div>
          
          <div className="absolute bottom-0 left-2 text-[10px] font-bold text-slate-400">0%</div>
          <div className="absolute bottom-0 right-2 text-[10px] font-bold text-slate-400">100%</div>
        </div>
        
        <div className="flex w-full justify-between mt-8 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500">Spent</span>
            <span className="text-sm font-bold text-slate-800">${data.spent.toFixed(2)}M</span>
            <span className="text-[10px] font-bold text-emerald-500">↑ 18.2%</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-semibold text-slate-500">Budget</span>
            <span className="text-sm font-bold text-slate-800">${data.total_budget.toFixed(2)}M</span>
          </div>
        </div>
      </div>
      
      <div className="pt-4 text-center mt-auto">
        <button className="text-xs font-semibold text-blue-600 hover:underline">View budget details</button>
      </div>
    </div>
  );
}
