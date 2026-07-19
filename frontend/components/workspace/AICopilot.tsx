"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ChevronRight, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { DashboardStats, CommunicationCase, InvoiceSummary } from "@/lib/api";

interface AICopilotProps {
  stats?: DashboardStats | null;
  cases?: CommunicationCase[];
  invoices?: InvoiceSummary[];
  onSelectInvoice?: (id: string) => void;
}

export default function AICopilot({ stats, cases = [], invoices = [], onSelectInvoice }: AICopilotProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Compute dynamic summary
  const needsReviewCount = stats?.needs_review || 0;
  const waitingVendorCount = stats?.waiting_on_vendor || 0;
  const slaAtRiskCount = stats?.due_within_2h || 0;


  useEffect(() => {
    // Generate notifications dynamically from cases
    const notifs = cases.slice(0, 4).map((c: CommunicationCase) => ({
      text: c.status === "Closed" ? 'Invoice approved' : (c.invoiceId ? 'Invoice Linked' : 'Needs Review'),
      sub: c.status === "Closed" ? `${c.invoiceId} approved` : (c.invoiceId ? `${c.invoiceId} linked` : `Review case ${c.id}`),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), // mock time
      type: c.status === "Closed" ? 'green' : (c.invoiceId ? 'purple' : 'red'),
      id: c.id
    }));
    setNotifications(notifs);
    setLoading(false);
  }, [cases]);

  return (
    <div className="w-full h-full flex flex-col gap-6 shrink-0">
      
      {/* AI Copilot Widget */}
      <div className="rounded-xl border border-purple-100 bg-gradient-to-b from-purple-50/50 to-white text-gray-950 shadow-sm overflow-hidden flex flex-col">
        <div className="py-4 px-6 border-b border-purple-100/50 flex flex-row items-center gap-2">
           <div className="bg-purple-100 p-1.5 rounded-md text-purple-600"><AlertTriangle className="w-4 h-4" /></div>
           <h3 className="font-semibold leading-none tracking-tight text-base text-purple-950">AI Copilot</h3>
        </div>
        <div className="p-6 pt-4 flex flex-col gap-5">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Today's Summary</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {needsReviewCount} invoices need review</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> {waitingVendorCount} waiting on vendor response</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> {slaAtRiskCount} SLA at risk</li>
            </ul>
            <button 
              className="w-full mt-4 h-8 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => alert("Full summary feature coming soon! Check the Analytics tab for detailed breakdowns.")}
            >
              View Full Summary <ChevronRight className="w-3 h-3 ml-2"/>
            </button>
          </div>

          {invoices && invoices.length > 0 && (
            <div className="border-t border-purple-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Suggested Next Case</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                    <FileText className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-600 text-sm leading-tight">{invoices[0].invoice_number || 'INV-Pending'}</div>
                    <div className="text-xs text-gray-500">{invoices[0].vendor_name || 'Unknown Vendor'}</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${invoices[0].priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'} border py-0 text-[10px]`}>{invoices[0].priority || 'Medium'} Priority</div>
                </div>
                <div className="text-xs text-gray-600 mb-3 flex justify-between items-center">
                  SLA Remaining: <span className="font-bold text-red-600">{invoices[0].sla_remaining || '24h 0m'}</span>
                </div>
                <button 
                  className="w-full h-8 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  onClick={() => onSelectInvoice && onSelectInvoice(invoices[0].id)}
                >
                  Open Next Case
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Notifications Widget */}
      <div className="rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm flex-1 flex flex-col min-h-0">
        <div className="flex flex-col space-y-1.5 py-4 px-6 border-b border-gray-100">
          <h3 className="font-semibold leading-none tracking-tight text-sm">Recent Notifications</h3>
        </div>
        <div className="p-0 overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">No new notifications</div>
            ) : (
              notifications.map((notif, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50 flex gap-3 items-start transition-colors cursor-pointer" onClick={() => alert(`View details for ${notif.id}`)}>
                  <div className="mt-0.5">
                    {notif.type === 'red' && <ChevronRight className="w-4 h-4 text-red-500" />}
                    {notif.type === 'green' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {notif.type === 'purple' && <FileText className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{notif.text}</p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{notif.sub}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="p-3 border-t border-gray-100 text-center mt-auto">
          <button 
            className="text-blue-600 underline-offset-4 hover:underline text-xs inline-flex items-center justify-center font-medium"
            onClick={() => alert("Viewing all notifications")}
          >
            View all notifications <ChevronRight className="w-3 h-3 ml-1"/>
          </button>
        </div>
      </div>

    </div>
  );
}
