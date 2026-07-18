"use client";

import { useRouter } from "next/navigation";
import { InvoiceSummary } from "@/lib/api";
import { formatCurrency, formatDateTime, getStatusBg, getStatusEmoji, formatConfidence, cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface Props {
  invoices: InvoiceSummary[];
  onRefresh: () => void;
}

export default function InvoiceTable({ invoices, onRefresh }: Props) {
  const router = useRouter();

  if (invoices.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-slate-400 text-sm">No invoices yet. Upload one to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {["Invoice #", "Status", "Amount", "Confidence", "Source", "Received", ""].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr
              key={inv.id}
              onClick={() => router.push(`/invoices/${inv.id}`)}
              className="border-b border-white/5 table-row-hover transition-colors group"
            >
              <td className="px-5 py-3.5">
                <div className="font-mono text-sm text-white">
                  {inv.invoice_number || <span className="text-slate-600 italic">No #</span>}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">{inv.id.slice(0, 8)}…</div>
              </td>
              <td className="px-5 py-3.5">
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", getStatusBg(inv.status))}>
                  {getStatusEmoji(inv.status)} {inv.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <span className="text-white font-medium">
                  {formatCurrency(inv.grand_total, inv.currency || "USD")}
                </span>
              </td>
              <td className="px-5 py-3.5">
                {inv.overall_confidence !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${inv.overall_confidence}%`,
                          background: inv.overall_confidence >= 80
                            ? "#10b981"
                            : inv.overall_confidence >= 60
                            ? "#f59e0b"
                            : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{formatConfidence(inv.overall_confidence)}</span>
                  </div>
                ) : (
                  <span className="text-slate-600 text-xs">—</span>
                )}
              </td>
              <td className="px-5 py-3.5">
                <span className="text-xs text-slate-500 capitalize">{inv.source}</span>
              </td>
              <td className="px-5 py-3.5">
                <span className="text-xs text-slate-500">{formatDateTime(inv.received_at)}</span>
              </td>
              <td className="px-5 py-3.5">
                <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
