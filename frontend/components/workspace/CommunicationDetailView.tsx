"use client";

import { X, ExternalLink, Bot, CheckCircle2, User, Send, ArrowRight } from "lucide-react";
import { CommunicationCase } from "@/lib/api";

interface Props {
  caseDetail: CommunicationCase;
  onClose: () => void;
}

export default function CommunicationDetailView({ caseDetail, onClose }: Props) {
  return (
    <div className="w-[800px] bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col absolute right-0 top-0 z-40 animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 shrink-0 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="h-6 w-px bg-slate-700 mx-1"></div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              {caseDetail.id}
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {caseDetail.intent.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{caseDetail.subject}</div>
          </div>
        </div>
        <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors border border-slate-700">
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 flex flex-col gap-6">
        
        {/* Vendor Info Strip */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
              {caseDetail.vendor.name.substring(0, 1)}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">{caseDetail.vendor.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                ID: {caseDetail.vendor.id}
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</div>
             <div className="text-sm font-bold text-emerald-600">{caseDetail.status}</div>
          </div>
        </div>

        {/* Ownership Meta Block */}
        <div className="bg-slate-800 text-slate-200 rounded-lg p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm border border-slate-700">
           <div className="flex items-center gap-6">
              <div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Assigned To</div>
                 <div className="flex items-center gap-2">
                    {caseDetail.assignedTo ? (
                      <>
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-300">
                           {caseDetail.assignedTo.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium">{caseDetail.assignedTo.name}</span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 border border-slate-600 border-dashed rounded px-2 py-0.5 bg-slate-800">
                        <User size={10} /> Unassigned
                      </span>
                    )}
                 </div>
              </div>
              <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
              <div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Visible To</div>
                 <div className="text-sm font-medium flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" />
                    {caseDetail.assignedTeam || "Accounts Payable Team"}
                 </div>
              </div>
           </div>
           
           <div className="mt-3 sm:mt-0">
             <button className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded transition-colors border border-blue-500/20">
               {caseDetail.assignedTo?.name === "Priya Sharma" ? "Reassign Case" : "Take Ownership"}
             </button>
           </div>
        </div>

        {/* Thread History */}
        <div className="flex flex-col gap-4">
           {/* Vendor Original Email */}
           <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                <User size={14} className="text-slate-600" />
              </div>
              <div className="flex-1 bg-white border border-slate-200 rounded-xl rounded-tl-none p-4 shadow-sm">
                 <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-700">finance@{caseDetail.vendor.name.toLowerCase().replace(/\s/g,'')}.com</span>
                    <span className="text-[10px] text-slate-400">{new Date(caseDetail.createdAt).toLocaleString()}</span>
                 </div>
                 <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    Hello Accounts Payable,{"\n\n"}
                    {caseDetail.subject}. Can you please provide an update?{"\n\n"}
                    Regards,{"\n"}
                    {caseDetail.vendor.name} Accounts Receivable
                 </div>
              </div>
           </div>

           {/* AI Auto-Response (Mock) */}
           {caseDetail.intent === "PaymentStatus" && (
            <div className="flex gap-4 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
                <Bot size={14} className="text-white" />
              </div>
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl rounded-tr-none p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-blue-400">{new Date(caseDetail.updatedAt).toLocaleString()}</span>
                    <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Zampify AI Auto-Reply
                    </span>
                 </div>
                 <div className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                    Hello,{"\n\n"}
                    Your inquiry regarding the payment status has been processed automatically.{"\n"}
                    Based on our records, the related invoice is currently scheduled for payment on **July 25, 2026**.{"\n\n"}
                    Thank you,{"\n"}
                    Accounts Payable Team
                 </div>
                 
                 <div className="mt-4 pt-3 border-t border-blue-200/50 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Confidence Score: {caseDetail.aiConfidence * 100}%</span>
                    <span className="text-xs text-blue-500 bg-white px-2 py-1 rounded-md border border-blue-100 font-medium">Sent Automatically</span>
                 </div>
              </div>
            </div>
           )}
        </div>
      </div>

      {/* Reply Box */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <textarea 
            rows={3} 
            placeholder="Reply to vendor..."
            className="w-full p-3 text-sm focus:outline-none resize-none"
          />
          <div className="bg-slate-50 p-2 border-t border-slate-200 flex justify-between items-center">
            <div className="text-[10px] text-slate-500 font-medium px-2">Drafting as Priya (AP Specialist)</div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
              Send <Send size={12} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
