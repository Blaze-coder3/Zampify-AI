export default function TopVendorsTable({ data }: { data: any[] }) {
  if (!data) return null;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Top Vendors by Spend</h3>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
              <th className="py-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Spend (USD)</th>
              <th className="py-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Invoices</th>
              <th className="py-3 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">% of Total Spend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                <td className="py-3 px-2 text-xs text-slate-700 font-medium truncate max-w-[120px]">{row.vendor_name}</td>
                <td className="py-3 px-2 text-xs text-slate-600">${row.total_spend.toLocaleString()}</td>
                <td className="py-3 px-2 text-xs text-slate-600">{row.invoices}</td>
                <td className="py-3 px-2">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${row.pct}%` }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pt-3 text-center">
        <button className="text-xs font-semibold text-blue-600 hover:underline">View all vendors</button>
      </div>
    </div>
  );
}
