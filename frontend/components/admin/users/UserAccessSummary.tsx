import { ChevronRight } from "lucide-react";

export default function UserAccessSummary({ data }: { data: any[] | undefined }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-5">User Access Summary</h3>
      <div className="flex flex-col gap-3 flex-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition-colors">
            <span className="text-[12px] font-medium text-slate-700">{item.level}</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-slate-800">{item.count}</span>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
      <button className="mt-auto pt-4 text-xs font-semibold text-blue-600 hover:underline text-center">View access report</button>
    </div>
  );
}
