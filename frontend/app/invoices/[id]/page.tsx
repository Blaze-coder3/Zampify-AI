"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInvoice, overrideDecision, reprocessInvoice, connectInvoiceWS, InvoiceDetail, WSMessage } from "@/lib/api";
import { formatCurrency, formatDate, formatDateTime, getStatusBg, getStatusEmoji, getRuleStatusColor, cn, formatConfidence } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Shield, Clock, FileText, Zap, ChevronRight, User
} from "lucide-react";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<any>({} as any);
  const [loading, setLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState<any>({} as any);
  const [activeTab, setActiveTab] = useState<"overview" | "validation" | "timeline" | "data">("overview");
  const [overrideModal, setOverrideModal] = useState<"approve" | "reject" | null>(null);
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getInvoice(invoiceId);
        setInvoice(res.data);
      } catch (e) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    load();

    // WebSocket for live updates
    const ws = connectInvoiceWS(
      invoiceId,
      (msg) => {
        setLiveStatus(msg);
        if (["approved", "rejected", "needs_review", "failed"].includes(msg.status)) {
          load(); // Reload when terminal state reached
        }
      }
    );

    return () => ws.close();
  }, [invoiceId, router]);

  const handleOverride = async () => {
    if (!overrideModal || !justification.trim()) return;
    setSubmitting(true);
    try {
      await overrideDecision(invoiceId, overrideModal, justification);
      const res = await getInvoice(invoiceId);
      setInvoice(res.data);
      setOverrideModal(null);
      setJustification("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReprocess = async () => {
    await reprocessInvoice(invoiceId);
    router.refresh();
  };

  if (loading || !invoice) {
    return (
      <div className="min-h-screen bg-[#060d1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading invoice...</p>
        </div>
      </div>
    );
  }

  const isProcessing = ["received", "classifying", "extracting", "validating"].includes(
    liveStatus?.status || invoice.status
  );
  const currentStatus = liveStatus?.status || invoice.status;
  const currentDecision = liveStatus?.decision || invoice.decision;

  return (
    <div className="min-h-screen bg-[#060d1a]">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to queue
          </button>
          <ChevronRight size={14} className="text-slate-700" />
          <span className="text-sm text-slate-400 font-mono">
            {invoice.invoice_number || invoiceId.slice(0, 12) + "…"}
          </span>
          <div className="ml-auto flex items-center gap-3">
            {invoice.status === "failed" && (
              <button
                onClick={handleReprocess}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/20 transition-all"
              >
                <RefreshCw size={14} />
                Reprocess
              </button>
            )}
            {invoice.status === "needs_review" && (
              <>
                <button
                  onClick={() => setOverrideModal("approve")}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  <CheckCircle size={14} />
                  Approve
                </button>
                <button
                  onClick={() => setOverrideModal("reject")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-all"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Live status bar */}
        {isProcessing && (
          <div className="glass rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full pulse-dot" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-400">
                  Processing: <span className="capitalize">{currentStatus.replace("_", " ")}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Zampify AI is analyzing this invoice in real-time
                </p>
              </div>
              <div className="flex gap-1">
                {["classifying", "extracting", "validating"].map((s, i) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1 w-8 rounded-full transition-all",
                      ["extracting", "validating"].includes(currentStatus) && i === 0 ? "bg-blue-400" :
                      currentStatus === "validating" && i === 1 ? "bg-blue-400" :
                      currentStatus === s ? "bg-blue-400 animate-pulse" : "bg-white/10"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Decision card */}
        {(currentDecision || invoice.decision_explanation) && (
          <div className={cn(
            "glass rounded-xl p-5 border",
            currentDecision === "approved" ? "border-emerald-500/30 bg-emerald-500/5" :
            currentDecision === "rejected" ? "border-red-500/30 bg-red-500/5" :
            "border-amber-500/30 bg-amber-500/5"
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
                currentDecision === "approved" ? "bg-emerald-500/20" :
                currentDecision === "rejected" ? "bg-red-500/20" : "bg-amber-500/20"
              )}>
                {currentDecision === "approved" ? "✅" : currentDecision === "rejected" ? "❌" : "⚠️"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className={cn(
                    "text-lg font-bold capitalize",
                    currentDecision === "approved" ? "text-emerald-400" :
                    currentDecision === "rejected" ? "text-red-400" : "text-amber-400"
                  )}>
                    {currentDecision?.replace("_", " ")}
                  </h2>
                  {invoice.overall_confidence !== null && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${invoice.overall_confidence}%`,
                            background: invoice.overall_confidence >= 80 ? "#10b981" :
                              invoice.overall_confidence >= 60 ? "#f59e0b" : "#ef4444",
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-300">
                        {formatConfidence(invoice.overall_confidence)} confidence
                      </span>
                    </div>
                  )}
                  {invoice.policy_version && (
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-slate-500 font-mono">
                      Policy v{invoice.policy_version}
                    </span>
                  )}
                </div>
                {invoice.decision_explanation && (
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {invoice.decision_explanation}
                  </p>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {formatDateTime(invoice.decided_at)}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/3 rounded-xl w-fit">
          {(["overview", "validation", "timeline", "data"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                activeTab === tab ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab === "validation" ? "Validation Rules" : tab === "data" ? "Raw Data" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="glass rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={14} className="text-blue-400" /> Invoice Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Invoice #", value: invoice.invoice_number || "Not extracted" },
                  { label: "Date", value: formatDate(invoice.invoice_date) },
                  { label: "Due Date", value: formatDate(invoice.due_date) },
                  { label: "Payment Terms", value: invoice.payment_terms || "—" },
                  { label: "Currency", value: invoice.currency || "—" },
                  { label: "Source", value: invoice.source },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-sm text-white font-medium text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={14} className="text-emerald-400" /> Financials
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Subtotal", value: formatCurrency(invoice.subtotal, invoice.currency || "USD") },
                  { label: "Tax", value: formatCurrency(invoice.tax_amount, invoice.currency || "USD") },
                  { label: "Shipping", value: formatCurrency(invoice.shipping, invoice.currency || "USD") },
                  { label: "Grand Total", value: formatCurrency(invoice.grand_total, invoice.currency || "USD"), bold: true },
                ].map(({ label, value, bold }) => (
                  <div key={label} className={cn("flex justify-between items-center py-2 border-b border-white/5 last:border-0", bold && "border-t border-white/10 mt-2 pt-3")}>
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className={cn("text-sm text-right", bold ? "text-white font-bold text-lg" : "text-white font-medium")}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={14} className="text-violet-400" /> Confidence Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: "OCR Quality", value: invoice.ocr_confidence, weight: "15%" },
                  { label: "AI Extraction", value: invoice.extraction_confidence, weight: "30%" },
                  { label: "PO Match", value: invoice.matching_confidence, weight: "25%" },
                  { label: "Overall", value: invoice.overall_confidence, weight: "—" },
                ].map(({ label, value, weight }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{label} <span className="text-slate-700">({weight})</span></span>
                      <span className="text-slate-300">{formatConfidence(value)}</span>
                    </div>
                    {value !== null && (
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${value}%`,
                            background: (value || 0) >= 80 ? "#10b981" : (value || 0) >= 60 ? "#f59e0b" : "#ef4444",
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={14} className="text-blue-400" /> Processing Info
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Received", value: formatDateTime(invoice.received_at) },
                  { label: "Decided", value: formatDateTime(invoice.decided_at) },
                  { label: "Extraction Method", value: invoice.extraction_method || "—" },
                  { label: "Policy Version", value: invoice.policy_version ? `v${invoice.policy_version}` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-sm text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === "validation" && (
          <div className="glass rounded-xl overflow-hidden border border-white/5">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Business Rule Evaluation</h3>
              <p className="text-xs text-slate-500 mt-1">All results are deterministic — zero AI guesswork</p>
            </div>
            {invoice.validations?.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No validation results yet — invoice may still be processing.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {invoice.validations?.map((v: any) => (
                  <div key={v.rule_id} className="px-5 py-4 flex items-start gap-4">
                    <div className={cn(
                      "w-16 flex-shrink-0 text-xs font-mono font-medium",
                      getRuleStatusColor(v.status)
                    )}>
                      {v.rule_id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{v.rule_name}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          v.status === "pass" ? "bg-emerald-500/10 text-emerald-400" :
                          v.status === "warning" ? "bg-amber-500/10 text-amber-400" :
                          "bg-red-500/10 text-red-400"
                        )}>
                          {v.status === "pass" ? "✓ Pass" : v.status === "warning" ? "⚠ Warning" : "✗ Fail"}
                        </span>
                        <span className="text-xs text-slate-600 capitalize">({v.severity})</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{v.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="glass rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-5">Processing Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
              <div className="space-y-4">
                {invoice.timeline?.map((event: any, i: number) => (
                  <div key={event.id} className="relative pl-10 stage-in">
                    <div className={cn(
                      "absolute left-2.5 w-3 h-3 rounded-full border-2 -translate-x-1/2",
                      event.status === "completed" || event.status === "ai_completed"
                        ? "bg-emerald-400 border-emerald-400"
                        : event.status === "failed"
                        ? "bg-red-400 border-red-400"
                        : "bg-blue-400 border-blue-400 animate-pulse"
                    )} />
                    <div className="glass rounded-lg p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white capitalize">
                          {event.stage.replace("_", " ")}
                        </span>
                        <span className="text-xs text-slate-500 capitalize">— {event.status}</span>
                        {event.confidence !== null && (
                          <span className="ml-auto text-xs text-slate-400">{formatConfidence(event.confidence)}</span>
                        )}
                        {event.duration_ms !== null && (
                          <span className="text-xs text-slate-600">{event.duration_ms}ms</span>
                        )}
                      </div>
                      {event.details && (
                        <p className="text-xs text-slate-500 leading-relaxed">{event.details}</p>
                      )}
                      <p className="text-xs text-slate-700 mt-1.5">{formatDateTime(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Raw Data Tab */}
        {activeTab === "data" && (
          <div className="glass rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Raw Extracted Data</h3>
            {invoice.raw_extracted_data ? (
              <pre className="text-xs text-slate-300 overflow-auto bg-black/30 rounded-lg p-4 leading-relaxed font-mono max-h-[500px]">
                {JSON.stringify(invoice.raw_extracted_data, null, 2)}
              </pre>
            ) : (
              <p className="text-slate-500 text-sm">No extracted data available.</p>
            )}
          </div>
        )}
      </div>

      {/* Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverrideModal(null)} />
          <div className="relative glass rounded-2xl w-full max-w-md border border-white/10 shadow-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                overrideModal === "approve" ? "bg-emerald-500/20" : "bg-red-500/20"
              )}>
                {overrideModal === "approve" ? <CheckCircle size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
              </div>
              <div>
                <h3 className="text-base font-semibold text-white capitalize">{overrideModal} Invoice</h3>
                <p className="text-xs text-slate-500">Human override — requires justification</p>
              </div>
            </div>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Provide justification for this override decision..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-slate-600 resize-none h-28 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setOverrideModal(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleOverride}
                disabled={!justification.trim() || submitting}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                  overrideModal === "approve"
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white",
                  (!justification.trim() || submitting) && "opacity-50 cursor-not-allowed"
                )}
              >
                {submitting ? (
                  <><RefreshCw size={14} className="animate-spin" /> Submitting...</>
                ) : (
                  <><User size={14} /> Confirm {overrideModal}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
