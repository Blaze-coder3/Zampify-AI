"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileText, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { uploadInvoice } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
  onSuccess: (invoiceId: string) => void;
}

export default function UploadModal({ onClose, onSuccess }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [invoiceId, setInvoiceId] = useState("");

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB");
      return;
    }
    setFile(f);
    setError("");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setState("uploading");
    try {
      const res = await uploadInvoice(file);
      setInvoiceId(res.data.invoice_id);
      setState("success");
      setTimeout(() => onSuccess(res.data.invoice_id), 1500);
    } catch (e: any) {
      setError(e.message || "Upload failed");
      setState("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-semibold text-white">Upload Invoice</h2>
            <p className="text-xs text-slate-500 mt-0.5">PDF files up to 10MB</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {state === "success" ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-medium">Invoice queued for processing!</p>
              <p className="text-xs text-slate-500 mt-1">Redirecting to live view...</p>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  dragging ? "border-blue-400 bg-blue-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5",
                  file ? "border-emerald-500/40 bg-emerald-500/5" : ""
                )}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={32} className="text-emerald-400" />
                    <p className="text-sm text-white font-medium">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={32} className="text-slate-500" />
                    <p className="text-sm text-slate-400">
                      <span className="text-blue-400 font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-600">PDF only, max 10MB</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!file || state === "uploading"}
                className={cn(
                  "w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2",
                  file && state !== "uploading"
                    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                )}
              >
                {state === "uploading" ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing...</>
                ) : (
                  <><Upload size={16} /> Submit for Processing</>
                )}
              </button>

              <p className="text-xs text-slate-600 text-center">
                Processing is asynchronous. You'll be redirected to the live view.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
