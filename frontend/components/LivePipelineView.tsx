"use client";

import { DashboardStats } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface Props { stats: DashboardStats | null; }

const STAGES = [
  { key: "received", label: "Received", icon: "📥" },
  { key: "classifying", label: "Classifying", icon: "🔍" },
  { key: "extracting", label: "Extracting", icon: "🤖" },
  { key: "validating", label: "Validating", icon: "⚖️" },
  { key: "approved", label: "Approved", icon: "✅" },
  { key: "needs_review", label: "Review", icon: "⚠️" },
  { key: "rejected", label: "Rejected", icon: "❌" },
  { key: "failed", label: "Failed", icon: "💥" },
];

export default function LivePipelineView({ stats }: Props) {
  // Simulate pipeline counts from stats (in real implementation, use /dashboard/pipeline)
  const counts: Record<string, number> = {
    received: stats?.pending || 0,
    classifying: 0,
    extracting: 0,
    validating: 0,
    approved: stats?.approved || 0,
    needs_review: stats?.needs_review || 0,
    rejected: stats?.rejected || 0,
    failed: stats?.failed || 0,
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={16} className="text-blue-400" />
          <h2 className="text-sm font-semibold text-white">Pipeline Overview</h2>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full pulse-dot" />
            <span className="text-xs text-emerald-400">Live</span>
          </div>
        </div>

        {/* Flow diagram */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STAGES.slice(0, 4).map((stage, i) => (
            <div key={stage.key} className="relative">
              <div className={cn(
                "rounded-xl p-4 border text-center transition-all",
                counts[stage.key] > 0
                  ? "border-blue-500/30 bg-blue-500/10"
                  : "border-white/5 bg-white/2"
              )}>
                <div className="text-2xl mb-1">{stage.icon}</div>
                <div className={cn(
                  "text-2xl font-bold mb-1",
                  counts[stage.key] > 0 ? "text-blue-400" : "text-slate-600"
                )}>
                  {counts[stage.key]}
                </div>
                <div className="text-xs text-slate-500">{stage.label}</div>
              </div>
              {i < 3 && (
                <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-slate-600 text-xs z-10">→</div>
              )}
            </div>
          ))}
        </div>

        {/* Outcome stages */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-slate-600 mb-3 uppercase tracking-wider">Outcomes</p>
          <div className="grid grid-cols-4 gap-4">
            {STAGES.slice(4).map((stage) => (
              <div key={stage.key} className={cn(
                "rounded-xl p-4 border text-center",
                stage.key === "approved" ? "border-emerald-500/20 bg-emerald-500/8" :
                stage.key === "needs_review" ? "border-amber-500/20 bg-amber-500/8" :
                stage.key === "rejected" ? "border-red-500/20 bg-red-500/8" :
                "border-white/5 bg-white/2"
              )}>
                <div className="text-2xl mb-1">{stage.icon}</div>
                <div className={cn(
                  "text-2xl font-bold mb-1",
                  stage.key === "approved" ? "text-emerald-400" :
                  stage.key === "needs_review" ? "text-amber-400" :
                  stage.key === "rejected" ? "text-red-400" : "text-slate-600"
                )}>
                  {counts[stage.key]}
                </div>
                <div className="text-xs text-slate-500">{stage.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System health */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">System Health</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "OCR Service", status: "healthy", latency: "1.2s" },
            { label: "AI Extraction", status: "healthy", latency: "3.8s" },
            { label: "Decision Engine", status: "healthy", latency: "1.1s" },
          ].map((s) => (
            <div key={s.label} className="p-3 bg-white/3 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <p className="text-xs text-slate-600">Avg latency: {s.latency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
