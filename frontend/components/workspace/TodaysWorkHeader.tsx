"use client";

import { FileText, AlertTriangle, Clock, RefreshCw, Play } from "lucide-react";

import { DashboardStats } from "@/lib/api";

interface TodaysWorkHeaderProps {
  onRefresh: () => void;
  onStartProcessing: () => void;
  onResumeLastCase: () => void; 
  stats?: DashboardStats | null;
}

export default function TodaysWorkHeader({ onRefresh, onStartProcessing, stats }: TodaysWorkHeaderProps) {
  // We can map total pending to "Assigned", Needs Review to "Urgent" 
  // Avg SLA can be converted from seconds to hours and minutes
  const assigned = stats?.pending || 0;
  const urgent = stats?.needs_review || 0;
  
  let slaText = "0m";
  if (stats?.avg_processing_time_seconds) {
    const totalMins = Math.floor(stats.avg_processing_time_seconds / 60);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    slaText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-6">
      
      {/* Left side: Greeting and KPIs inline */}
      <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
        <div className="pb-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Good morning, Priya! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Let's clear your queue.</p>
        </div>
        
        {/* Compact KPI Cards */}
        <div className="flex gap-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2 flex flex-col justify-center min-w-[90px] h-[72px]">
            <div className="flex items-center gap-1.5 mb-1 text-gray-500">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Assigned</span>
            </div>
            <div className="text-xl font-bold text-gray-900 leading-none">{assigned}</div>
          </div>
          
          <div className="bg-white rounded-lg border border-red-100 shadow-sm px-3 py-2 flex flex-col justify-center min-w-[90px] h-[72px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div className="flex items-center gap-1.5 mb-1 text-red-600 pl-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Urgent</span>
            </div>
            <div className="text-xl font-bold text-gray-900 leading-none pl-1.5">{urgent}</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2 flex flex-col justify-center min-w-[90px] h-[72px]">
            <div className="flex items-center gap-1.5 mb-1 text-emerald-600">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Avg. SLA</span>
            </div>
            <div className="text-xl font-bold text-gray-900 leading-none">{slaText}</div>
          </div>
        </div>
      </div>
      
      {/* Right side: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={onRefresh}
          className="h-10 px-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 shadow-sm gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        <button 
          onClick={onStartProcessing}
          className="h-10 px-6 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 shadow-sm gap-2"
        >
          <Play className="w-4 h-4 fill-current" /> Start Processing
        </button>
      </div>
    </div>
  );
}
