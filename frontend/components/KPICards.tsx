"use client";

import { DashboardStats } from "@/lib/api";
import { cn, formatConfidence } from "@/lib/utils";
import { TrendingUp, CheckCircle, AlertTriangle, XCircle, Clock, FileText } from "lucide-react";

interface Props { stats: DashboardStats; }

export default function KPICards({ stats }: Props) {
  const cards = [
    {
      label: "Straight-Through Rate",
      value: `${stats.stp_rate.toFixed(1)}%`,
      sub: "Auto-approved, no human touch",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "glow-green",
    },
    {
      label: "Approved",
      value: stats.approved.toLocaleString(),
      sub: `of ${stats.total_invoices} total`,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/8",
      border: "border-emerald-500/15",
    },
    {
      label: "Needs Review",
      value: stats.needs_review.toLocaleString(),
      sub: "Awaiting human decision",
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      urgent: stats.needs_review > 0,
    },
    {
      label: "Rejected",
      value: stats.rejected.toLocaleString(),
      sub: "Critical failures detected",
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/8",
      border: "border-red-500/15",
    },
    {
      label: "Processing",
      value: stats.pending.toLocaleString(),
      sub: "In pipeline right now",
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-500/8",
      border: "border-blue-500/15",
    },
    {
      label: "Avg Cycle Time",
      value: stats.avg_processing_time_seconds
        ? `${stats.avg_processing_time_seconds.toFixed(0)}s`
        : "—",
      sub: "End-to-end processing",
      icon: Clock,
      color: "text-violet-400",
      bg: "bg-violet-500/8",
      border: "border-violet-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-xl p-4 border glass transition-all",
            card.border,
            card.urgent && "ring-1 ring-amber-500/30 animate-pulse"
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={cn("p-2 rounded-lg", card.bg)}>
              <card.icon size={14} className={card.color} />
            </div>
          </div>
          <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
          <p className="text-xs font-medium text-white mt-1">{card.label}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-tight">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
