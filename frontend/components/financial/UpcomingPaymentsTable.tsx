export default function UpcomingPaymentsTable({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Upcoming Payments (Next 7 Days)</h3>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vendor</th>
              <th className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Invoice Count</th>
              <th className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Amount (USD)</th>
              <th className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Due Date</th>
              <th className="pb-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                <td className="py-3 px-2 text-xs text-slate-700 font-medium truncate max-w-[140px]">{row.vendor}</td>
                <td className="py-3 px-2 text-xs text-slate-600 text-center">{row.count}</td>
                <td className="py-3 px-2 text-xs text-slate-800 font-bold text-center">
                  ${row.amount.toLocaleString()}
                </td>
                <td className="py-3 px-2 text-xs text-slate-600 text-center whitespace-nowrap">{row.due_date}</td>
                <td className="py-3 px-2 text-xs text-slate-600 whitespace-nowrap">{row.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pt-3 text-center mt-auto">
        <button className="text-xs font-semibold text-blue-600 hover:underline">View all upcoming payments</button>
      </div>
    </div>
  );
}
