import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null, currency = "USD"): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatConfidence(conf: number | null): string {
  if (conf === null || conf === undefined) return "—";
  return `${conf.toFixed(1)}%`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    approved: "text-emerald-400",
    rejected: "text-red-400",
    needs_review: "text-amber-400",
    failed: "text-red-500",
    triage: "text-orange-400",
    received: "text-slate-400",
    classifying: "text-blue-400",
    extracting: "text-blue-400",
    extracted: "text-blue-400",
    validating: "text-violet-400",
    validated: "text-violet-400",
    archived: "text-slate-500",
  };
  return map[status] || "text-slate-400";
}

export function getStatusBg(status: string): string {
  const map: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    needs_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    failed: "bg-red-600/10 text-red-500 border-red-600/20",
    triage: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    received: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    classifying: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    extracting: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    validating: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };
  return map[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
}

export function getStatusEmoji(status: string): string {
  const map: Record<string, string> = {
    approved: "✅",
    rejected: "❌",
    needs_review: "⚠️",
    failed: "💥",
    triage: "🔧",
    received: "📥",
    classifying: "🔍",
    extracting: "🤖",
    extracted: "📋",
    validating: "⚖️",
    validated: "✔️",
    archived: "📁",
  };
  return map[status] || "•";
}

export function getRuleStatusColor(status: string): string {
  if (status === "pass") return "text-emerald-400";
  if (status === "warning") return "text-amber-400";
  return "text-red-400";
}
