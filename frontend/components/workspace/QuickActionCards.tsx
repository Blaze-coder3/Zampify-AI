"use client";

import { Inbox, MessageSquare, AlertTriangle, Search, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { InvoiceSummary, DashboardStats } from "@/lib/api";

interface QuickActionCardsProps {
  onFilter: (filter: string) => void;
  invoices?: InvoiceSummary[];
  stats?: DashboardStats | null;
}

export default function QuickActionCards({ onFilter, invoices = [], stats }: QuickActionCardsProps) {
  // Compute real counts from stats and invoices
  const needsReviewCount = stats?.needs_review || 0;
  
  // Example logic for the other cards
  const waitingVendorCount = 0; // Backend currently doesn't track this at invoice level
  const due2hCount = invoices.filter(i => i.status === 'validating').length; 
  const duplicatesCount = invoices.filter(i => i.status === 'failed').length;
  const readyCount = invoices.filter(i => i.status === 'validated').length;

  const cards = [
    {
      id: "needs_review",
      title: "Needs Review",
      icon: Inbox,
      count: String(needsReviewCount),
      desc: "Invoices need your review",
      buttonText: "Review Now",
      theme: {
        border: "border-blue-200",
        bg: "bg-blue-50/30",
        textTitle: "text-blue-900",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        btnText: "text-blue-700",
        btnBorder: "border-blue-200",
        btnHover: "hover:bg-blue-100",
      }
    },
    {
      id: "waiting_vendor",
      title: "Waiting on Vendor",
      icon: MessageSquare,
      count: String(waitingVendorCount),
      desc: "Awaiting vendor response",
      buttonText: "View Replies",
      theme: {
        border: "border-red-200",
        bg: "bg-red-50/30",
        textTitle: "text-red-900",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        btnText: "text-red-700",
        btnBorder: "border-red-200",
        btnHover: "hover:bg-red-100",
      }
    },
    {
      id: "due_2h",
      title: "Due Within 2 Hours",
      icon: AlertTriangle,
      count: String(due2hCount),
      desc: "SLA at risk",
      buttonText: "Prioritize",
      theme: {
        border: "border-amber-200",
        bg: "bg-amber-50/30",
        textTitle: "text-amber-900",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        btnText: "text-amber-700",
        btnBorder: "border-amber-200",
        btnHover: "hover:bg-amber-100",
      }
    },
    {
      id: "duplicate",
      title: "Duplicates Detected",
      icon: Search,
      count: String(duplicatesCount),
      desc: "Potential duplicates",
      buttonText: "Investigate",
      theme: {
        border: "border-purple-200",
        bg: "bg-purple-50/30",
        textTitle: "text-purple-900",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        btnText: "text-purple-700",
        btnBorder: "border-purple-200",
        btnHover: "hover:bg-purple-100",
      }
    },
    {
      id: "approved",
      title: "Ready to Approve",
      icon: CheckCircle2,
      count: String(readyCount),
      desc: "Ready for your approval",
      buttonText: "Approve Queue",
      theme: {
        border: "border-emerald-200",
        bg: "bg-emerald-50/30",
        textTitle: "text-emerald-900",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        btnText: "text-emerald-700",
        btnBorder: "border-emerald-200",
        btnHover: "hover:bg-emerald-100",
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const t = card.theme;
        return (
          <div key={card.id} className={cn("rounded-xl border bg-white shadow-none", t.border, t.bg)}>
            <div className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <span className={cn("font-semibold text-sm", t.textTitle)}>{card.title}</span>
                <div className={cn("p-1.5 rounded-md", t.iconBg, t.iconColor)}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{card.count}</div>
                <div className="text-xs text-gray-500 mt-1 mb-4">{card.desc}</div>
                <button 
                  onClick={() => onFilter(card.id)}
                  className={cn(
                    "w-full h-8 rounded-md px-3 text-xs inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors bg-white border shadow-sm",
                    t.btnText, t.btnBorder, t.btnHover
                  )}
                >
                  {card.buttonText} <ChevronRight className="w-3 h-3 ml-2"/>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}
