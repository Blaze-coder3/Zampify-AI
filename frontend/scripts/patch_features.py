import os
import re

file_path = r"C:\Users\A Syed Khwaja\OneDrive\Desktop\Zampify-AI\frontend\components\workspace\SmartWorkQueue.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Imports
content = content.replace(
    'import { InvoiceSummary, CommunicationCase, bulkApproveInvoices, bulkAssignInvoices } from "@/lib/api";',
    'import { InvoiceSummary, CommunicationCase, bulkApproveInvoices, bulkAssignInvoices, bulkTagInvoices } from "@/lib/api";'
)
content = content.replace(
    'import { RefreshCcw, Filter, ArrowUpDown, CheckCircle2, AlertTriangle, FileText, Bot, Clock, ChevronRight, ArrowUp, ArrowRight, ArrowDown, Mail, AlertCircle, Search, User, HelpCircle, ChevronDown, ChevronLeft } from "lucide-react";',
    'import { RefreshCcw, Filter, ArrowUpDown, CheckCircle2, AlertTriangle, FileText, Bot, Clock, ChevronRight, ArrowUp, ArrowRight, ArrowDown, Mail, AlertCircle, Search, User, HelpCircle, ChevronDown, ChevronLeft, X, Tag as TagIcon, Check } from "lucide-react";'
)

# 2. Add New States
state_hook = """  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;"""

new_states = """  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Feature states
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc'|'desc' } | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const handleSort = (key: string) => {
    let direction: 'asc'|'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };"""
content = content.replace(state_hook, new_states)

# 3. Add Handlers for Tag and Assign
handlers_old = """  const handleBulkAssign = async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkAssignInvoices(Array.from(selectedIds));
      setSelectedIds(new Set());
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };"""

handlers_new = """  const handleBulkAssign = async (userId: string) => {
    if (selectedIds.size === 0) return;
    try {
      await bulkAssignInvoices(Array.from(selectedIds), userId);
      setSelectedIds(new Set());
      setShowAssignModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleBulkTag = async () => {
    if (selectedIds.size === 0 || !tagInput.trim()) return;
    try {
      await bulkTagInvoices(Array.from(selectedIds), tagInput.trim());
      setTagInput('');
      setSelectedIds(new Set());
      setShowTagModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };"""
content = content.replace(handlers_old, handlers_new)

# 4. Modify Filter logic to include text search and sort
filter_base_old = """  if (allFilters.size > 0) {"""
filter_base_new = """
  // Text search
  if (filterQuery) {
    const q = filterQuery.toLowerCase();
    filteredInvoices = filteredInvoices.filter(i => 
      (i.vendor_name || '').toLowerCase().includes(q) || 
      (i.invoice_number || '').toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortConfig) {
    filteredInvoices = [...filteredInvoices].sort((a, b) => {
      let aVal: any = a[sortConfig.key as keyof typeof a];
      let bVal: any = b[sortConfig.key as keyof typeof b];
      
      if (sortConfig.key === 'received_at') {
        aVal = a.received_at ? new Date(a.received_at).getTime() : 0;
        bVal = b.received_at ? new Date(b.received_at).getTime() : 0;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  if (allFilters.size > 0) {"""
content = content.replace(filter_base_old, filter_base_new)

# 5. Fix Header Buttons to toggle modals
header_buttons_old = """          <div className="flex items-center text-sm text-gray-600 gap-2 cursor-pointer mr-2">
            View: <span className="font-semibold text-blue-600">Smart (Recommended)</span> <ChevronDown className="w-4 h-4" />
          </div>
          <button 
            className="h-8 px-3 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 gap-2"
          >
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button 
            className="h-8 px-3 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 gap-2"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort
          </button>"""
          
header_buttons_new = """          <button onClick={() => setShowFilterModal(true)} className="relative h-8 px-3 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 gap-2">
            <Filter className="w-3.5 h-3.5" /> {filterQuery ? "Filtered" : "Filter"}
            {filterQuery && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full"></span>}
          </button>"""
content = content.replace(header_buttons_old, header_buttons_new)

# 6. Fix Bulk Action buttons
bulk_actions_old = """            <button onClick={handleBulkAssign} disabled={selectedIds.size === 0} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50">Assign</button>
            <button disabled={selectedIds.size === 0} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50">Tag</button>"""
bulk_actions_new = """            <button onClick={() => setShowAssignModal(true)} disabled={selectedIds.size === 0} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50">Assign</button>
            <button onClick={() => setShowTagModal(true)} disabled={selectedIds.size === 0} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50">Tag</button>"""
content = content.replace(bulk_actions_old, bulk_actions_new)

# 7. Add Sort Headers
table_headers_old = """                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Recommendation</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>"""
                  
table_headers_new = """                  <th onClick={() => handleSort('id')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">Invoice {sortConfig?.key==='id' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('vendor_name')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">Vendor {sortConfig?.key==='vendor_name' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('ai_recommendation')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">AI Recommendation {sortConfig?.key==='ai_recommendation' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('overall_confidence')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">Confidence {sortConfig?.key==='overall_confidence' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('received_at')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">SLA {sortConfig?.key==='received_at' && (sortConfig.direction==='asc'?'↑':'↓')}</th>
                  <th onClick={() => handleSort('priority')} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50">Priority {sortConfig?.key==='priority' && (sortConfig.direction==='asc'?'↑':'↓')}</th>"""
content = content.replace(table_headers_old, table_headers_new)

# 8. Render Tags in the table
row_vendor_old = """                      <span className="text-xs font-bold text-slate-800">{inv.id.substring(0,8).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{inv.source}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{inv.vendor_name || 'Unknown Vendor'}</span>"""
row_vendor_new = """                      <span className="text-xs font-bold text-slate-800">{inv.id.substring(0,8).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{inv.source}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-slate-700">{inv.vendor_name || 'Unknown Vendor'}</span>
                      {inv.tags && inv.tags.length > 0 && (
                        <div className="flex gap-1">
                          {inv.tags.map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{t}</span>)}
                        </div>
                      )}
                      {inv.assignee_id && <span className="text-[10px] text-slate-500 flex items-center gap-1"><User size={10}/> Assigned</span>}
                    </div>"""
content = content.replace(row_vendor_old, row_vendor_new)

# 9. Add Modals at the bottom
modals = """
      {/* Modals */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-96 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-slate-800">Filter Invoices</h3>
              <button onClick={() => setShowFilterModal(false)}><X className="w-4 h-4 text-slate-500"/></button>
            </div>
            <div className="p-4">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Search Query (Vendor, ID, Invoice #)</label>
              <input 
                autoFocus
                type="text" 
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Search..." 
                className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border"
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t">
              <button onClick={() => { setFilterQuery(''); setShowFilterModal(false); }} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-md">Clear</button>
              <button onClick={() => setShowFilterModal(false)} className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md">Apply</button>
            </div>
          </div>
        </div>
      )}
      
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-80 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-slate-800">Assign To</h3>
              <button onClick={() => setShowAssignModal(false)}><X className="w-4 h-4 text-slate-500"/></button>
            </div>
            <div className="p-2">
               {[
                 {id: '1', name: 'Sarah (AP Lead)'}, 
                 {id: '2', name: 'John Doe'},
                 {id: '3', name: 'Accounting Team'}
               ].map(u => (
                 <button key={u.id} onClick={() => handleBulkAssign(u.id)} className="w-full text-left p-3 hover:bg-slate-50 text-sm flex items-center gap-2 border-b last:border-0 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">{u.name[0]}</div>
                    {u.name}
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}
      
      {showTagModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowTagModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-96 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-slate-800">Add Tag</h3>
              <button onClick={() => setShowTagModal(false)}><X className="w-4 h-4 text-slate-500"/></button>
            </div>
            <div className="p-4">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tag Name</label>
              <input 
                autoFocus
                type="text" 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="e.g. Urgent Review, Audit..." 
                className="w-full text-sm border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border"
                onKeyDown={e => e.key === 'Enter' && handleBulkTag()}
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t">
              <button onClick={() => setShowTagModal(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-md">Cancel</button>
              <button onClick={handleBulkTag} disabled={!tagInput.trim()} className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50">Save Tag</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"""

content = content.replace("    </div>\n  );\n}", modals)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SmartWorkQueue Features Patched!")
