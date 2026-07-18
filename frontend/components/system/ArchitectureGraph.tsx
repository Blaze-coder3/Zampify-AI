import { 
  Mail, Users, UploadCloud, Server, LayoutTemplate,
  FileText, Scan, CheckCircle, GitMerge, Settings,
  Database, HardDrive, Zap, Network, TableProperties,
  Bell, FileCode
} from "lucide-react";
import { cn } from "@/lib/utils";

function NodeBlock({ title, items, className }: { title: string, items: any[], className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">{title}</div>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center gap-3 shadow-sm z-10 hover:border-blue-300 hover:shadow-md transition-all">
              <div className={cn("p-1.5 rounded-md", item.colorClass || "bg-blue-50 text-blue-600")}>
                <Icon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">{item.label}</span>
                {item.subtext && <span className="text-[9px] text-slate-500">{item.subtext}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ArchitectureGraph() {
  const sources = [
    { icon: Mail, label: "Email Ingestion", colorClass: "bg-blue-50 text-blue-600" },
    { icon: Users, label: "Vendors", colorClass: "bg-blue-50 text-blue-600" },
    { icon: UploadCloud, label: "Upload API", colorClass: "bg-blue-50 text-blue-600" },
    { icon: LayoutTemplate, label: "External Systems", subtext: "(ERP/PO)", colorClass: "bg-blue-50 text-blue-600" }
  ];

  const gateways = [
    { icon: Server, label: "API Gateway", subtext: "(Kong)", colorClass: "bg-purple-50 text-purple-600" },
    { icon: ShieldCheck, label: "Auth Service", subtext: "(Keycloak)", colorClass: "bg-purple-50 text-purple-600" },
    { icon: Settings, label: "Rate Limiter", colorClass: "bg-purple-50 text-purple-600" }
  ];

  const coreServices = [
    { icon: FileText, label: "Invoice Service", colorClass: "bg-emerald-50 text-emerald-600" },
    { icon: Scan, label: "Extraction Service", colorClass: "bg-emerald-50 text-emerald-600" },
    { icon: CheckCircle, label: "Validation Service", colorClass: "bg-emerald-50 text-emerald-600" },
    { icon: GitMerge, label: "Matching Service", colorClass: "bg-emerald-50 text-emerald-600" },
    { icon: Settings, label: "Workflow Service", colorClass: "bg-emerald-50 text-emerald-600" }
  ];

  const dataLayer = [
    { icon: Database, label: "PostgreSQL", subtext: "(Primary)", colorClass: "bg-slate-100 text-slate-700" },
    { icon: HardDrive, label: "MongoDB", subtext: "(Documents)", colorClass: "bg-emerald-50 text-emerald-600" },
    { icon: Zap, label: "Redis Cache", colorClass: "bg-red-50 text-red-600" },
    { icon: Network, label: "Qdrant Vector DB", subtext: "(Embeddings)", colorClass: "bg-blue-50 text-blue-600" }
  ];

  const integrations = [
    { icon: TableProperties, label: "ERP System", colorClass: "bg-indigo-50 text-indigo-600" },
    { icon: Mail, label: "Email Service", subtext: "(SendGrid)", colorClass: "bg-indigo-50 text-indigo-600" },
    { icon: Bell, label: "Notification Service", colorClass: "bg-indigo-50 text-indigo-600" },
    { icon: FileCode, label: "Audit & Logging", subtext: "(ELK Stack)", colorClass: "bg-indigo-50 text-indigo-600" }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-800">System Architecture Graph</h3>
        <div className="flex items-center gap-2">
           <select className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 text-slate-600 focus:outline-none">
             <option>Layout</option>
           </select>
           <div className="flex items-center border border-slate-200 rounded overflow-hidden">
             <button className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border-r border-slate-200">+</button>
             <button className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600">-</button>
           </div>
        </div>
      </div>
      
      <div className="flex-1 w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50/50 rounded-xl border border-slate-100">
        
        {/* Connection Lines (SVG) - Simplified abstraction of the complex connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '400px' }}>
           <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
              </marker>
           </defs>
           
           {/* Lines from Sources to Gateway */}
           <path d="M 180,100 L 250,100 L 250,160 L 320,160" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           <path d="M 180,170 L 320,170" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           <path d="M 180,240 L 250,240 L 250,180 L 320,180" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           
           {/* Lines from Gateway to Core Services */}
           <path d="M 480,170 L 530,170" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           <path d="M 480,170 L 510,170 L 510,240 L 530,240" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           
           {/* Lines from Core to Data Layer */}
           <path d="M 720,130 L 760,130 L 760,100 L 800,100" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           <path d="M 720,200 L 760,200 L 760,170 L 800,170" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           <path d="M 720,270 L 780,270 L 780,240 L 800,240" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           
           {/* Lines from Data/Core to Integrations */}
           <path d="M 960,100 L 1020,100" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           <path d="M 960,170 L 1020,170" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           <path d="M 960,240 L 1020,240" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
           <path d="M 960,310 L 1020,310" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
        </svg>
        
        {/* Blocks Layout */}
        <div className="flex items-start justify-between w-full max-w-[1100px] z-10 gap-4">
           
           {/* Sources */}
           <div className="w-[180px] bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">
             <NodeBlock title="Sources" items={sources} />
           </div>
           
           {/* API Gateway */}
           <div className="w-[180px] bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative mt-12">
             <NodeBlock title="API Gateway" items={gateways} />
           </div>
           
           {/* Core Services */}
           <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 relative mt-4">
             <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-4 text-center">Core Services</div>
             <div className="grid grid-cols-2 gap-4">
               <NodeBlock title="" items={[coreServices[0], coreServices[2], coreServices[4]]} className="w-[160px]" />
               <NodeBlock title="" items={[coreServices[1], coreServices[3]]} className="w-[160px]" />
             </div>
           </div>
           
           {/* Data Layer */}
           <div className="w-[180px] bg-blue-50/30 p-3 rounded-xl border border-blue-100 relative">
             <NodeBlock title="Data Layer" items={dataLayer} />
           </div>
           
           {/* Integrations */}
           <div className="w-[180px] bg-indigo-50/30 p-3 rounded-xl border border-indigo-100 relative">
             <NodeBlock title="Integrations" items={integrations} />
           </div>
           
        </div>
      </div>
    </div>
  );
}

// Quick component for the Shield check
function ShieldCheck(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
