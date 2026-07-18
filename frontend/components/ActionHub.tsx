import { useState } from "react";
import { Check, UserCheck, X, Mail, CornerUpRight } from "lucide-react";
import { overrideDecision } from "@/lib/api";

interface ActionHubProps {
  invoiceId: string;
  onActionComplete: () => void;
}

export default function ActionHub({ invoiceId, onActionComplete }: ActionHubProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleAction = async (status: "approved" | "rejected" | "investigating") => {
    setLoading(true);
    try {
      await overrideDecision(invoiceId, status, `${reason} - ${notes}`);
      onActionComplete();
    } catch (e) {
      console.error(e);
      alert("Failed to submit action.");
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => handleAction("investigating")}
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
