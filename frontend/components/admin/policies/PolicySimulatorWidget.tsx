import { FlaskConical } from "lucide-react";

export default function PolicySimulatorWidget() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200">
          <FlaskConical size={20} className="text-blue-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Policy Simulator</h3>
          <p className="text-[11px] text-slate-500">Test how policies will behave with real invoice data before publishing.</p>
        </div>
      </div>
      <button className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm rounded-lg transition-colors">
        Run Simulation
      </button>
    </div>
  );
}
