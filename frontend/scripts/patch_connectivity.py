import os

queue_path = r"C:\Users\A Syed Khwaja\OneDrive\Desktop\Zampify-AI\frontend\components\workspace\SmartWorkQueue.tsx"
page_path = r"C:\Users\A Syed Khwaja\OneDrive\Desktop\Zampify-AI\frontend\app\page.tsx"

with open(queue_path, "r", encoding="utf-8") as f:
    queue = f.read()

# Update props
queue = queue.replace(
    "activeFilter?: string | null;",
    "activeFilter?: string | null;\n  activeFilters?: string[];"
)

queue = queue.replace(
    "activeFilter \n}: SmartWorkQueueProps)",
    "activeFilter, activeFilters = []\n}: SmartWorkQueueProps)"
)

# Update logic
old_logic = """  if (activeFilter) {
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
  }"""

new_logic = """  // Merge activeFilter (singular top cards) and activeFilters (plural sidebar)
  const allFilters = new Set(activeFilters);
  if (activeFilter) allFilters.add(activeFilter);

  if (allFilters.size > 0) {
      if (allFilters.has('approved')) {
          filteredInvoices = filteredInvoices.filter(i => i.status === 'approved' || i.status === 'validated');
          filteredCases = filteredCases.filter(c => c.status === 'Closed');
      }
      if (allFilters.has('needs_review')) {
          filteredInvoices = filteredInvoices.filter(i => i.status === 'needs_review');
          filteredCases = filteredCases.filter(c => c.status === 'NeedsReview');
      }
      if (allFilters.has('waiting_vendor')) {
          filteredInvoices = filteredInvoices.filter(i => i.status === 'triage');
          filteredCases = filteredCases.filter(c => c.status === 'WaitingVendor');
      }
      if (allFilters.has('due_2h') || allFilters.has('due_today') || allFilters.has('urgent')) {
          filteredInvoices = filteredInvoices.filter(i => {
              if (!i.received_at) return false;
              const ageMs = new Date().getTime() - new Date(i.received_at).getTime();
              return ageMs > 22 * 60 * 60 * 1000 && !['approved', 'rejected', 'archived', 'failed'].includes(i.status || '');
          });
          filteredCases = filteredCases.filter(c => c.priority === 'High');
      }
      if (allFilters.has('duplicate')) {
          filteredInvoices = filteredInvoices.filter(i => i.status === 'failed');
      }
  }"""

queue = queue.replace(old_logic, new_logic)

with open(queue_path, "w", encoding="utf-8") as f:
    f.write(queue)

with open(page_path, "r", encoding="utf-8") as f:
    page = f.read()

page = page.replace(
    "activeFilter={activeFilter}",
    "activeFilter={activeFilter}\n                   activeFilters={activeFilters}"
)

with open(page_path, "w", encoding="utf-8") as f:
    f.write(page)

print("Connectivity patched!")
