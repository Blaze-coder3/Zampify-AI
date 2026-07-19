"""
Text Extraction Service — Generates Document Intelligence Package.
"""

import pytesseract
from PIL import Image
import fitz  # PyMuPDF
from dataclasses import dataclass, field
from typing import Optional, List, Dict
from app.core.logging import get_logger
import tempfile
import os

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

logger = get_logger(__name__)

@dataclass
class DocumentIntelligencePackage:
    raw_text: str  # text including coordinate tags for LLM
    ocr_confidence: float
    method: str
    page_count: int
    layout_regions: List[Dict] = field(default_factory=list)
    
# Keep alias for backwards compatibility with process_invoice.py type hints
ExtractionResult = DocumentIntelligencePackage

def extract_text_digital(pdf_path: str) -> DocumentIntelligencePackage:
    try:
        doc = fitz.open(pdf_path)
        pages_text = []
        for page in doc:
            words = page.get_text("words")
            # Sort by vertical (y0), then horizontal (x0)
            words.sort(key=lambda w: (w[1], w[0]))
            
            lines = []
            current_line = []
            last_y = -1
            
            for w in words:
                x0, y0, x1, y1, word_text, block_no, line_no, word_no = w
                # Simple line grouping logic
                if last_y != -1 and abs(y0 - last_y) > 5:
                    lines.append(" ".join(current_line))
                    current_line = []
                # Append word with its bounding box
                current_line.append(f"{word_text} [{int(x0)},{int(y0)},{int(x1)},{int(y1)}]")
                last_y = y0
                
            if current_line:
                lines.append(" ".join(current_line))
                
            pages_text.append("\n".join(lines))
        doc.close()

        raw_text = "\n\n".join(pages_text).strip()

        return DocumentIntelligencePackage(
            raw_text=raw_text,
            ocr_confidence=95.0,
            method="docling_simulated_digital",
            page_count=len(pages_text),
        )
    except Exception as e:
        logger.error("digital_extraction_failed", pdf_path=pdf_path, error=str(e))
        raise

def extract_text_scanned(pdf_path: str) -> DocumentIntelligencePackage:
    try:
        doc = fitz.open(pdf_path)
        all_text = []
        all_confidences = []
        layout_regions = []

        # YOLO Layout model
        model = None
        if YOLO:
            try:
                model = YOLO("AvoCahDoe/invoice-layout-yolov8m")
            except:
                pass

        for page_num, page in enumerate(doc):
            mat = fitz.Matrix(300 / 72, 300 / 72)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_data = pix.tobytes("ppm")

            import io
            img = Image.open(io.BytesIO(img_data))
            
            # YOLO layout detection
            if model:
                img_path = os.path.join(tempfile.gettempdir(), f"temp_page_{page_num}.png")
                img.save(img_path)
                try:
                    preds = model.predict(source=img_path, save=False)
                    for box in preds[0].boxes:
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        cls_name = model.names[int(box.cls[0])]
                        layout_regions.append({
                            "page": page_num,
                            "type": cls_name,
                            "bbox": [int(x1), int(y1), int(x2), int(y2)],
                            "confidence": float(box.conf[0])
                        })
                except Exception as e:
                    logger.warning(f"YOLO failed on page {page_num}: {e}")
                finally:
                    if os.path.exists(img_path):
                        os.remove(img_path)

            # Tesseract OCR with bounding boxes
            ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT, config="--psm 6")
            
            lines = []
            current_line = []
            last_line_num = -1
            
            for i in range(len(ocr_data['text'])):
                text = ocr_data['text'][i].strip()
                if not text:
                    continue
                    
                line_num = ocr_data['line_num'][i]
                if last_line_num != -1 and line_num != last_line_num:
                    lines.append(" ".join(current_line))
                    current_line = []
                    
                x, y, w, h = ocr_data['left'][i], ocr_data['top'][i], ocr_data['width'][i], ocr_data['height'][i]
                current_line.append(f"{text} [{x},{y},{x+w},{y+h}]")
                last_line_num = line_num
                
                conf = ocr_data['conf'][i]
                if conf != -1:
                    all_confidences.append(float(conf))
                    
            if current_line:
                lines.append(" ".join(current_line))
                
            all_text.append("\n".join(lines))

        doc.close()

        overall_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0.0
        raw_text = "\n\n".join(all_text).strip()

        return DocumentIntelligencePackage(
            raw_text=raw_text,
            ocr_confidence=overall_confidence,
            method="yolo_tesseract_scanned",
            page_count=len(all_text),
            layout_regions=layout_regions
        )

    except Exception as e:
        logger.error("scanned_extraction_failed", pdf_path=pdf_path, error=str(e))
        raise

def extract_text(pdf_path: str, pdf_type: str) -> DocumentIntelligencePackage:
    if pdf_type == "digital":
        return extract_text_digital(pdf_path)
    else:
        return extract_text_scanned(pdf_path)
