"use client";

import { CheckCircle2, MessageSquare, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { InvoiceSummary } from "@/lib/api";

interface ActivityFeedProps {
  invoices?: InvoiceSummary[];
}

export default function ActivityFeed({ invoices = [] }: ActivityFeedProps) {
  // Generate activities dynamically from recent invoices
  const activityFeed = [...invoices]
    .sort((a, b) => {
      const dateA = new Date(a.decided_at || a.received_at || 0).getTime();
      const dateB = new Date(b.decided_at || b.received_at || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5)
    .map(inv => {
      let text = 'Processed Invoice';
      let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      
      if (inv.status === 'failed') {
        text = 'Processing Failed';
        icon = <AlertTriangle className="w-4 h-4 text-red-500" />;
      } else if (inv.status === 'needs_review') {
        text = 'Needs Review';
        icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
      } else if (inv.decision === 'rejected') {
        text = 'Rejected Invoice';
        icon = <AlertTriangle className="w-4 h-4 text-red-500" />;
      } else if (inv.decision === 'approved') {
        text = 'Approved Invoice';
        icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      } else {
        text = 'Invoice Received';
        icon = <MessageSquare className="w-4 h-4 text-blue-500" />;
      }

      const date = new Date(inv.decided_at || inv.received_at || Date.now());
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        text,
        id: inv.invoice_number || inv.id,
        time,
        icon
      };
    });


  return (
    <div className="rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm flex flex-col min-h-0">
      <div className="flex flex-col space-y-1.5 p-6 pb-2">
        <h3 className="font-semibold leading-none tracking-tight text-base">Activity Feed</h3>
      </div>
      <div className="p-0 flex-1">
        <div className="divide-y divide-gray-100">
          {activityFeed.map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 flex justify-between items-center transition-colors">
              <div className="flex gap-3 items-center">
                {item.icon}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.text}</p>
                  <p className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">{item.id}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 border-t border-gray-100 text-center mt-auto">
        <button className="text-blue-600 underline-offset-4 hover:underline text-xs p-0 h-auto inline-flex items-center justify-center font-medium">
          View all activity <ChevronRight className="w-3 h-3 ml-1"/>
        </button>
      </div>
    </div>
  );
}
