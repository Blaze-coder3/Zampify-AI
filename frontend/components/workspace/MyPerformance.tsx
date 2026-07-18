"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { DashboardStats } from "@/lib/api";

interface MyPerformanceProps {
  stats?: DashboardStats | null;
}

export default function MyPerformance({ stats }: MyPerformanceProps) {
  const stpRate = stats?.stp_rate || 0;
  const processed = stats?.approved || 0;
  
  let avgProcessingTime = "0m";
  if (stats?.avg_processing_time_seconds) {
    const totalMins = Math.floor(stats.avg_processing_time_seconds / 60);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    avgProcessingTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm flex flex-col min-h-0">
      <div className="flex flex-col space-y-1.5 p-6 pb-2">
        <h3 className="font-semibold leading-none tracking-tight text-base">My Performance</h3>
      </div>
      <div className="p-6 pt-4 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-end mb-2">
          <div>
            <div className="text-3xl font-black text-gray-900">{stpRate}%</div>
            <div className="text-sm font-medium text-emerald-600">STP Rate</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Processed</div>
            <div className="text-xl font-bold text-gray-900">{processed}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Accuracy Rate</span>
            <span className="font-bold text-gray-700">99.8%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
             <div className="bg-emerald-500 h-full w-[99.8%] rounded-full"></div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Avg Processing Time</span>
            <span className="font-bold text-gray-700">{avgProcessingTime}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full w-4/5 rounded-full"></div>
          </div>
        </div>
        <div className="text-right mt-4 flex-1 flex items-end justify-end">
           <button className="text-blue-600 underline-offset-4 hover:underline text-xs p-0 h-auto inline-flex items-center justify-center font-medium">
             View full analytics <ChevronRight className="w-3 h-3 ml-1"/>
           </button>
        </div>
      </div>
    </div>
  );
}
