import { useState, useMemo } from "react";
import { ZoomIn, ZoomOut, Download, Maximize, LayoutTemplate, Type, Loader2 } from "lucide-react";
import { InvoiceDetail } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
  invoice: InvoiceDetail;
}

export default function DocumentViewer({ invoice }: DocumentViewerProps) {
  const [showFields, setShowFields] = useState(true);
  const [showLayout, setShowLayout] = useState(false);
  const [activeBox, setActiveBox] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pageWidth, setPageWidth] = useState<number>(595);

  const handleDownload = () => {
    if (invoice.pdf_storage_path) {
      window.open(`http://localhost:8000/api/v1/uploads/${invoice.id}.pdf`, '_blank');
    }
  };

  const handleMaximize = () => {
    if (invoice.pdf_storage_path) {
      window.open(`http://localhost:8000/api/v1/uploads/${invoice.id}.pdf`, '_blank', 'noopener,noreferrer');
    }
  };

  const onPageLoadSuccess = (page: any) => {
    setPageWidth(page.originalWidth || page.getViewport({ scale: 1 }).width);
  };

  const viewerWidth = 800;
  
  // If we're extracting from a scanned image via YOLO it might be in image pixels (e.g., 2480 width).
  // If it's digital, PyMuPDF outputs points.
  // We determine the true scale factor between what the backend used vs our rendered width.
  // Actually, PyMuPDF coordinates are always based on the PDF's internal dimensions, which react-pdf also uses!
  // EXCEPT when we rasterize to 300 DPI for scanned images in the backend. 
  // Wait, the backend scanned logic: `mat = fitz.Matrix(300 / 72, 300 / 72); pix = page.get_pixmap(matrix=mat)`
  // This means the scanned bounding boxes are 300/72 (4.1666x) larger than PDF points.
  const isScanned = invoice.extraction_method?.includes("scanned");
  const backendCoordinateSpaceWidth = isScanned ? (pageWidth * (300 / 72)) : pageWidth;
  const scale = viewerWidth / backendCoordinateSpaceWidth;
  const offsetX = 0;
  const offsetY = 0;

  // Safe getter for bounding boxes from our new backend structure
  const fields = invoice.ocr_bounding_boxes?.fields || {};
  const layoutRegions = invoice.ocr_bounding_boxes?.layout_regions || [];

  return (
    <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden relative border-r border-slate-200">
      <div className="bg-slate-800 text-slate-200 px-4 py-2 flex justify-between items-center shrink-0 z-10 shadow-sm">
        <div className="text-sm font-medium flex items-center space-x-4">
          <span>Original Document</span>
          <div className="flex space-x-2 border-l border-slate-600 pl-4">
            <button 
              onClick={() => setShowFields(!showFields)}
              className={cn("flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-medium transition-colors", 
                showFields ? "bg-blue-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300")}
            >
              <Type size={14} /> <span>Fields</span>
            </button>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-1.5 hover:bg-slate-700 rounded transition-colors"><ZoomOut size={16} /></button>
          <span className="text-xs font-mono py-1.5 px-1">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="p-1.5 hover:bg-slate-700 rounded transition-colors"><ZoomIn size={16} /></button>
          <button onClick={handleMaximize} className="p-1.5 hover:bg-slate-700 rounded transition-colors"><Maximize size={16} /></button>
          <div className="w-px h-6 bg-slate-600 mx-2"></div>
          <button onClick={handleDownload} className="p-1.5 hover:bg-slate-700 rounded transition-colors"><Download size={16} /></button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-200 p-8 flex justify-center items-start relative">
        <div className="bg-white shadow-xl relative transition-transform duration-200" style={{ width: `${viewerWidth}px`, minHeight: '1050px', transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
          
          {/* Document Render */}
          {invoice.pdf_storage_path ? (
            <div className="relative">
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-50 pointer-events-none shadow">PDF Loaded</div>
              <Document
                file={`http://localhost:8000/api/v1/uploads/${invoice.id}.pdf`}
                loading={
                  <div className="flex justify-center items-center h-[1050px]">
                    <Loader2 className="animate-spin text-slate-400" size={32} />
                  </div>
                }
                className="w-full h-full"
              >
                <Page 
                  pageNumber={1} 
                  width={viewerWidth}
                  onLoadSuccess={onPageLoadSuccess}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-sm"
                />
              </Document>
            </div>
          ) : (
          <div className="absolute inset-0 p-12 pointer-events-none opacity-50 grayscale z-0">
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-50 pointer-events-none">Mock Mode</div>
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{invoice.vendor_name || 'VENDOR INC'}</h1>
                <p className="text-slate-500">123 Business Road<br/>Suite 100<br/>City, ST 12345</p>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-bold text-slate-300 mb-2">INVOICE</h2>
                <p className="font-semibold text-slate-700"># {invoice.invoice_number || invoice.id}</p>
                <p className="text-slate-500">Date: {invoice.invoice_date || 'Oct 24, 2024'}</p>
              </div>
            </div>
            
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
                    <td className="py-4 px-4 text-slate-700">{item.description?.value || item.description || "Item"}</td>
                    <td className="py-4 px-4 text-right text-slate-700">{item.quantity?.value || item.quantity || 1}</td>
                    <td className="py-4 px-4 text-right text-slate-700">${(item.unit_price?.value || item.unit_price || 0).toFixed(2)}</td>
                    <td className="py-4 px-4 text-right text-slate-700 font-medium">${(item.total?.value || item.total_price || 0).toFixed(2)}</td>
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
          )}

          {/* Layout Regions (YOLOv8) */}
          {showLayout && layoutRegions.map((region: any, i: number) => {
             const [xMin, yMin, xMax, yMax] = region.bbox;
             if (xMin === 0 && yMin === 0 && xMax === 0 && yMax === 0) return null;
             return (
               <div key={`layout-${i}`} 
                    className="absolute border-2 border-purple-400/50 bg-purple-400/10 pointer-events-none"
                    style={{
                      left: `${xMin * scale + offsetX}px`, top: `${yMin * scale + offsetY}px`,
                      width: `${(xMax - xMin) * scale}px`, height: `${(yMax - yMin) * scale}px`
                    }}>
                 <div className="absolute -top-5 left-0 bg-purple-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-sm uppercase tracking-wider">
                   {region.type} ({Math.round(region.confidence * 100)}%)
                 </div>
               </div>
             );
          })}

          {/* Extracted Fields Bounding Boxes */}
          {showFields && Object.entries(fields).map(([key, bbox]: [string, any]) => {
            if (!Array.isArray(bbox) || bbox.length !== 4) return null;
            const [xMin, yMin, xMax, yMax] = bbox;
            if (xMin === 0 && yMin === 0 && xMax === 0 && yMax === 0) return null;
            
            const isHovered = activeBox === key;
            const conf = invoice.field_confidences?.[key] || 100;
            const colorClass = conf >= 90 ? 'border-green-500 bg-green-500/20' : conf >= 70 ? 'border-amber-500 bg-amber-500/20' : 'border-red-500 bg-red-500/20';
            const badgeClass = conf >= 90 ? 'bg-green-500' : conf >= 70 ? 'bg-amber-500' : 'bg-red-500';
            
            return (
              <div 
                key={`field-${key}`}
                onMouseEnter={() => setActiveBox(key)}
                onMouseLeave={() => setActiveBox(null)}
                className={cn("absolute border-2 cursor-pointer transition-all duration-200", colorClass, isHovered ? "z-20 shadow-lg scale-[1.02]" : "z-10")}
                style={{
                  left: `${xMin * scale + offsetX}px`, top: `${yMin * scale + offsetY}px`,
                  width: `${Math.max((xMax - xMin) * scale, 20)}px`, height: `${Math.max((yMax - yMin) * scale, 15)}px`
                }}
              >
                {isHovered && (
                  <div className={cn("absolute -top-7 left-0 text-white text-xs font-bold px-2 py-1 rounded shadow-md whitespace-nowrap flex flex-col", badgeClass)}>
                    <span>{key.replace('_', ' ').toUpperCase()}</span>
                  </div>
                )}
              </div>
            );
          })}
          
        </div>
      </div>
    </div>
  );
}
