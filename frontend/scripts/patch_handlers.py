import os

file_path = r"C:\Users\A Syed Khwaja\OneDrive\Desktop\Zampify-AI\frontend\components\workspace\SmartWorkQueue.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_code = """  const handleBulkAssign = async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkAssignInvoices(Array.from(selectedIds));
      setSelectedIds(new Set());
      onRefresh();
    } catch (e) {
      alert("Failed to assign selected.");
    }
  };"""

new_code = """  const handleBulkAssign = async (userId: string) => {
    if (selectedIds.size === 0) return;
    try {
      await bulkAssignInvoices(Array.from(selectedIds), userId);
      setSelectedIds(new Set());
      setShowAssignModal(false);
      onRefresh();
    } catch (e) {
      alert("Failed to assign selected.");
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
      alert("Failed to tag selected.");
    }
  };"""

content = content.replace(old_code, new_code)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Handlers patched")
