import { AnalyticsSummary } from "@/lib/api";
import { ClipboardList, Ribbon, CalendarClock, Clock, CheckCircle2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: any;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
  sublabel: string;
}

function StatCard({ icon: Icon, iconBg, iconColor, value, label, sublabel }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
      <div className={cn("p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 duration-300", iconBg, iconColor)}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800 leading-none">{value}</div>
        <div className="text-sm font-medium text-slate-700 mt-1">{label}</div>
        <div className="text-xs text-slate-500">{sublabel}</div>
      </div>
      
      {/* Decorative gradient blur in background */}
      <div className={cn("absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40", iconBg)}></div>
    </div>
  );
}

export default function StatCards({ analytics }: { analytics: AnalyticsSummary | null }) {
  // Extract values from analytics, or default to mockup values if not loaded
  const needsReview = analytics?.status_distribution?.["needs_review"] || 8;
  const dueToday = analytics?.status_distribution?.["due_today"] || 3;
  const overdue = analytics?.status_distribution?.["overdue"] || 6;
  const slaCompliance = "92%"; // Ideally calculate from analytics.sla_compliance
  const avgReviewTime = "2.4 hrs";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard 
        icon={ClipboardList} 
        iconBg="bg-blue-100" 
        iconColor="text-blue-600"
        value={14} 
        label="Assigned to Me" 
        sublabel="Invoices" 
      />
      
      <StatCard 
        icon={Ribbon} 
        iconBg="bg-red-100" 
        iconColor="text-red-500"
        value={needsReview} 
        label="Needs Review" 
        sublabel="High Risk" 
      />
      
      <StatCard 
        icon={CalendarClock} 
        iconBg="bg-amber-100" 
        iconColor="text-amber-500"
        value={dueToday} 
        label="Due Today" 
        sublabel="Urgent" 
      />
      
      <StatCard 
        icon={Clock} 
        iconBg="bg-red-50" 
        iconColor="text-red-500"
        value={overdue} 
        label="Overdue" 
        sublabel="Past Due Date" 
      />
      
      <StatCard 
        icon={CheckCircle2} 
        iconBg="bg-emerald-100" 
        iconColor="text-emerald-500"
        value={slaCompliance} 
        label="SLA Compliance" 
        sublabel="This Month" 
      />
      
      <StatCard 
        icon={Timer} 
        iconBg="bg-purple-100" 
        iconColor="text-purple-600"
        value={avgReviewTime} 
        label="Avg. Review Time" 
        sublabel="This Month" 
      />
    </div>
  );
}
