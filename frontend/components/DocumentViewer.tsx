import { ZoomIn, ZoomOut, Download, Maximize } from "lucide-react";
import { InvoiceDetail } from "@/lib/api";

interface DocumentViewerProps {
  invoice: InvoiceDetail;
}

export default function DocumentViewer({ invoice }: DocumentViewerProps) {
  // We'll mock the document view with an embedded iframe pointing to a static PDF or an image
  // In reality, this would hit a backend endpoint to fetch the document based on invoice.id
  
  return (
    <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden relative border-r border-slate-200">
      <div className="bg-slate-800 text-slate-200 px-4 py-2 flex justify-between items-center shrink-0 z-10 shadow-sm">
        <div className="text-sm font-medium">Original Document</div>
        <div className="flex space-x-2">
          <button className="p-1.5 hover:bg-slate-700 rounded transition-colors"><ZoomOut size={16} /></button>
          <button className="p-1.5 hover:bg-slate-700 rounded transition-colors"><ZoomIn size={16} /></button>
          <button className="p-1.5 hover:bg-slate-700 rounded transition-colors"><Maximize size={16} /></button>
          <div className="w-px h-6 bg-slate-600 mx-2"></div>
          <button className="p-1.5 hover:bg-slate-700 rounded transition-colors"><Download size={16} /></button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-200 p-8 flex justify-center items-start relative">
        <div className="bg-white shadow-xl relative" style={{ width: '800px', minHeight: '1050px' }}>
          {/* Document Content Placeholder - Would normally be the PDF/Image */}
          <div className="absolute inset-0 p-12">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{invoice.vendor_name || 'VENDOR INC'}</h1>
                <p className="text-slate-500">123 Business Road<br/>Suite 100<br/>City, ST 12345</p>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-bold text-slate-300 mb-2">INVOICE</h2>
                <p className="font-semibold text-slate-700"># {invoice.id.substring(0,8).toUpperCase()}</p>
                <p className="text-slate-500">Date: Oct 24, 2024</p>
              </div>
            </div>
            
            {/* Mock Line Items */}
            <table className="w-full mt-12 text-sm">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-slate-600">Description</th>
                  <th className="py-3 px-4 text-right font-semibold text-slate-600">Qty</th>
                  <th className="py-3 px-4 text-right font-semibold text-slate-600">Unit Price</th>
                  <th className="py-3 px-4 text-right font-semibold text-slate-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.line_items?.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-4 px-4 text-slate-700">{item.description}</td>
                    <td className="py-4 px-4 text-right text-slate-700">{item.quantity}</td>
                    <td className="py-4 px-4 text-right text-slate-700">${item.unit_price?.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right text-slate-700 font-medium">${item.total_price?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-12 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 text-slate-600">
                  <span>Subtotal</span>
                  <span>${invoice.subtotal ? invoice.subtotal.toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between py-2 text-slate-600 border-b border-slate-200">
                  <span>Tax</span>
                  <span>${invoice.tax_amount ? invoice.tax_amount.toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between py-3 font-bold text-lg text-slate-800">
                  <span>Total</span>
                  <span>${invoice.grand_total ? invoice.grand_total.toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bounding Boxes */}
          {invoice.raw_extracted_data && Object.entries(invoice.raw_extracted_data).map(([key, data]: [string, any]) => {
            // Check if it's a field with bounding_box
            if (data && typeof data === 'object' && Array.isArray(data.bounding_box) && data.bounding_box.length === 4) {
              const [xMin, yMin, xMax, yMax] = data.bounding_box;
              
              // Skip if bounding box is [0,0,0,0] (not found or invalid)
              if (xMin === 0 && yMin === 0 && xMax === 0 && yMax === 0) return null;
              
              // Calculate style (assuming coordinates are relative to a 1000x1000 canvas for example, 
              // or pixels, but since we mock the PDF render, we will map them using percentages if possible.
              // For now, if we get raw pixels, we assume the PDF is 800x1050 scaled.
              // Let's assume the LLM returned pixel values relative to 800x1050)
              
              // We'll use absolute positioning with raw pixels for demonstration, 
              // as this would be mapped accurately by a real PDF library.
              const style = {
                left: `${xMin}px`,
                top: `${yMin}px`,
                width: `${xMax - xMin}px`,
                height: `${yMax - yMin}px`,
              };
              
              const conf = data.confidence || 0;
              const colorClass = conf > 90 ? 'green' : conf > 70 ? 'blue' : 'amber';
              
              return (
                <div key={key} className={`doc-highlight ${colorClass}`} style={style} title={`Extracted ${key}`}>
                  <div className={`absolute -top-6 left-0 bg-${colorClass}-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap`}>
                    {key.replace('_', ' ')} ({conf}%)
                  </div>
                </div>
              );
            }
            return null;
          })}
          
          {/* Fallback mock bounding boxes if no real data is present (for demonstration) */}
          {(!invoice.raw_extracted_data || Object.keys(invoice.raw_extracted_data).length === 0) && (
            <>
              <div className="doc-highlight green" style={{ top: '3rem', left: '2.5rem', width: '220px', height: '45px' }} title="Extracted Vendor Name">
                <div className="absolute -top-6 left-0 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap">Vendor (98%)</div>
              </div>
              <div className="doc-highlight green" style={{ bottom: '11.5rem', right: '2.5rem', width: '120px', height: '40px' }} title="Extracted Total">
                <div className="absolute -top-6 left-0 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap">Total (95%)</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
