import { useMemo } from "react";

export default function MFAAdoptionWidget({ data }: { data: any }) {
  if (!data) return null;

  const pct = data.pct;
  const radius = 70;
  const circumference = Math.PI * radius;
  const dashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-5">MFA Adoption</h3>
      <div className="flex flex-col items-center flex-1 justify-center">
        {/* Semicircle gauge */}
        <div className="relative w-[180px] h-[90px] overflow-hidden mb-3">
          <svg viewBox="0 0 180 90" className="w-full h-full">
            {/* Track */}
            <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#e2e8f0" strokeWidth="18" strokeLinecap="round" />
            {/* Progress */}
            <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#3b82f6" strokeWidth="18" strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${dashoffset}`}
              pathLength={circumference}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className="text-2xl font-bold text-slate-800">{pct}%</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">MFA Enabled</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full mt-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-slate-600">MFA Enabled Users</span>
            </div>
            <span className="font-bold text-slate-700">{data.enabled.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span className="text-slate-600">MFA Not Enabled Users</span>
            </div>
            <span className="font-bold text-slate-700">{data.not_enabled}</span>
          </div>
        </div>
      </div>
      <button className="mt-auto pt-4 text-xs font-semibold text-blue-600 hover:underline text-center">View MFA report</button>
    </div>
  );
}
