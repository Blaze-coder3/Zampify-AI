import { 
  ChevronDown, Inbox, FileText, MessageSquare, 
  AlertTriangle, Ban, Send, Archive 
} from "lucide-react";

export default function CommunicationCenter() {
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto shrink-0 hidden md:flex">
      <div className="p-4 border-b border-slate-100">
        <div className="font-semibold text-sm mb-4 text-slate-800">Communication Center</div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md flex items-center justify-center shadow-sm mb-4 transition-colors">
          Compose <ChevronDown size={16} className="ml-2" />
        </button>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-2 bg-blue-50 text-blue-700 rounded-md cursor-pointer">
            <div className="flex items-center text-sm"><Inbox size={16} className="mr-3" /> Inbox</div>
            <span className="text-xs font-semibold bg-blue-200 px-2 py-0.5 rounded-full">128</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
            <div className="flex items-center text-sm"><FileText size={16} className="mr-3" /> Vendor Invoices</div>
            <span className="text-xs text-slate-400">87</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
            <div className="flex items-center text-sm"><MessageSquare size={16} className="mr-3" /> Vendor Queries</div>
            <span className="text-xs text-slate-400">15</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-red-600 hover:bg-red-50 rounded-md cursor-pointer font-medium transition-colors">
            <div className="flex items-center text-sm"><AlertTriangle size={16} className="mr-3" /> Exceptions</div>
            <span className="text-xs font-semibold bg-red-100 px-2 py-0.5 rounded-full">14</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
            <div className="flex items-center text-sm"><Ban size={16} className="mr-3" /> Spam</div>
            <span className="text-xs text-slate-400">12</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
            <div className="flex items-center text-sm"><Send size={16} className="mr-3" /> Sent</div>
            <span className="text-xs text-slate-400">36</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
            <div className="flex items-center text-sm"><Archive size={16} className="mr-3" /> Archived</div>
            <span className="text-xs text-slate-400">210</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <div className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">Filters</div>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded border-slate-300" defaultChecked />
            <span className="text-sm text-slate-700">Assigned to Me</span>
          </label>
          
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Urgent</div>
              <span className="text-xs text-red-500 bg-red-50 px-2 rounded-full">5</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span> Due Today</div>
              <span className="text-xs text-amber-500 bg-amber-50 px-2 rounded-full">14</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-300 mr-2"></span> Duplicates</div>
              <span className="text-xs text-slate-500">3</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Needs Review</div>
              <span className="text-xs text-slate-500">14</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span> Waiting on Vendor</div>
              <span className="text-xs text-amber-500 bg-amber-50 px-2 rounded-full">6</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-right">
          <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">Clear Filters</button>
        </div>
      </div>
    </div>
  );
}
