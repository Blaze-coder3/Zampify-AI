import { useState } from "react";
import { X, Search, Clock, FileText, CheckCircle2, AlertTriangle, Play, Check, AlertCircle } from "lucide-react";
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
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-20 transition-opacity"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 w-[85%] bg-slate-50 shadow-2xl flex flex-col transform transition-transform duration-300 z-30 border-l border-slate-200">
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {invoice.vendor_name || 'Unknown Vendor'} 
              <span className="text-slate-400 font-normal ml-2">#{invoice.invoice_number || invoice.id}</span>
            </h2>
          </div>
          <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border", 
            invoice.priority === 'High' ? "bg-red-100 text-red-700 border-red-200" : 
            invoice.priority === 'Medium' ? "bg-amber-100 text-amber-700 border-amber-200" : 
            "bg-emerald-100 text-emerald-700 border-emerald-200"
          )}>
            {invoice.priority || 'Medium'} Priority
          </span>
          <div className="text-sm font-bold text-slate-700 ml-4">
            ${invoice.grand_total ? invoice.grand_total.toLocaleString('en-US', {minimumFractionDigits:2}) : '0.00'}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative z-50 cursor-pointer">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6 border-b border-slate-200 shrink-0">
        <div className="flex space-x-8">
          {["Invoice View", "AI Interpretation", "Timeline"].map(tab => (
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
                    {invoice.validations?.filter(v => v.status === 'fail').length > 0 && (
                      <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">
                        {invoice.validations.filter(v => v.status === 'fail').length} FAILED
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {!invoice.validations || invoice.validations.length === 0 ? (
                      <div className="px-4 py-4 text-center text-sm text-slate-500 italic">No validations found.</div>
                    ) : (
                      invoice.validations.map((v, index) => (
                        <div key={`${v.rule_id}-${index}`} className={cn("px-4 py-3 flex items-start", v.status === 'fail' ? "bg-red-50/50" : "")}>
                          {v.status === 'pass' ? (
                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-3 shrink-0" />
                          ) : v.status === 'fail' ? (
                            <AlertTriangle size={16} className="text-red-500 mt-0.5 mr-3 shrink-0" />
                          ) : (
                            <AlertCircle size={16} className="text-amber-500 mt-0.5 mr-3 shrink-0" />
                          )}
                          <div>
                            <div className={cn("text-sm font-medium", v.status === 'fail' ? 'text-red-800' : 'text-slate-800')}>
                              {v.rule_id}
                            </div>
                            <div className={cn("text-xs mt-0.5", v.status === 'fail' ? 'text-red-600' : 'text-slate-500')}>
                              {v.details || (v.status === 'pass' ? 'Check passed' : 'Issue detected')}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* AI Interpretation */}
                {activeTab === "AI Interpretation" && (
                  <>
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Extracted Data</span>
                        <div className="flex items-center text-[10px] text-slate-500">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span> {Math.round((invoice.overall_confidence || 0) * 100)}% Conf
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        {Object.entries(invoice.raw_extracted_data || {}).filter(([k]) => k !== 'line_items').map(([key, val]) => {
                           const confPct = invoice.field_confidences?.[key] ? Math.round(invoice.field_confidences[key] * 100) : 95;
                           let displayVal = String(val);
                           if (val && typeof val === 'object' && 'value' in val) {
                               displayVal = String((val as any).value);
                           }
                           return (
                            <div key={key} className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-1 -m-1 rounded transition-colors">
                              <span className="text-sm text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-slate-800 mr-2">{displayVal}</span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={cn("h-full", confPct >= 90 ? "bg-emerald-500" : confPct >= 70 ? "bg-amber-500" : "bg-red-500")} style={{width: `${confPct}%`}}></div>
                                </div>
                              </div>
                            </div>
                           );
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden p-4 mt-4">
                       <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">AI Recommendation</h4>
                       <div className="text-sm font-bold text-slate-800">{invoice.ai_recommendation || invoice.status}</div>
                       <p className="text-xs text-slate-500 mt-1">{invoice.decision_explanation || 'No explanation provided.'}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Action Hub */}
              <div className="p-4 mt-auto">
                <ActionHub invoice={invoice} onActionComplete={() => { onRefresh(); onClose(); }} />
              </div>
            </div>
          </>
        ) : activeTab === "Timeline" ? (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Processing Timeline</h3>
              
              {!invoice.timeline || invoice.timeline.length === 0 ? (
                <div className="text-sm text-slate-500 italic">No timeline events available.</div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                  {invoice.timeline.map((event, idx) => (
                    <div key={event.id} className="relative pl-8">
                      {/* Timeline Dot */}
                      <div className={cn(
                        "absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white",
                        event.status === 'completed' || event.status === 'ai_completed' ? "bg-green-500" :
                        event.status === 'failed' ? "bg-red-500" : "bg-blue-500"
                      )}></div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-slate-800 capitalize">{event.stage.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">{event.details || 'Processing stage completed.'}</div>
                        
                        {(event.confidence !== null || event.duration_ms !== null) && (
                          <div className="flex space-x-4 mt-1">
                            {event.confidence !== null && (
                              <div className="flex items-center text-xs font-medium text-slate-500">
                                <Check size={14} className="mr-1 text-green-500" />
                                Conf: {Math.round(event.confidence)}%
                              </div>
                            )}
                            {event.duration_ms !== null && (
                              <div className="flex items-center text-xs font-medium text-slate-500">
                                <Clock size={14} className="mr-1 text-slate-400" />
                                {event.duration_ms}ms
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 flex-1 bg-slate-50 flex items-center justify-center">
            {activeTab} Content Placeholder
          </div>
        )}
      </div>
    </div>
    </>
  );
}
