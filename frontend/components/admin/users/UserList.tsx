import { CheckCircle2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
  blue:   "bg-blue-50 text-blue-600 border-blue-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  orange: "bg-orange-50 text-orange-600 border-orange-200",
  green:  "bg-emerald-50 text-emerald-600 border-emerald-200",
  red:    "bg-red-50 text-red-600 border-red-200",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "Active")   return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">Active</span>;
  if (status === "Inactive") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-orange-50 text-orange-600 border-orange-200">Inactive</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200">Locked</span>;
}

function Avatar({ initials, imageUrl }: { initials: string, imageUrl?: string }) {
  const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500"];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden", color)}>
      {imageUrl ? (
        <img src={imageUrl} alt={initials} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

export default function UserList({ data }: { data: any[] | undefined }) {
  if (!data || data.length === 0) return null;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-3 px-2 w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
              {["User", "Role", "Department", "Status", "Last Login", "MFA", "Access Level", "Actions"].map((h, i) => (
                <th key={i} className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((user, idx) => {
              const initials = user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
              return (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
                  <td className="py-3 px-2"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        initials={initials} 
                        imageUrl={user.email === "priya@zampify.ai" ? "/priya.png" : undefined} 
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{user.name}</div>
                        <div className="text-[10px] text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", ROLE_COLORS[user.role_color] || "bg-slate-100 text-slate-600 border-slate-200")}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-[11px] text-slate-600 font-medium whitespace-nowrap">{user.department}</td>
                  <td className="py-3 px-2"><StatusBadge status={user.status} /></td>
                  <td className="py-3 px-2 text-[11px] text-slate-500 whitespace-nowrap">{user.last_login || "—"}</td>
                  <td className="py-3 px-2">
                    {user.mfa
                      ? <CheckCircle2 size={16} className="text-emerald-500" />
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-3 px-2 text-[11px] font-medium text-slate-600">{user.access_level}</td>
                  <td className="py-3 px-2 text-slate-400 text-right"><MoreVertical size={14} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">Showing 1 to 10 of 1,400 users</span>
        <div className="flex items-center gap-1.5">
          {["‹", "1", "2", "3", "4", "5", "...", "140", "›"].map((p, i) => (
            <button key={i} className={cn("w-6 h-6 rounded text-xs font-medium transition-colors", p === "1" ? "bg-blue-50 text-blue-600 border border-blue-200" : "hover:bg-slate-100 text-slate-600")}>{p}</button>
          ))}
          <select className="ml-3 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-600 bg-white">
            <option>10 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}
