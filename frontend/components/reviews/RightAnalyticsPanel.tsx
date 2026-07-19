import { AnalyticsSummary } from "@/lib/api";

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-4 last:mb-0">
      <h3 className="text-sm font-bold text-slate-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// Simple SVG Donut Chart
function ReviewSummaryDonut({ data }: { data: Record<string, number> }) {
  const needsReview = data?.["needs_review"] || 0;
  const dueToday = data?.["due_today"] || 0;
  const overdue = data?.["overdue"] || 0;
  const escalated = data?.["escalated"] || 0;
  
  const actualTotal = needsReview + dueToday + overdue + escalated;
  const total = actualTotal || 1;
  
  // Circumference = 2 * pi * r = 2 * 3.14159 * 40 = 251.3
  const c = 251.3;
  
  const p1 = (needsReview / total) * c;
  const p2 = (dueToday / total) * c;
  const p3 = (overdue / total) * c;
  const p4 = (escalated / total) * c;
  
  const offset2 = c - p1;
  const offset3 = offset2 - p2;
  const offset4 = offset3 - p3;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {/* Needs Review - Orange */}
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray={`${p1} ${c}`} />
            {/* Due Today - Red/Pink */}
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12" strokeDasharray={`${p2} ${c}`} strokeDashoffset={offset2} />
            {/* Overdue - Yellow */}
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eab308" strokeWidth="12" strokeDasharray={`${p3} ${c}`} strokeDashoffset={offset3} />
            {/* Escalated - Purple */}
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="12" strokeDasharray={`${p4} ${c}`} strokeDashoffset={offset4} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center bg-white m-3 rounded-full shadow-inner">
            <span className="text-sm font-bold text-slate-700">{actualTotal}</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-slate-600">Needs Review</span></div>
            <span className="font-medium text-slate-800">{needsReview} ({Math.round(needsReview/total*100)}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-slate-600">Due Today</span></div>
            <span className="font-medium text-slate-800">{dueToday} ({Math.round(dueToday/total*100)}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className="text-slate-600">Overdue</span></div>
            <span className="font-medium text-slate-800">{overdue} ({Math.round(overdue/total*100)}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span className="text-slate-600">Escalated</span></div>
            <span className="font-medium text-slate-800">{escalated} ({Math.round(escalated/total*100)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskDistributionBar({ data }: { data: { high: number, medium: number, low: number } }) {
  const h = data?.high || 0;
  const m = data?.medium || 0;
  const l = data?.low || 0;
  const max = Math.max(h, m, l, 1);
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 w-20 shrink-0">High Risk</span>
        <div className="flex-1 mx-3 bg-slate-100 rounded-full h-2">
          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(h/max)*100}%` }}></div>
        </div>
        <span className="font-bold text-slate-800 w-4 text-right">{h}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 w-20 shrink-0">Medium Risk</span>
        <div className="flex-1 mx-3 bg-slate-100 rounded-full h-2">
          <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${(m/max)*100}%` }}></div>
        </div>
        <span className="font-bold text-slate-800 w-4 text-right">{m}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 w-20 shrink-0">Low Risk</span>
        <div className="flex-1 mx-3 bg-slate-100 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(l/max)*100}%` }}></div>
        </div>
        <span className="font-bold text-slate-800 w-4 text-right">{l}</span>
      </div>
    </div>
  );
}

function SLALineChart({ data }: { data: { date: string, value: number }[] }) {
  // Simple CSS/SVG combo line chart
  const points = data?.length > 0 ? data : [
    { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }
  ];
  
  const width = 240;
  const height = 60;
  const min = 80;
  const max = 100;
  const range = max - min;
  
  const dx = width / (points.length - 1);
  const pathData = points.map((p, i) => {
    const x = i * dx;
    const y = height - ((p.value - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>100%</span>
        <span>80%</span>
        <span>60%</span>
        <span>40%</span>
        <span>20%</span>
        <span>0%</span>
      </div>
      <div className="relative h-16 w-full mt-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => {
            const x = i * dx;
            const y = height - ((p.value - min) / range) * height;
            return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" className="ring-2 ring-white" />;
          })}
        </svg>
      </div>
      <div className="flex justify-between text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
        <span>15 May</span>
        <span>16 May</span>
        <span>17 May</span>
        <span>18 May</span>
        <span>19 May</span>
        <span>20 May</span>
        <span>21 May</span>
      </div>
    </div>
  );
}

function TopVendors({ data }: { data: any[] }) {
  const vendors = data?.length > 0 ? data : [];

  return (
    <div className="flex flex-col gap-3">
      {vendors.map((v, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <span className="text-slate-700 truncate w-32">{v.vendor_name}</span>
          <span className="text-slate-500 font-medium">${v.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-slate-400">({v.count})</span></span>
        </div>
      ))}
      <a href="#" className="text-xs font-semibold text-blue-600 mt-2 text-center hover:underline">View all vendors</a>
    </div>
  );
}

export default function RightAnalyticsPanel({ analytics }: { analytics: AnalyticsSummary | null }) {
  return (
    <div className="flex flex-col">
      <Section title="Review Summary">
        <ReviewSummaryDonut data={analytics?.status_distribution || {}} />
      </Section>
      
      <Section title="Risk Distribution">
        <RiskDistributionBar data={analytics?.risk_distribution || { high: 0, medium: 0, low: 0 }} />
      </Section>

      <Section title="SLA Compliance">
        <SLALineChart data={analytics?.sla_compliance || []} />
      </Section>

      <Section title="Top Vendors">
        <TopVendors data={analytics?.top_vendors || []} />
      </Section>
    </div>
  );
}
