import { useState } from "react";
import { Check, UserCheck, X, Mail, CornerUpRight, RotateCcw } from "lucide-react";
import { overrideDecision, InvoiceDetail } from "@/lib/api";

interface ActionHubProps {
  invoice: InvoiceDetail;
  onActionComplete: () => void;
}

export default function ActionHub({ invoice, onActionComplete }: ActionHubProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isRevising, setIsRevising] = useState(false);

  const handleAction = async (status: "approved" | "rejected" | "investigating" | "escalated") => {
    setLoading(true);
    try {
      await overrideDecision(invoice.id, status, `${reason} - ${notes}`);
      onActionComplete();
    } catch (e: any) {
      console.error(e);
      alert(`Failed to submit action: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const hasDecision = invoice.decision && invoice.decision !== "";

  if (hasDecision && !isRevising) {
    return (
      <div className="flex-[1.5] bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col h-full items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          {invoice.decision === "approved" ? <Check size={32} className="text-emerald-500" /> :
           invoice.decision === "rejected" ? <X size={32} className="text-red-500" /> :
           <Check size={32} className="text-blue-500" />}
        </div>
        <h3 className="font-bold text-lg text-slate-800 mb-2 capitalize">{invoice.decision}</h3>
        {invoice.decision_explanation && (
          <p className="text-sm text-slate-500 mb-6 max-w-[200px]">{invoice.decision_explanation}</p>
        )}
        <div className="mt-6 flex flex-col gap-3 w-full max-w-[200px]">
          <button 
            onClick={() => setIsRevising(true)}
            className="w-full text-sm font-medium text-blue-600 hover:bg-blue-50 py-2 rounded-lg border border-transparent hover:border-blue-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={14} /> Revise Decision
          </button>
          <button 
            onClick={() => onActionComplete()}
            className="w-full text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-[1.5] bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col h-full">
      <h3 className="font-semibold text-slate-800 mb-4 text-sm border-b border-slate-100 pb-2">Action Hub</h3>
      
      <div className="space-y-2 flex-1">
        <button 
          onClick={() => handleAction("approved")}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded flex items-center justify-center font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          <Check size={18} className="mr-2" /> Approve
        </button>
        <button 
          onClick={() => handleAction("approved")}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded flex items-center justify-center font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          <UserCheck size={18} className="mr-2" /> Approve with Reason
        </button>
        <button 
          onClick={() => handleAction("rejected")}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          <X size={18} className="mr-2" /> Reject & Return
        </button>
        <button 
          onClick={() => handleAction("investigating")}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          <Mail size={18} className="mr-2" /> Request Info from Vendor
        </button>
        <button 
          onClick={() => handleAction("escalated")}
          disabled={loading}
          className="w-full bg-slate-500 hover:bg-slate-600 text-white py-2 px-4 rounded flex items-center justify-center font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          <CornerUpRight size={18} className="mr-2" /> Escalate to Manager
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <label className="block text-xs text-slate-500 mb-1">Reason (required for actions)</label>
        <select 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-slate-300 rounded p-2 text-sm text-slate-700 mb-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">Select reason...</option>
          <option value="Missing GRN">Missing GRN</option>
          <option value="Price Variance Approved">Price Variance Approved</option>
          <option value="Manual Review Passed">Manual Review Passed</option>
        </select>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-slate-300 rounded p-2 text-sm text-slate-700 h-20 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
          placeholder="Add notes..."
        ></textarea>
        <button 
          onClick={() => handleAction("approved")}
          disabled={loading || !reason}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Action"}
        </button>
      </div>
    </div>
  );
}
