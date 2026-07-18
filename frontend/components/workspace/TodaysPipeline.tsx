"use client";

import { FileText, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodaysPipelineProps {
  pipeline?: Record<string, number> | null;
}

export default function TodaysPipeline({ pipeline }: TodaysPipelineProps) {
  const inProcessing = 
    (pipeline?.classifying || 0) + 
    (pipeline?.extracting || 0) + 
    (pipeline?.extracted || 0) + 
    (pipeline?.validating || 0) + 
    (pipeline?.validated || 0);

  const pipelineSteps = [
    { label: 'Received', count: pipeline?.received || 0, icon: <FileText className="w-4 h-4 text-blue-500"/>, color: 'border-blue-200 bg-blue-50' },
    { label: 'In Processing', count: inProcessing, icon: <RefreshCw className="w-4 h-4 text-purple-500"/>, color: 'border-purple-200 bg-purple-50' },
    { label: 'Needs Review', count: pipeline?.needs_review || 0, icon: <AlertTriangle className="w-4 h-4 text-red-500"/>, color: 'border-red-200 bg-red-50' },
    { label: 'Approved', count: pipeline?.approved || 0, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500"/>, color: 'border-emerald-200 bg-emerald-50' },
    { label: 'Paid', count: 0, icon: <CheckCircle2 className="w-4 h-4 text-gray-400"/>, color: 'border-gray-200 bg-gray-50' }, // Mocked until payment integration
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm flex flex-col min-h-0">
      <div className="flex flex-col space-y-1.5 p-6 pb-2">
        <h3 className="font-semibold leading-none tracking-tight text-base">Today's Pipeline</h3>
      </div>
      <div className="p-6 pt-0 flex-1 flex flex-col">
        <div className="flex justify-between items-center py-4 relative flex-1">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
          
          {pipelineSteps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2 bg-white">
              <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center z-10", step.color)}>
                {step.icon}
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-0.5">{step.label}</div>
                <div className="font-bold text-gray-900">{step.count}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right mt-2">
           <button className="text-blue-600 underline-offset-4 hover:underline text-xs p-0 h-auto inline-flex items-center justify-center font-medium">
             View pipeline details <ChevronRight className="w-3 h-3 ml-1"/>
           </button>
        </div>
      </div>
    </div>
  );
}
