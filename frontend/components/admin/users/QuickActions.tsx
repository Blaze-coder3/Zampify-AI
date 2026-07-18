import { UserPlus, Upload, UserMinus, Key, ChevronRight } from "lucide-react";

const ICONS = [UserPlus, Upload, UserMinus, Key];
const COLORS = ["bg-blue-50 text-blue-500 border-blue-200", "bg-emerald-50 text-emerald-500 border-emerald-200", "bg-orange-50 text-orange-500 border-orange-200", "bg-purple-50 text-purple-500 border-purple-200"];

export default function QuickActions({ data }: { data: any[] | undefined }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-5">Quick Actions</h3>
      <div className="flex flex-col gap-3 flex-1">
        {data.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <button key={i} className="flex items-center gap-3 text-left group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${COLORS[i % COLORS.length]}`}>
                <Icon size={14} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[12px] font-bold text-slate-800">{item.title}</span>
                <span className="text-[10px] text-slate-500">{item.description}</span>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
