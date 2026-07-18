import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Search, Inbox, FileText, MessageSquare, AlertTriangle, 
  Ban, Send, Archive, Bell, HelpCircle, Settings, ChevronRight, CheckCircle2,
  Clock, AlertCircle, RefreshCw, Play, Filter, ArrowUpDown, ChevronLeft, 
  MoreHorizontal, ChevronDown, CheckSquare
} from 'lucide-react';

// Simulated cn utility (clsx + tailwind-merge) for clean component definitions
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// --- UI Components ---
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'link' | 'soft', size?: 'default' | 'sm' | 'lg' | 'icon' }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
      outline: "border border-gray-200 bg-white hover:bg-gray-100 text-gray-900",
      ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-600",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      link: "text-blue-600 underline-offset-4 hover:underline",
      soft: "bg-blue-50 text-blue-700 hover:bg-blue-100"
    };
    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9"
    };
    return (
      <button ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)} {...props} />
    )
  }
);
Button.displayName = "Button";

const Avatar = ({ src, fallback, className }: { src?: string, fallback: string, className?: string }) => (
  <div className={cn("relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-100", className)}>
    {src ? <img src={src} alt="Avatar" className="aspect-square h-full w-full object-cover" /> : 
           <span className="flex h-full w-full items-center justify-center font-medium text-gray-500 text-xs">{fallback}</span>}
  </div>
);

const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default'|'success'|'warning'|'danger'|'outline', className?: string }) => {
  const variants = {
    default: "bg-gray-100 text-gray-900",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    outline: "text-gray-950 border border-gray-200"
  };
  return (
    <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)}>
      {children}
    </div>
  )
};

const ProgressBar = ({ value, colorClass, className }: { value: number, colorClass: string, className?: string }) => (
  <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-gray-100", className)}>
    <div className={cn("h-full transition-all", colorClass)} style={{ width: `${value}%` }} />
  </div>
);

// --- Mock Data ---
const tableData = [
  { id: 'INV-10421', vendor: 'Dell Technologies', status: 'Approve', statusText: 'All validation checks passed.', confidence: 98, sla: '2h 15m', slaColor: 'text-red-600 font-medium', priority: 'High', assignee: 'Priya Sharma' },
  { id: 'INV-10420', vendor: 'Accenture', status: 'Review', statusText: 'PO amount mismatch.', confidence: 92, sla: '3h 40m', slaColor: 'text-orange-500 font-medium', priority: 'High', assignee: 'Rohit Mehra' },
  { id: 'INV-10419', vendor: 'Wipro Limited', status: 'Waiting Vendor', statusText: 'Need updated PO.', confidence: null, sla: '5h 20m', slaColor: 'text-green-600', priority: 'Medium', assignee: 'Anita Verma' },
  { id: 'INV-10418', vendor: 'Tech Mahindra', status: 'Review', statusText: 'GRN not found.', confidence: 91, sla: '1h 50m', slaColor: 'text-red-600 font-medium', priority: 'High', assignee: 'Priya Sharma' },
  { id: 'INV-10417', vendor: 'Cisco Systems', status: 'Approve', statusText: '3-way match successful.', confidence: 87, sla: '8h 30m', slaColor: 'text-green-600', priority: 'Medium', assignee: 'Rohit Mehra' },
  { id: 'INV-10416', vendor: 'Infosys Limited', status: 'Waiting Vendor', statusText: 'Tax details missing.', confidence: null, sla: '1d 2h', slaColor: 'text-green-600', priority: 'Low', assignee: 'Anita Verma' },
];

const activityFeed = [
  { time: '10:32 AM', title: 'Approved INV-10411', sub: 'By Priya Sharma', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
  { time: '10:15 AM', title: 'Vendor replied to INV-10420', sub: 'Accenture Support', icon: <MessageSquare className="w-4 h-4 text-purple-500" /> },
  { time: '09:58 AM', title: 'Duplicate detected in INV-10409', sub: 'System', icon: <AlertCircle className="w-4 h-4 text-amber-500" /> },
  { time: '09:34 AM', title: 'Price variance cleared for INV-10407', sub: 'By Rohit Mehra', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
];

const notifications = [
  { text: 'Vendor replied', sub: 'Accenture replied to INV-10420', time: '2m ago', type: 'red' },
  { text: 'Invoice approved', sub: 'INV-10413 has been approved', time: '15m ago', type: 'green' },
  { text: 'PO updated', sub: 'Updated PO linked to INV-10418', time: '32m ago', type: 'purple' },
];

// --- Simulated React Query ---
const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return { isLoading, data: { tableData, activityFeed, notifications } };
};

// --- Sub-components ---
const Sidebar = () => (
  <aside className="w-64 bg-[#0a1128] text-gray-300 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto border-r border-gray-800 shrink-0 hidden md:flex">
    <div className="p-4 flex items-center gap-3 border-b border-gray-800">
      <div className="bg-blue-600 rounded-lg w-8 h-8 flex items-center justify-center text-white font-bold text-xl leading-none">Z</div>
      <div>
        <h1 className="text-white font-semibold text-sm">Zampify AI</h1>
        <p className="text-[10px] text-gray-400">Intelligent AP Automation</p>
      </div>
      <button className="ml-auto text-gray-400 hover:text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
    </div>

    <div className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 px-2 mt-4">AP Specialist</div>
      
      <nav className="space-y-1">
        <a href="#" className="flex items-center justify-between px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4" /> Execution Workspace
          </div>
        </a>
        <a href="#" className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-md text-sm transition-colors">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-4 h-4" /> My Reviews
          </div>
          <span className="text-xs">24</span>
        </a>
        <a href="#" className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-md text-sm transition-colors">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4" /> Search & Archive
          </div>
        </a>
      </nav>

      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 px-2 mt-6">Communication Center</div>
      <nav className="space-y-1">
        {[
          { icon: Inbox, label: 'Inbox', count: '128' },
          { icon: FileText, label: 'Vendor Invoices', count: '87' },
          { icon: MessageSquare, label: 'Vendor Queries', count: '15' },
          { icon: AlertTriangle, label: 'Exceptions', count: '14', color: 'text-red-400' },
          { icon: Ban, label: 'Spam', count: '12' },
          { icon: Send, label: 'Sent', count: '36' },
          { icon: Archive, label: 'Archived', count: '210' },
        ].map((item, i) => (
          <a key={i} href="#" className={`flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-md text-sm transition-colors ${item.color || ''}`}>
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" /> {item.label}
            </div>
            {item.count && <span className="text-xs opacity-70">{item.count}</span>}
          </a>
        ))}
      </nav>

      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 px-2 mt-6 flex justify-between items-center">
        <span>Filters</span>
        <button className="text-blue-400 hover:text-blue-300 text-xs normal-case">Clear Filters</button>
      </div>
      <div className="px-3 space-y-2 mt-3">
         <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" />
            <span className="text-white">Assigned to Me</span>
         </label>
         {[
           { color: 'bg-red-500', label: 'Urgent', count: '5' },
           { color: 'bg-orange-500', label: 'Due Today', count: '14' },
           { color: 'bg-purple-500', label: 'Duplicates', count: '3' },
           { color: 'bg-blue-500', label: 'Needs Review', count: '14' },
           { color: 'bg-yellow-500', label: 'Waiting on Vendor', count: '6' },
         ].map((filter, i) => (
           <div key={i} className="flex items-center justify-between text-sm pl-7 relative">
             <div className={`w-2 h-2 rounded-full absolute left-1 top-1.5 ${filter.color}`} />
             <span className="text-gray-400">{filter.label}</span>
             <span className="text-xs">{filter.count}</span>
           </div>
         ))}
      </div>
    </div>

    {/* Story Points Widget */}
    <div className="mt-auto p-4 m-4 bg-[#111936] rounded-xl border border-gray-800 relative overflow-hidden">
      <div className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wider">Story Points</div>
      <div className="flex justify-center relative my-2">
        {/* Simple CSS SVG Donut */}
        <svg viewBox="0 0 36 36" className="w-24 h-24">
          <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="100, 100" />
          <path className="text-emerald-400" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="90, 100" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">18</span>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 mb-2">Total Points Today</div>
      <div className="flex justify-between items-center text-[10px] mt-4">
        <span>Daily Target: 20</span>
        <span>90%</span>
      </div>
      <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
         <div className="bg-emerald-400 h-full w-[90%] rounded-full"></div>
      </div>
    </div>
  </aside>
);

const TopNav = () => (
  <header className="h-16 bg-[#0a1128] border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10 w-full ml-0 md:ml-64 transition-all" style={{ width: 'calc(100% - 16rem)' }}>
    <div className="flex items-center w-full max-w-2xl">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search invoices, vendors, PO, cases..." 
          className="w-full bg-[#111936] border border-gray-700 text-gray-300 text-sm rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
    
    <div className="flex items-center gap-4 ml-4">
      <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0a1128]"></span>
      </button>
      <button className="p-2 text-gray-400 hover:text-white transition-colors">
        <HelpCircle className="w-5 h-5" />
      </button>
      <button className="p-2 text-gray-400 hover:text-white transition-colors">
        <Settings className="w-5 h-5" />
      </button>
      
      <div className="h-8 w-px bg-gray-700 mx-2"></div>
      
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-white">Priya Sharma</div>
          <div className="text-xs text-gray-400">AP Specialist</div>
        </div>
        <Avatar fallback="PS" src="https://i.pravatar.cc/150?u=priya" className="w-9 h-9 border border-gray-700" />
      </div>
    </div>
  </header>
);

const DashboardHeader = () => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        Good morning, Priya! <span className="text-2xl">👋</span>
      </h1>
      <p className="text-gray-500 mt-1">Let's clear your queue and keep AP running smoothly.</p>
    </div>
    
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-r border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded text-blue-600"><FileText className="w-4 h-4"/></div>
          <div>
            <div className="font-semibold text-gray-900 leading-none">24</div>
            <div className="text-xs text-gray-500 mt-0.5">Invoices assigned<br/>today</div>
          </div>
        </div>
        <div className="px-4 py-2 border-r border-gray-200 flex items-center gap-3 bg-red-50/30">
          <div className="p-2 bg-red-50 rounded text-red-600"><AlertTriangle className="w-4 h-4"/></div>
          <div>
            <div className="font-semibold text-gray-900 leading-none">8</div>
            <div className="text-xs text-gray-500 mt-0.5">Require immediate<br/>attention</div>
          </div>
        </div>
        <div className="px-4 py-2 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded text-green-600"><Clock className="w-4 h-4"/></div>
          <div>
            <div className="font-semibold text-gray-900 leading-none">3h 12m</div>
            <div className="text-xs text-gray-500 mt-0.5">Avg. SLA remaining<br/>today</div>
          </div>
        </div>
      </div>
      
      <Button variant="outline" className="gap-2 bg-white"><RefreshCw className="w-4 h-4" /> Refresh Queue</Button>
      <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"><Play className="w-4 h-4" /> Start Processing</Button>
    </div>
  </div>
);

const PriorityCardsRow = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
    <Card className="border-blue-200 bg-blue-50/30 shadow-none">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-blue-900 text-sm">Needs Review</span>
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md"><Inbox className="w-4 h-4" /></div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">14</div>
          <div className="text-xs text-gray-500 mt-1 mb-4">Invoices need your review</div>
          <Button variant="outline" size="sm" className="w-full text-blue-700 border-blue-200 hover:bg-blue-100 bg-white">Review Now <ChevronRight className="w-3 h-3 ml-2"/></Button>
        </div>
      </CardContent>
    </Card>

    <Card className="border-red-200 bg-red-50/30 shadow-none">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-red-900 text-sm">Waiting on Vendor</span>
          <div className="p-1.5 bg-red-100 text-red-600 rounded-md"><MessageSquare className="w-4 h-4" /></div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">6</div>
          <div className="text-xs text-gray-500 mt-1 mb-4">Awaiting vendor response</div>
          <Button variant="outline" size="sm" className="w-full text-red-700 border-red-200 hover:bg-red-100 bg-white">View Replies <ChevronRight className="w-3 h-3 ml-2"/></Button>
        </div>
      </CardContent>
    </Card>

    <Card className="border-amber-200 bg-amber-50/30 shadow-none">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-amber-900 text-sm">Due Within 2 Hours</span>
          <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md"><AlertTriangle className="w-4 h-4" /></div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">5</div>
          <div className="text-xs text-gray-500 mt-1 mb-4">SLA at risk</div>
          <Button variant="outline" size="sm" className="w-full text-amber-700 border-amber-200 hover:bg-amber-100 bg-white">Prioritize <ChevronRight className="w-3 h-3 ml-2"/></Button>
        </div>
      </CardContent>
    </Card>

    <Card className="border-purple-200 bg-purple-50/30 shadow-none">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-purple-900 text-sm">Duplicates Detected</span>
          <div className="p-1.5 bg-purple-100 text-purple-600 rounded-md"><Search className="w-4 h-4" /></div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">3</div>
          <div className="text-xs text-gray-500 mt-1 mb-4">Potential duplicates</div>
          <Button variant="outline" size="sm" className="w-full text-purple-700 border-purple-200 hover:bg-purple-100 bg-white">Investigate <ChevronRight className="w-3 h-3 ml-2"/></Button>
        </div>
      </CardContent>
    </Card>

    <Card className="border-emerald-200 bg-emerald-50/30 shadow-none">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-emerald-900 text-sm">Ready to Approve</span>
          <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md"><CheckCircle2 className="w-4 h-4" /></div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">18</div>
          <div className="text-xs text-gray-500 mt-1 mb-4">Ready for your approval</div>
          <Button variant="outline" size="sm" className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-100 bg-white">Approve Queue <ChevronRight className="w-3 h-3 ml-2"/></Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const WorkQueueTable = ({ data }: { data: typeof tableData }) => (
  <Card className="flex-1 overflow-hidden flex flex-col shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-2">
        <CardTitle className="text-base font-bold text-gray-900">Smart Work Queue</CardTitle>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">(81)</span>
        <HelpCircle className="w-4 h-4 text-gray-400 ml-1" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center text-sm text-gray-600 gap-2 cursor-pointer mr-2">
          View: <span className="font-semibold text-blue-600">Smart (Recommended)</span> <ChevronDown className="w-4 h-4" />
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-8"><Filter className="w-3.5 h-3.5" /> Filter</Button>
        <Button variant="outline" size="sm" className="gap-2 h-8"><ArrowUpDown className="w-3.5 h-3.5" /> Sort</Button>
      </div>
    </CardHeader>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-medium border-b border-gray-200">
          <tr>
            <th className="px-5 py-3 w-12"><input type="checkbox" className="rounded border-gray-300" /></th>
            <th className="px-5 py-3">Invoice ID</th>
            <th className="px-5 py-3">Vendor</th>
            <th className="px-5 py-3">AI Recommendation</th>
            <th className="px-5 py-3">Confidence</th>
            <th className="px-5 py-3">SLA Remaining</th>
            <th className="px-5 py-3">Priority</th>
            <th className="px-5 py-3">Assigned To</th>
            <th className="px-5 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-5 py-4"><input type="checkbox" className="rounded border-gray-300" /></td>
              <td className="px-5 py-4 font-medium text-blue-600 cursor-pointer hover:underline">{row.id}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200 overflow-hidden">
                    {row.vendor.charAt(0)}
                  </div>
                  <span className="text-gray-900 font-medium">{row.vendor}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-col">
                  <span className={cn("flex items-center gap-1.5 font-medium", 
                    row.status === 'Approve' ? 'text-emerald-600' : 
                    row.status === 'Review' ? 'text-amber-600' : 'text-purple-600'
                  )}>
                    {row.status === 'Approve' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {row.status === 'Review' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {row.status === 'Waiting Vendor' && <Clock className="w-3.5 h-3.5" />}
                    {row.status}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">{row.statusText}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                {row.confidence ? (
                  <div className="flex flex-col gap-1 w-24">
                    <span className="text-xs font-semibold text-gray-700">{row.confidence}%</span>
                    <ProgressBar 
                      value={row.confidence} 
                      colorClass={row.confidence > 95 ? 'bg-emerald-500' : row.confidence > 90 ? 'bg-amber-400' : 'bg-orange-500'} 
                    />
                  </div>
                ) : <span className="text-gray-400">-</span>}
              </td>
              <td className="px-5 py-4">
                <span className={cn("text-sm", row.slaColor)}>{row.sla}</span>
              </td>
              <td className="px-5 py-4">
                <Badge variant={row.priority === 'High' ? 'danger' : row.priority === 'Medium' ? 'warning' : 'outline'}>
                  {row.priority}
                </Badge>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <Avatar fallback={row.assignee.split(' ').map(n=>n[0]).join('')} className="w-6 h-6 text-[10px]" />
                  <span className="text-gray-700 text-sm">{row.assignee}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    <div className="border-t border-gray-100 p-4 flex items-center justify-between bg-white mt-auto">
      <div className="text-sm text-gray-500">
        Showing 1 to 6 of 81 invoices
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="w-8 h-8 rounded-md" disabled><ChevronLeft className="w-4 h-4"/></Button>
        <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-md border-blue-600 bg-blue-50 text-blue-600">1</Button>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-md">2</Button>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-md">3</Button>
        <span className="px-2 text-gray-400">...</span>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-md">14</Button>
        <Button variant="outline" size="icon" className="w-8 h-8 rounded-md"><ChevronRight className="w-4 h-4"/></Button>
      </div>
      <div className="text-sm text-gray-500">6 / page</div>
    </div>
  </Card>
);

const RightPanel = ({ notifications }: { notifications: any[] }) => (
  <div className="w-full lg:w-72 flex flex-col gap-6 shrink-0">
    
    {/* AI Copilot Widget */}
    <Card className="bg-gradient-to-b from-purple-50/50 to-white border-purple-100 overflow-hidden">
      <CardHeader className="py-4 border-b border-purple-100/50 flex flex-row items-center gap-2">
         <div className="bg-purple-100 p-1.5 rounded-md text-purple-600"><AlertTriangle className="w-4 h-4" /></div>
         <CardTitle className="text-base text-purple-950 font-bold">AI Copilot</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Today's Summary</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 14 invoices need review</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> 6 waiting on vendor response</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> 5 SLA at risk</li>
          </ul>
          <Button variant="outline" className="w-full mt-4 bg-white text-blue-600 border-blue-200 hover:bg-blue-50 h-8">View Full Summary <ChevronRight className="w-3 h-3 ml-2"/></Button>
        </div>

        <div className="border-t border-purple-100 pt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Suggested Next Case</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                <FileText className="w-3 h-3" />
              </div>
              <div>
                <div className="font-semibold text-blue-600 text-sm leading-tight">INV-10421</div>
                <div className="text-xs text-gray-500">Dell Technologies</div>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <Badge variant="danger" className="text-[10px] py-0">High SLA Risk</Badge>
            </div>
            <div className="text-xs text-gray-600 mb-3 flex justify-between items-center">
              SLA Remaining: <span className="font-bold text-red-600">2h 15m</span>
            </div>
            <Button className="w-full h-8 shadow-sm">Open Next Case</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Recent Notifications Widget */}
    <Card>
      <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {notifications.map((notif, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 flex gap-3 items-start transition-colors cursor-pointer">
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
          ))}
        </div>
        <div className="p-3 border-t border-gray-100 text-center">
          <Button variant="link" className="text-xs">View all notifications <ChevronRight className="w-3 h-3 ml-1"/></Button>
        </div>
      </CardContent>
    </Card>

  </div>
);

const BottomWidgets = ({ activityFeed }: { activityFeed: any[] }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pb-12">
    
    {/* Today's Pipeline */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Today's Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center py-4 relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
          
          {[
            { label: 'Received', count: 132, icon: <FileText className="w-4 h-4 text-blue-500"/>, color: 'border-blue-200 bg-blue-50' },
            { label: 'In Processing', count: 28, icon: <RefreshCw className="w-4 h-4 text-purple-500"/>, color: 'border-purple-200 bg-purple-50' },
            { label: 'Needs Review', count: 14, icon: <AlertTriangle className="w-4 h-4 text-red-500"/>, color: 'border-red-200 bg-red-50' },
            { label: 'Approved', count: 72, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500"/>, color: 'border-emerald-200 bg-emerald-50' },
            { label: 'Paid', count: 18, icon: <CheckCircle2 className="w-4 h-4 text-gray-400"/>, color: 'border-gray-200 bg-gray-50' },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2 bg-white">
              <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center z-10", step.color)}>
                {step.icon}
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-0.5">{step.label}</div>
                <div className="font-bold text-gray-900">{step.count}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right mt-2">
           <Button variant="link" className="text-xs p-0 h-auto">View pipeline details <ChevronRight className="w-3 h-3 ml-1"/></Button>
        </div>
      </CardContent>
    </Card>

    {/* Activity Feed */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {activityFeed.map((item, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="mt-0.5 bg-gray-50 rounded-full p-1 border border-gray-100">{item.icon}</div>
              <div>
                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-500 flex gap-2">
                  <span>{item.sub}</span>
                  <span className="text-gray-300">•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right mt-4">
           <Button variant="link" className="text-xs p-0 h-auto">View all activity <ChevronRight className="w-3 h-3 ml-1"/></Button>
        </div>
      </CardContent>
    </Card>

    {/* My Performance */}
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">My Performance (Today)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center h-full">
        <div className="flex items-center justify-between">
          <div className="relative w-32 h-32">
            {/* Multi-segment donut chart simulation using SVG */}
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {/* Background */}
              <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f3f4f6" strokeWidth="4" />
              {/* Segments (Simulated data percentages) */}
              <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="60 100" strokeDashoffset="0" />
              <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-60" />
              <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-85" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 leading-none">18</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Points Earned</span>
            </div>
            <div className="text-center text-[10px] text-gray-500 mt-2 absolute -bottom-6 w-full">Target: 20 points</div>
          </div>
          
          <div className="space-y-3 pl-4">
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-gray-600">Approved</span></div>
              <span className="font-semibold">12 pts</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-gray-600">Reviewed</span></div>
              <span className="font-semibold">4 pts</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-gray-600">Queries Handled</span></div>
              <span className="font-semibold">2 pts</span>
            </div>
          </div>
        </div>
        <div className="text-right mt-6">
           <Button variant="link" className="text-xs p-0 h-auto">View leaderboard <ChevronRight className="w-3 h-3 ml-1"/></Button>
        </div>
      </CardContent>
    </Card>

  </div>
);

export default function DashboardApp() {
  const { data, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <TopNav />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            <DashboardHeader />
            <PriorityCardsRow />
            
            <div className="flex flex-col lg:flex-row gap-6">
              <WorkQueueTable data={data.tableData} />
              <RightPanel notifications={data.notifications} />
            </div>

            <BottomWidgets activityFeed={data.activityFeed} />
          </div>
        </main>
      </div>
    </div>
  );
}