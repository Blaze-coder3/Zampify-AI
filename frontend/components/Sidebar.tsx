"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, CheckSquare, Archive, 
  PieChart, BarChart3, Activity, DollarSign, 
  Network, TerminalSquare, Shield, Users,
  ChevronDown, Inbox, FileText, MessageSquare, AlertTriangle, Ban, Send, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  activeFolder?: string;
  activeFilters?: string[];
  onSelectFolder?: (folder: string) => void;
  onToggleFilter?: (filter: string) => void;
  onCompose?: () => void;
  counts?: Record<string, number>;
}

export default function Sidebar({ 
  activeFolder = "VendorInvoices", 
  activeFilters = [], 
  onSelectFolder, 
  onToggleFilter,
  onCompose,
  counts = {}
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const renderSpecialistNav = () => (
    <div className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 px-2 mt-4">AP Specialist</div>
      
      <nav className="space-y-1">
        <Link href="/" className={cn("flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors", pathname === '/' ? "bg-blue-600 text-white font-medium" : "hover:bg-white/5")}>
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4" /> Execution Workspace
          </div>
        </Link>
        <Link href="/reviews" className={cn("flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors", pathname === '/reviews' ? "bg-blue-600 text-white font-medium" : "hover:bg-white/5")}>
          <div className="flex items-center gap-3">
            <CheckSquare className="w-4 h-4" /> My Reviews
          </div>
          <span className="text-xs">{counts['reviews'] || 0}</span>
        </Link>
        <Link href="/archive" className={cn("flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors", pathname === '/archive' ? "bg-blue-600 text-white font-medium" : "hover:bg-white/5")}>
          <div className="flex items-center gap-3">
            <SearchIcon className="w-4 h-4" /> Search & Archive
          </div>
        </Link>
      </nav>
    </div>
  );



  const renderAdminNav = () => (
    <div className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 px-2 mt-6">Admin</div>
      <nav className="space-y-1">
        <Link href="/system" className={cn("flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors", pathname === '/system' ? "bg-blue-600 text-white font-medium" : "hover:bg-white/5")}>
          <div className="flex items-center gap-3"><Network className="w-4 h-4" /> System Graph</div>
        </Link>
        <Link href="/logs" className={cn("flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors", pathname === '/logs' ? "bg-blue-600 text-white font-medium" : "hover:bg-white/5")}>
          <div className="flex items-center gap-3"><TerminalSquare className="w-4 h-4" /> Logs & Monitoring</div>
        </Link>
        <Link href="/admin/policies" className={cn("flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors", pathname === '/admin/policies' ? "bg-blue-600 text-white font-medium" : "hover:bg-white/5")}>
          <div className="flex items-center gap-3"><Shield className="w-4 h-4" /> Policy Center</div>
        </Link>
        <Link href="/admin/users" className={cn("flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors", pathname === '/admin/users' ? "bg-blue-600 text-white font-medium" : "hover:bg-white/5")}>
          <div className="flex items-center gap-3"><Users className="w-4 h-4" /> User Management</div>
        </Link>
      </nav>
    </div>
  );

  return (
    <aside className="w-[260px] bg-[#0a1128] text-gray-300 flex flex-col h-screen overflow-y-auto border-r border-gray-800 shrink-0 hidden md:flex">
      <div className="p-4 flex items-center gap-3 border-b border-gray-800">
        <Image src="/logo.png" alt="Zampify AI Logo" width={32} height={32} className="rounded-lg object-contain" />
        <div>
          <h1 className="text-white font-semibold text-sm">Zampify AI</h1>
          <p className="text-[10px] text-gray-400">Intelligent AP Automation</p>
        </div>
      </div>

      {user.role === 'specialist' && renderSpecialistNav()}
      {user.role === 'admin' && renderAdminNav()}

        {['specialist', 'admin'].includes(user.role) && (
          <>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 px-2 mt-6" title={user.role === 'admin' ? 'Admin Comm Center' : 'Shared AP Team Mailbox'}>
              {user.role === 'specialist' ? 'Communication Center' : 'System Alerts'}
            </div>
            <nav className="space-y-1">
              {(user.role === 'specialist' ? [
                { id: 'Inbox', icon: Inbox, label: 'Inbox' },
                { id: 'VendorInvoices', icon: FileText, label: 'Vendor Invoices' },
                { id: 'VendorQueries', icon: MessageSquare, label: 'Vendor Queries' },
                { id: 'Exceptions', icon: AlertTriangle, label: 'Exceptions', color: 'text-red-400' },
              ] : [
                { id: 'SupportRequests', icon: MessageSquare, label: 'Support Requests' },
                { id: 'SystemAlerts', icon: AlertTriangle, label: 'System Alerts', color: 'text-red-400' },
                { id: 'IncidentReports', icon: FileText, label: 'Incident Reports' },
              ]).map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => onSelectFolder?.(item.id)}
                  className={cn("w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors", activeFolder === item.id ? "bg-white/10 text-white font-medium" : `hover:bg-white/5 ${item.color || ''}`)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" /> {item.label}
                  </div>
                  {counts[item.id] !== undefined && <span className="text-xs opacity-70">{counts[item.id]}</span>}
                </button>
              ))}
            </nav>

            {/* Filters only for Specialist */}
            {(user.role === 'specialist') && (
              <>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 px-2 mt-6 flex justify-between items-center">
                  <span>Filters</span>
                  {(activeFilters.length > 0) && (
                     <button onClick={() => activeFilters.forEach(f => onToggleFilter?.(f))} className="text-blue-400 hover:text-blue-300 text-xs normal-case">Clear Filters</button>
                  )}
                </div>
                <div className="px-3 space-y-2 mt-3">
                   <label className="flex items-center gap-3 text-sm cursor-pointer" onClick={(e) => { e.preventDefault(); onToggleFilter?.('assigned_to_me'); }}>
                      <input type="checkbox" checked={activeFilters.includes('assigned_to_me')} readOnly className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" />
                      <span className={cn(activeFilters.includes('assigned_to_me') ? "text-white font-medium" : "text-gray-400")}>Assigned to Me</span>
                   </label>
                   {[
                     { id: 'urgent', color: 'bg-red-500', label: 'Urgent' },
                     { id: 'due_today', color: 'bg-orange-500', label: 'Due Today' },
                     { id: 'duplicate', color: 'bg-purple-500', label: 'Duplicates' },
                     { id: 'needs_review', color: 'bg-blue-500', label: 'Needs Review' },
                     { id: 'waiting_vendor', color: 'bg-yellow-500', label: 'Waiting on Vendor' },
                   ].map((filter, i) => (
                     <div 
                       key={i} 
                       onClick={() => onToggleFilter?.(filter.id)}
                       className={cn("flex items-center justify-between text-sm pl-7 relative cursor-pointer py-1 rounded transition-colors", activeFilters.includes(filter.id) ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-gray-200")}
                     >
                       <div className={`w-2 h-2 rounded-full absolute left-1 top-2.5 ${filter.color}`} />
                       <span>{filter.label}</span>
                       {counts[filter.id] !== undefined && <span className="text-xs">{counts[filter.id]}</span>}
                     </div>
                   ))}
                </div>
              </>
            )}
          </>
        )}

    </aside>
  );
}

// Temporary internal component so we don't need to add Search icon to the import above, but we probably should. Let's just create a small SVG for search.
function SearchIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}
