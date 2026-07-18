"use client";

import { X, Upload, Mail, Building, Plus, FileText } from "lucide-react";
import { useState } from "react";

interface ComposeModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ComposeModal({ onClose, onSubmit }: ComposeModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Plus size={16} className="text-blue-600" />
            </div>
            <h2 className="font-bold">Create Communication Case</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
          
          {/* Method Selection */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                activeTab === "upload" 
                  ? "bg-white text-blue-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <Upload size={16} /> Upload Document
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                activeTab === "paste" 
                  ? "bg-white text-blue-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <Mail size={16} /> Paste Email / Text
            </button>
          </div>

          {/* Dynamic Content Area */}
          {activeTab === "upload" ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50/30 hover:border-blue-400 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700">Click to upload or drag & drop</p>
              <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG or TIFF (Max 25MB)</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Email Content</label>
              <textarea 
                rows={6}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                placeholder="Paste the email thread or manual text here..."
              />
            </div>
          )}

          <div className="w-full h-px bg-slate-100"></div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building size={14} className="text-slate-400" /> Vendor (Optional)
              </label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Search or enter vendor name..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText size={14} className="text-slate-400" /> Notes
              </label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Internal notes..."
              />
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSubmit({})}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
          >
            Create Case
          </button>
        </div>

      </div>
    </div>
  );
}
