import { useState } from "react";
import { Check, UserCheck, X, Mail, CornerUpRight, RotateCcw, ChevronLeft } from "lucide-react";
import { overrideDecision, notifyInvoiceAction, InvoiceDetail } from "@/lib/api";

interface ActionHubProps {
  invoice: InvoiceDetail;
  onActionComplete: () => void;
}

type ActionType = "approved_with_reason" | "rejected" | "investigating" | "escalated" | null;

export default function ActionHub({ invoice, onActionComplete }: ActionHubProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isRevising, setIsRevising] = useState(false);

  const submitDirectApprove = async () => {
    setLoading(true);
    try {
      await overrideDecision(invoice.id, "approved", "Approved directly");
      await notifyInvoiceAction(invoice.id, "approved", "Approved directly", "");
      onActionComplete();
    } catch (e: any) {
      console.error(e);
      alert(`Failed to submit action: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const submitActionWithReason = async () => {
    if (!selectedAction || !reason) return;
    setLoading(true);
    try {
      let status: "approved" | "rejected" | "investigating" | "escalated" = "approved";
      if (selectedAction === "rejected") status = "rejected";
      if (selectedAction === "investigating") status = "investigating";
      if (selectedAction === "escalated") status = "escalated";

      const justification = `${reason} - ${notes}`;
      await overrideDecision(invoice.id, status, justification);
      await notifyInvoiceAction(invoice.id, selectedAction, reason, notes);
      
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
      <div className="flex items-center mb-4 border-b border-slate-100 pb-2">
        {selectedAction && (
          <button onClick={() => setSelectedAction(null)} className="mr-2 text-slate-400 hover:text-slate-600">
            <ChevronLeft size={16} />
          </button>
        )}
        <h3 className="font-semibold text-slate-800 text-sm">Action Hub</h3>
      </div>
      
      {!selectedAction ? (
        <div className="space-y-2 flex-1">
          <button 
            onClick={submitDirectApprove}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded flex items-center justify-center font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            <Check size={18} className="mr-2" /> Approve
          </button>
          <button 
            onClick={() => setSelectedAction("approved_with_reason")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded flex items-center justify-center font-medium shadow-sm transition-colors"
          >
            <UserCheck size={18} className="mr-2" /> Approve with Reason
          </button>
          <button 
            onClick={() => setSelectedAction("rejected")}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center font-medium shadow-sm transition-colors"
          >
            <X size={18} className="mr-2" /> Reject & Return
          </button>
          <button 
            onClick={() => setSelectedAction("investigating")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center font-medium shadow-sm transition-colors"
          >
            <Mail size={18} className="mr-2" /> Request Info from Vendor
          </button>
          <button 
            onClick={() => setSelectedAction("escalated")}
            className="w-full bg-slate-500 hover:bg-slate-600 text-white py-2 px-4 rounded flex items-center justify-center font-medium shadow-sm transition-colors"
          >
            <CornerUpRight size={18} className="mr-2" /> Escalate to Manager
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            {selectedAction === 'approved_with_reason' && <><UserCheck size={16} className="text-amber-500"/> Approve with Reason</>}
            {selectedAction === 'rejected' && <><X size={16} className="text-red-500"/> Reject & Return</>}
            {selectedAction === 'investigating' && <><Mail size={16} className="text-blue-500"/> Request Info</>}
            {selectedAction === 'escalated' && <><CornerUpRight size={16} className="text-slate-500"/> Escalate</>}
          </div>

          <label className="block text-xs text-slate-500 mb-1">Reason (required)</label>
          <select 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-slate-300 rounded p-2 text-sm text-slate-700 mb-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="">Select reason...</option>
            <option value="Missing GRN">Missing GRN</option>
            <option value="Price Variance Approved">Price Variance Approved</option>
            <option value="Manual Review Passed">Manual Review Passed</option>
            <option value="Tax Mismatch">Tax Mismatch</option>
            <option value="Missing Line Items">Missing Line Items</option>
            <option value="Other">Other</option>
          </select>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-slate-300 rounded p-2 text-sm text-slate-700 h-24 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none mb-4" 
            placeholder="Add notes to include in email notification..."
          ></textarea>
          <button 
            onClick={submitActionWithReason}
            disabled={loading || !reason}
            className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Action"}
          </button>
        </div>
      )}
    </div>
  );
}
