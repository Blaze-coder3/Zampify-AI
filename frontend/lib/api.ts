// API client for Zampify AI backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("zampify_token");
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.detail || "Request failed");
  }
  return res.json();
}

// Auth
export async function login(email: string, password: string) {
  const data = await apiFetch<{ data: { access_token: string; user: User } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("zampify_token", data.data.access_token);
  return data.data;
}

export async function getMe(): Promise<{ data: User }> {
  return apiFetch("/auth/me");
}

// Invoices
export async function listInvoices(status?: string, limit = 50): Promise<{ data: InvoiceSummary[] }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (status) params.set("status", status);
  return apiFetch(`/invoices?${params}`);
}

export async function getInvoice(id: string): Promise<{ data: InvoiceDetail }> {
  return apiFetch(`/invoices/${id}`);
}

export async function getInvoiceTimeline(id: string): Promise<{ data: TimelineEvent[] }> {
  return apiFetch(`/invoices/${id}/timeline`);
}

export async function uploadInvoice(file: File): Promise<{ data: { invoice_id: string; status: string } }> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/invoices/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function overrideDecision(id: string, decision: string, justification: string) {
  return apiFetch(`/invoices/${id}/decision`, {
    method: "PATCH",
    body: JSON.stringify({ decision, justification }),
  });
}

export async function notifyInvoiceAction(id: string, action: string, reason: string = "", notes: string = "") {
  return apiFetch(`/invoices/${id}/notify`, {
    method: "POST",
    body: JSON.stringify({ action, reason, notes }),
  });
}

export async function reprocessInvoice(id: string) {
  return apiFetch(`/invoices/${id}/reprocess`, { method: "POST" });
}

export async function bulkApproveInvoices(invoiceIds: string[]): Promise<{ status: string; count: number }> {
  return apiFetch<{ status: string; count: number }>("/invoices/bulk-approve", {
    method: "POST",
    body: JSON.stringify({ invoice_ids: invoiceIds, action: "approve" }),
  });
}

export async function bulkAssignInvoices(invoiceIds: string[], assigneeId: string): Promise<{ status: string; count: number }> {
  return apiFetch<{ status: string; count: number }>("/invoices/bulk-assign", {
    method: "POST",
    body: JSON.stringify({ invoice_ids: invoiceIds, assignee_id: assigneeId }),
  });
}

export async function bulkTagInvoices(invoiceIds: string[], tag: string): Promise<{ status: string; count: number }> {
  return apiFetch<{ status: string; count: number }>("/invoices/bulk-tag", {
    method: "POST",
    body: JSON.stringify({ invoice_ids: invoiceIds, tag: tag }),
  });
}


// Dashboard
export async function getDashboardStats(): Promise<{ data: DashboardStats }> {
  return apiFetch("/dashboard/stats");
}

export async function getPipelineStatus(): Promise<{ data: Record<string, number> }> {
  return apiFetch("/dashboard/pipeline");
}

// Vendors
export async function listVendors(): Promise<{ data: Vendor[] }> {
  return apiFetch("/vendors");
}

// WebSocket
export function connectInvoiceWS(
  invoiceId: string,
  onMessage: (data: WSMessage) => void,
  onClose?: () => void
): WebSocket {
  const token = getToken();
  const ws = new WebSocket(`${WS_BASE}/ws/invoices/${invoiceId}?token=${token}`);
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  ws.onclose = () => onClose?.();
  return ws;
}

// Types
export interface Vendor {
  id: string;
  name: string;
  tax_id: string | null;
  email: string | null;
  status: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface InvoiceSummary {
  id: string;
  invoice_number: string | null;
  status: string;
  decision: string | null;
  grand_total: number | null;
  currency: string | null;
  overall_confidence: number | null;
  source: string;
  received_at: string | null;
  decided_at: string | null;
  vendor_name?: string; // Adding for mock UI compatibility
  ai_recommendation?: string;
  priority?: string;
  sla_remaining?: string;
  assignee_id?: string | null;
  assigned_to_name?: string;
  tags?: string[];
  triggered_rules?: string[] | null;
  document_type?: string;
}

export interface CommunicationCase {
  id: string;
  threadId: string;
  folder: "Inbox" | "VendorInvoices" | "VendorQueries" | "Exceptions" | "Spam";
  intent: "Invoice" | "PaymentStatus" | "Correction" | "Reminder" | "CreditNote" | "Unknown";
  vendor: { id: string; name: string };
  subject: string;
  invoiceId?: string;
  poNumber?: string;
  assignedTo?: { id: string; name: string };
  assignedTeam: string;
  createdBy: string;
  lastUpdatedBy: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "WaitingVendor" | "NeedsReview" | "Closed";
  aiConfidence: number;
  createdAt: string;
  updatedAt: string;
}

// Mock function for frontend development
export async function listCommunicationCases(folder: string = 'VendorInvoices', filters: string[] = []): Promise<{ data: CommunicationCase[] }> {
  // Call the real backend endpoint instead of returning mock data
  const params = new URLSearchParams({ folder });
  // Add filters if any
  if (filters.length > 0) {
    params.set("filters", filters.join(","));
  }
  return apiFetch(`/invoices/communication-cases?${params}`);
}

export interface ValidationResult {
  rule_id: string;
  rule_name: string;
  status: "pass" | "warning" | "fail";
  severity: string;
  reason: string;
  details: Record<string, unknown>;
}

export interface TimelineEvent {
  id: string;
  stage: string;
  status: string;
  details: string | null;
  confidence: number | null;
  duration_ms: number | null;
  timestamp: string;
}

export interface InvoiceDetail extends InvoiceSummary {
  vendor_id: string | null;
  matched_po_id: string | null;
  invoice_date: string | null;
  due_date: string | null;
  subtotal: number | null;
  tax_amount: number | null;
  shipping: number | null;
  payment_terms: string | null;
  line_items?: any[];
  ocr_confidence: number | null;
  extraction_confidence: number | null;
  matching_confidence: number | null;
  extraction_method: string | null;
  raw_extracted_data: Record<string, unknown> | null;
  field_confidences?: Record<string, number> | null;
  ocr_bounding_boxes?: { fields?: Record<string, number[]>, layout_regions?: any[] } | null;
  decision_explanation: string | null;
  decision_evidence: { evidence: ValidationResult[] } | null;
  triggered_rules?: string[] | null;
  policy_version: string | null;
  validations: ValidationResult[];
  pdf_storage_path?: string | null;
  timeline: TimelineEvent[];
}

export interface DashboardStats {
  total_invoices: number;
  approved: number;
  rejected: number;
  needs_review: number;
  pending: number;
  failed: number;
  due_within_2h: number;
  duplicates_detected: number;
  ready_to_approve: number;
  waiting_on_vendor: number;
  stp_rate: number;
  avg_processing_time_seconds: number | null;
}

export interface AnalyticsSummary {
  review_summary?: {
    needs_review: number;
    due_today: number;
    overdue: number;
    escalated: number;
  };
  kpis?: {
    sla_compliance: string;
    avg_time: string;
  };
  status_distribution: Record<string, number>;
  risk_distribution: { high: number; medium: number; low: number; };
  sla_compliance: { date: string; value: number }[];
  top_vendors: { vendor_name: string; count: number; total_amount: number }[];
}

export interface WSMessage {
  type: string;
  invoice_id: string;
  status: string;
  decision: string | null;
  confidence: number | null;
  explanation: string | null;
}

// Analytics
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>("/analytics/summary");
}

export interface ArchiveSummary {
  kpis: {
    total_invoices: number;
    archived: number;
    exceptions: number;
    total_spend: number;
    vendors_count: number;
  };
  status_distribution: Record<string, number>;
  recent_searches: string[];
}

export async function getArchiveSummary(): Promise<ArchiveSummary> {
  return apiFetch<ArchiveSummary>("/analytics/archive-summary");
}

export interface OverviewDashboardData {
  kpis: Record<string, { value: number; pct?: number; trend: number; up: boolean; unit?: string }>;
  processing_trends: { date: string; processed: number; auto_approved: number; needs_review: number; overdue: number }[];
  status_distribution: Record<string, number>;
  aging_summary: { label: string; count: number; pct: number }[];
  sparklines: Record<string, { value: number; unit: string; trend: number }>;
  top_vendors: { vendor_name: string; total_spend: number; invoices: number; pct: number }[];
  team_performance: { name: string; avatar: string; processed: number; approved_pct: number; sla_pct: number; avg_review_hrs: number }[];
  recent_alerts: { type: string; title: string; subtitle: string; time: string }[];
}

export async function getOverviewSummary(): Promise<OverviewDashboardData> {
  return apiFetch<OverviewDashboardData>("/analytics/overview");
}

export interface BottlenecksDashboardData {
  kpis: Record<string, { value: number; unit: string; trend: number; up: boolean }>;
  heatmap: { step: string; days: number[]; avg: number; trend: number[] }[];
  top_bottlenecks: { rank: number; step: string; avg_time: number; pct_total: number; trend_vs_prev: number }[];
  department_bottlenecks: { dept: string; cycle_time: number; trend: number }[];
  vendor_bottlenecks: { vendor: string; cycle_time: number; step: string; trend: number }[];
  trend_over_time: { date: string; approval: number; three_way: number; validation: number; others: number }[];
}

export async function getBottlenecksSummary(): Promise<BottlenecksDashboardData> {
  return apiFetch<BottlenecksDashboardData>("/analytics/bottlenecks");
}

export interface FinancialDashboardData {
  kpis: Record<string, { value: number; unit: string; trend: number; up: boolean }>;
  spend_trend: { date: string; total_spend: number; payments_made: number }[];
  spend_by_category: { category: string; value: number; pct: number; color: string }[];
  spend_by_payment_terms: { term: string; value: number; pct: number; color: string }[];
  top_vendors: { vendor: string; total_spend: number; pct_total: number; trend: number; up: boolean }[];
  aging_payables: { bucket: string; amount: number; pct_total: number; trend: number; up: boolean }[];
  cash_flow: Record<string, { amount: number; trend: number }>;
  budget: { utilized_pct: number; spent: number; total_budget: number };
  monthly_spend: { month: string; actual: number; budget: number }[];
  upcoming_payments: { vendor: string; count: number; amount: number; due_date: string; method: string }[];
}

export async function getFinancialSummary(): Promise<FinancialDashboardData> {
  return apiFetch<FinancialDashboardData>("/analytics/financial");
}

export interface SystemGraphData {
  kpis: Record<string, any>;
  resource_utilization: any;
  top_services: any[];
  recent_alerts: any[];
  system_health_charts: any;
}

export async function getSystemStatus(): Promise<SystemGraphData> {
  return apiFetch<SystemGraphData>("/admin/system");
}

export interface LogsDashboardData {
  kpis: Record<string, any>;
  logs_over_time: any;
  logs_by_service: any[];
  top_errors: any[];
  active_alerts: any[];
  logs_table: any[];
}

export async function getLogsDashboard(): Promise<LogsDashboardData> {
  return apiFetch<LogsDashboardData>("/admin/logs");
}

export interface PoliciesDashboardData {
  kpis: Record<string, any>;
  policy_list: any[];
  categories_donut: any[];
  status_donut: any[];
  recent_changes: any[];
  effectiveness: Record<string, any>;
  compliance_frameworks: any[];
}

export async function getPoliciesDashboard(): Promise<PoliciesDashboardData> {
  return apiFetch<PoliciesDashboardData>("/admin/policies");
}

export interface UsersDashboardData {
  kpis: Record<string, any>;
  user_list: any[];
  roles_donut: any[];
  departments_donut: any[];
  status_distribution: any[];
  recent_activities: any[];
  mfa_adoption: any;
  access_summary: any[];
  quick_actions: any[];
}

export async function getUsersDashboard(): Promise<UsersDashboardData> {
  return apiFetch<UsersDashboardData>("/admin/users");
}
