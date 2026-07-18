import { Shield, Table2, Upload, Plus, ChevronDown } from "lucide-react";

export default function UserHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage user accounts, roles, permissions and access across the organization.</p>
      </div>
      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors h-[36px]">
          <Shield size={14} className="text-slate-500" />
          Role Management
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors h-[36px]">
          <Table2 size={14} className="text-slate-500" />
          Permission Matrix
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors h-[36px]">
          <Upload size={14} className="text-slate-500" />
          Import Users
        </button>
        <div className="flex items-center">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-l-lg text-sm font-medium transition-colors shadow-sm h-[36px]">
            <Plus size={14} />
            Add User
          </button>
          <button className="flex items-center bg-blue-700 hover:bg-blue-800 text-white px-2 py-2 rounded-r-lg text-sm font-medium transition-colors shadow-sm h-[36px] border-l border-blue-500">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
