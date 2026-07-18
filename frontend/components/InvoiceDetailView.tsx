import { useState } from "react";
import { X, Search, Clock, FileText, CheckCircle2, AlertTriangle, Play, Check } from "lucide-react";
import { InvoiceDetail } from "@/lib/api";
import DocumentViewer from "./DocumentViewer";
import ActionHub from "./ActionHub";
import { cn } from "@/lib/utils";

interface InvoiceDetailViewProps {
  invoice: InvoiceDetail;
  onClose: () => void;
  onRefresh: () => void;
}

export default function InvoiceDetailView({ invoice, onClose, onRefresh }: InvoiceDetailViewProps) {
  const [activeTab, setActiveTab] = useState("AI Interpretation");

  return (
    <div className="absolute inset-y-0 right-0 w-[85%] bg-slate-50 shadow-2xl flex flex-col transform transition-transform duration-300 z-30 border-l border-slate-200">
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {invoice.vendor_name || 'Unknown Vendor'} 
              <span className="text-slate-400 font-normal ml-2">#{invoice.id.substring(0,8).toUpperCase()}</span>
            </h2>
          </div>
          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200">
            High Risk
          </span>
          <div className="text-sm font-bold text-slate-700 ml-4">
            ${invoice.grand_total ? invoice.grand_total.toLocaleString('en-US', {minimumFractionDigits:2}) : '0.00'}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">Follow +</button>
          <div className="w-px h-6 bg-slate-200"></div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative z-50 cursor-pointer">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6 border-b border-slate-200 shrink-0">
        <div className="flex space-x-8">
          {["Invoice View", "AI Interpretation", "Timeline", "History"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "Invoice View" || activeTab === "AI Interpretation" ? (
          <>
            <DocumentViewer invoice={invoice} />
            
            <div className="w-96 bg-slate-50 flex flex-col overflow-y-auto shrink-0">
              <div className="p-4 space-y-4">
                {/* Validation Rules */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Validation Engine</span>
                    <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">1 FAILED</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 py-3 flex items-start">
                      <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-3 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">Vendor Verified</div>
                        <div className="text-xs text-slate-500 mt-0.5">Matched vendor master record (ID: V-8472)</div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-start">
                      <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-3 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">Duplicate Check Passed</div>
                        <div className="text-xs text-slate-500 mt-0.5">No similar invoices found in last 90 days</div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-start bg-red-50/50">
                      <AlertTriangle size={16} className="text-red-500 mt-0.5 mr-3 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-red-800">Three-Way Match Failed</div>
                        <div className="text-xs text-red-600 mt-0.5">Missing Goods Receipt Note (GRN) for PO-2024-89</div>
                        <button className="mt-2 text-xs font-medium text-blue-600 flex items-center hover:text-blue-800 transition-colors">
                          <Search size={12} className="mr-1" /> Search ERP for GRN
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Interpretation */}
                {activeTab === "AI Interpretation" && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Extracted Data</span>
                      <div className="flex items-center text-[10px] text-slate-500">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span> {Math.round((invoice.overall_confidence || 0) * 100)}% Conf
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-1 -m-1 rounded transition-colors">
                        <span className="text-sm text-slate-500">Invoice Number</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-slate-800 mr-2">{invoice.id.substring(0,8).toUpperCase()}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-1 -m-1 rounded transition-colors">
                        <span className="text-sm text-slate-500">Subtotal</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-slate-800 mr-2">${invoice.subtotal?.toFixed(2)}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[95%]"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-1 -m-1 rounded transition-colors">
                        <span className="text-sm text-slate-500">Tax</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-slate-800 mr-2">${invoice.tax_amount?.toFixed(2)}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[90%]"></div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-1 -m-1 rounded transition-colors">
                        <span className="text-sm font-medium text-slate-700">Total</span>
                        <div className="flex items-center">
                          <span className="text-base font-bold text-slate-900 mr-2">${invoice.grand_total?.toFixed(2)}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[98%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Hub */}
              <div className="p-4 mt-auto">
                <ActionHub invoiceId={invoice.id} onActionComplete={() => { onRefresh(); onClose(); }} />
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-slate-500">
            {activeTab} Content Placeholder
          </div>
        )}
      </div>
    </div>
  );
}
