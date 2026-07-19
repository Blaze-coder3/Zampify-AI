import os
import re

file_path = r"C:\Users\A Syed Khwaja\OneDrive\Desktop\Zampify-AI\frontend\components\workspace\SmartWorkQueue.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Pagination State
state_hook = """  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());"""
new_state = """  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;"""

content = content.replace(state_hook, new_state)

# 2. Fix filter logic (remove .slice and do actual filtering)
filter_logic_old = """  if (activeFilter) {
    if (activeFilter === 'approved') {
       filteredInvoices = invoices.filter(i => i.status === 'approved');
       filteredCases = cases.filter(c => c.status === 'Closed');
    } else if (activeFilter === 'needs_review') {
       filteredInvoices = invoices.filter(i => i.status === 'needs_review');
       filteredCases = cases.filter(c => c.status === 'NeedsReview');
    } else {
       if (activeFilter === 'waiting_vendor') {
           filteredInvoices = invoices.filter(i => i.status !== 'approved' && i.status !== 'needs_review').slice(0, 5);
           filteredCases = cases.filter(c => c.status === 'WaitingVendor');
       } else if (activeFilter === 'due_2h') {
           filteredInvoices = invoices.slice(0, 3);
           filteredCases = cases.slice(0, 2);
       } else if (activeFilter === 'duplicate') {
           filteredInvoices = invoices.filter(i => i.overall_confidence && i.overall_confidence < 0.6).slice(0, 2);
       }
    }
  }"""

filter_logic_new = """  if (activeFilter) {
    if (activeFilter === 'approved') {
       filteredInvoices = invoices.filter(i => i.status === 'approved' || i.status === 'validated');
       filteredCases = cases.filter(c => c.status === 'Closed');
    } else if (activeFilter === 'needs_review') {
       filteredInvoices = invoices.filter(i => i.status === 'needs_review');
       filteredCases = cases.filter(c => c.status === 'NeedsReview');
    } else if (activeFilter === 'waiting_vendor') {
       filteredInvoices = invoices.filter(i => i.status === 'triage');
       filteredCases = cases.filter(c => c.status === 'WaitingVendor');
    } else if (activeFilter === 'due_2h') {
       filteredInvoices = invoices.filter(i => {
           if (!i.received_at) return false;
           const ageMs = new Date().getTime() - new Date(i.received_at).getTime();
           return ageMs > 22 * 60 * 60 * 1000 && !['approved', 'rejected', 'archived', 'failed'].includes(i.status || '');
       });
       filteredCases = cases.filter(c => c.priority === 'High');
    } else if (activeFilter === 'duplicate') {
       // In a real app we'd filter by validation failures. Without full details here, we fallback to backend API mapping logic or just 0
       filteredInvoices = invoices.filter(i => i.status === 'failed');
    }
  }

  // Calculate pagination bounds
  const totalItems = isCommunicationView ? filteredCases.length : filteredInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  if (isCommunicationView) {
      filteredCases = filteredCases.slice(startIndex, endIndex);
  } else {
      filteredInvoices = filteredInvoices.slice(startIndex, endIndex);
  }
"""

content = content.replace(filter_logic_old, filter_logic_new)

# Replace instances of itemsCount > 6 ? 6 : itemsCount to dynamically use start/end
itemsCount_decl = "const itemsCount = isCommunicationView ? filteredCases.length : filteredInvoices.length;"
# Actually we already calculated totalItems. Let's just remove this line.
content = content.replace(itemsCount_decl, "")
content = content.replace("itemsCount", "totalItems")

pagination_html_old = """      <div className="border-t border-gray-100 p-4 flex items-center justify-between bg-white mt-auto shrink-0">
        <div className="text-sm text-gray-500">
          Showing 1 to {totalItems > 6 ? 6 : totalItems} of {totalItems} {isCommunicationView ? 'threads' : 'invoices'}
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 opacity-50 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4"/>
          </button>
          <button className="w-8 h-8 rounded-md border border-blue-600 bg-blue-50 text-blue-600 text-sm font-medium">1</button>
          <button className="w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">2</button>
          <button className="w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">3</button>
          <span className="px-2 text-gray-400">...</span>
          <button className="w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">14</button>
          <button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 transition-colors">
            <ChevronRight className="w-4 h-4"/>
          </button>
        </div>
        <div className="text-sm text-gray-500">6 / page</div>
      </div>"""

pagination_html_new = """      <div className="border-t border-gray-100 p-4 flex items-center justify-between bg-white mt-auto shrink-0">
        <div className="text-sm text-gray-500">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} {isCommunicationView ? 'threads' : 'invoices'}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4"/>
          </button>
          
          <span className="px-3 text-sm text-gray-600 font-medium">
            Page {safeCurrentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4"/>
          </button>
        </div>
        <div className="text-sm text-gray-500">{itemsPerPage} / page</div>
      </div>"""

content = content.replace(pagination_html_old, pagination_html_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SmartWorkQueue patched!")
