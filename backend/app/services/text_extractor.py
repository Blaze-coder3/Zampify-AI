"""
Text Extraction Service — Deterministic OCR, no AI reasoning.

Uses Docling for digital PDFs and Tesseract for scanned PDFs.
"""

import pytesseract
from PIL import Image
import fitz  # PyMuPDF
from dataclasses import dataclass
from typing import Optional
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class ExtractionResult:
    raw_text: str
    ocr_confidence: float
    method: str  # "docling" | "tesseract" | "pymupdf"
    page_count: int


def extract_text_digital(pdf_path: str) -> ExtractionResult:
    """
    Extract text from a digital (text-layer) PDF using PyMuPDF.
    Fast, reliable, no AI involved.
    """
    try:
        doc = fitz.open(pdf_path)
        pages_text = []
        for page in doc:
            pages_text.append(page.get_text("text"))
        doc.close()

        raw_text = "\n".join(pages_text).strip()
        logger.info("text_extracted_digital", pdf_path=pdf_path, text_length=len(raw_text))

        return ExtractionResult(
            raw_text=raw_text,
            ocr_confidence=95.0,  # Digital PDFs are inherently high confidence
            method="pymupdf",
            page_count=len(pages_text),
        )
    except Exception as e:
        logger.error("digital_extraction_failed", pdf_path=pdf_path, error=str(e))
        raise


def extract_text_scanned(pdf_path: str) -> ExtractionResult:
    """
    Extract text from a scanned PDF using Tesseract OCR.
    Converts each page to an image then runs OCR.
    Returns Tesseract's mean confidence score.
    """
    try:
        doc = fitz.open(pdf_path)
        all_text = []
        all_confidences = []

        for page_num, page in enumerate(doc):
            # Render page to image at 300 DPI for good OCR accuracy
            mat = fitz.Matrix(300 / 72, 300 / 72)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_data = pix.tobytes("ppm")

            import io
            img = Image.open(io.BytesIO(img_data))

            # Run Tesseract with confidence data
            ocr_data = pytesseract.image_to_data(
                img,
                output_type=pytesseract.Output.DICT,
                config="--psm 6",
            )

            page_text = pytesseract.image_to_string(img, config="--psm 6")
            all_text.append(page_text)

            # Calculate mean confidence (filter out -1 values = whitespace)
            confs = [c for c in ocr_data["conf"] if c != -1]
            page_conf = sum(confs) / len(confs) if confs else 0.0
            all_confidences.append(page_conf)

            logger.debug(
                "page_ocr_complete",
                page=page_num + 1,
                confidence=page_conf,
                text_length=len(page_text),
            )

        doc.close()

        overall_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0.0
        raw_text = "\n".join(all_text).strip()

        logger.info(
            "text_extracted_scanned",
            pdf_path=pdf_path,
            confidence=overall_confidence,
            text_length=len(raw_text),
        )

        return ExtractionResult(
            raw_text=raw_text,
            ocr_confidence=overall_confidence,
            method="tesseract",
            page_count=len(all_text),
        )

    except Exception as e:
        logger.error("scanned_extraction_failed", pdf_path=pdf_path, error=str(e))
        raise


def extract_text(pdf_path: str, pdf_type: str) -> ExtractionResult:
    """
    Route to correct extraction method based on PDF type.
    Entry point called by the processing pipeline.
    """
    if pdf_type == "digital":
        return extract_text_digital(pdf_path)
    else:
        return extract_text_scanned(pdf_path)
