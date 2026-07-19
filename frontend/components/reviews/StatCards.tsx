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
  id: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

function StatCard({ icon: Icon, iconBg, iconColor, value, label, sublabel, id, isActive, onClick }: StatCardProps) {
  return (
    <div 
      onClick={() => onClick(id)}
      className={cn(
        "bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer",
        isActive ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"
      )}
    >
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

export default function StatCards({ 
  analytics, 
  activeTab, 
  onSelectTab 
}: { 
  analytics: AnalyticsSummary | null,
  activeTab: string,
  onSelectTab: (tab: string) => void 
}) {
  // Extract values from analytics, or default to mockup values if not loaded
  const needsReview = analytics?.status_distribution?.["needs_review"] ?? 0;
  const dueToday = analytics?.status_distribution?.["due_today"] ?? 0;
  const overdue = analytics?.status_distribution?.["overdue"] ?? 0;
  const slaCompliance = "100%"; // Ideally calculate from analytics.sla_compliance
  const avgReviewTime = "0 hrs";

  const assignedToMe = needsReview + dueToday + overdue + (analytics?.status_distribution?.["escalated"] ?? 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard 
        icon={ClipboardList} 
        iconBg="bg-blue-100" 
        iconColor="text-blue-600"
        value={assignedToMe} 
        label="Assigned to Me" 
        sublabel="Invoices" 
        id="All Reviews"
        isActive={activeTab === "All Reviews"}
        onClick={onSelectTab}
      />
      
      <StatCard 
        icon={Ribbon} 
        iconBg="bg-red-100" 
        iconColor="text-red-500"
        value={needsReview} 
        label="Needs Review" 
        sublabel="High Risk" 
        id="Needs Review"
        isActive={activeTab === "Needs Review"}
        onClick={onSelectTab}
      />
      
      <StatCard 
        icon={CalendarClock} 
        iconBg="bg-amber-100" 
        iconColor="text-amber-600"
        value={dueToday} 
        label="Due Today" 
        sublabel="Urgent" 
        id="Due Today"
        isActive={activeTab === "Due Today"}
        onClick={onSelectTab}
      />
      
      <StatCard 
        icon={Clock} 
        iconBg="bg-slate-100" 
        iconColor="text-slate-600"
        value={overdue} 
        label="Overdue" 
        sublabel="Past Due Date" 
        id="Overdue"
        isActive={activeTab === "Overdue"}
        onClick={onSelectTab}
      />
      
      <StatCard 
        icon={CheckCircle2} 
        iconBg="bg-emerald-100" 
        iconColor="text-emerald-600"
        value={slaCompliance} 
        label="SLA Compliance" 
        sublabel="This Month" 
        id="Completed"
        isActive={activeTab === "Completed"}
        onClick={onSelectTab}
      />
      
      <StatCard 
        icon={Timer} 
        iconBg="bg-purple-100" 
        iconColor="text-purple-600"
        value={avgReviewTime} 
        label="Avg. Review Time" 
        sublabel="This Month" 
        id="AvgTime"
        isActive={false} // Placeholder
        onClick={() => {}}
      />
    </div>
  );
}
