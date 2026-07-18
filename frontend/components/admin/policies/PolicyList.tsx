import { MoreVertical, ShieldCheck, AlertTriangle, FileText, GitMerge, DollarSign, CheckCircle, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  if (status === "Active") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">Active</span>;
  if (status === "In Review") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-orange-50 text-orange-600 border-orange-200">In Review</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200">Draft</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "High") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200">High</span>;
  if (priority === "Medium") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-orange-50 text-orange-600 border-orange-200">Medium</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-500 border-blue-200">Low</span>;
}

const CATEGORY_ICONS: Record<string, any> = {
  "Invoice Validation": FileText,
  "Spend Control": DollarSign,
  "Fraud Prevention": AlertTriangle,
  "Vendor Management": ShieldCheck,
  "Approval Workflow": GitMerge,
  "Compliance": CheckCircle,
  "Payment Control": FileCode,
  "Purchase Order": FileText,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Invoice Validation": "bg-blue-50 text-blue-500",
  "Spend Control": "bg-orange-50 text-orange-500",
  "Fraud Prevention": "bg-red-50 text-red-500",
  "Vendor Management": "bg-purple-50 text-purple-500",
  "Approval Workflow": "bg-emerald-50 text-emerald-500",
  "Compliance": "bg-teal-50 text-teal-500",
  "Payment Control": "bg-indigo-50 text-indigo-500",
  "Purchase Order": "bg-slate-100 text-slate-500",
};

export default function PolicyList({ data }: { data: any[] | undefined }) {
  if (!data || data.length === 0) return null;
  return (
    <div>
      <h2 className="text-sm font-bold text-slate-800 mb-4">Policy List</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200">
              {["Policy Name", "Category", "Policy Type", "Status", "Priority", "Coverage", "Last Updated", "Updated By", ""].map((h, i) => (
                <th key={i} className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((policy, idx) => {
              const Icon = CATEGORY_ICONS[policy.category] || FileText;
              const iconClass = CATEGORY_COLORS[policy.category] || "bg-slate-100 text-slate-500";
              return (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
                  <td className="py-3 px-2">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", iconClass)}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{policy.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{policy.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-[11px] text-slate-600 font-medium whitespace-nowrap">{policy.category}</td>
                  <td className="py-3 px-2 text-[11px] text-slate-600 whitespace-nowrap">{policy.type}</td>
                  <td className="py-3 px-2"><StatusBadge status={policy.status} /></td>
                  <td className="py-3 px-2"><PriorityBadge priority={policy.priority} /></td>
                  <td className="py-3 px-2 text-[11px] font-bold text-slate-700 whitespace-nowrap">{policy.coverage != null ? `${policy.coverage}%` : "—"}</td>
                  <td className="py-3 px-2 text-[11px] text-slate-500 whitespace-nowrap">{policy.last_updated}</td>
                  <td className="py-3 px-2 text-[11px] text-slate-600 whitespace-nowrap">{policy.updated_by}</td>
                  <td className="py-3 px-2 text-slate-400 text-right"><MoreVertical size={14} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">Showing 1 to 8 of 128 policies</span>
        <div className="flex items-center gap-1.5">
          {["‹", "1", "2", "3", "...", "16", "›"].map((p, i) => (
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
