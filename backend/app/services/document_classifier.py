"""
Document Classification Service — Deterministic, no AI.

Determines whether a PDF is digital (text-extractable) or
scanned (image-based), routing to the appropriate OCR path.
"""

import fitz  # PyMuPDF
import tempfile
import os
from dataclasses import dataclass
from app.core.logging import get_logger
try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

logger = get_logger(__name__)


@dataclass
class ClassificationResult:
    pdf_type: str  # "digital" | "scanned"
    page_count: int
    text_length: int
    confidence: float


def classify_pdf(pdf_path: str) -> ClassificationResult:
    """
    Classify a PDF as digital or scanned.
    """
    try:
        doc = fitz.open(pdf_path)
        page_count = len(doc)
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        doc.close()

        text_length = len(full_text.strip())
        is_digital = text_length > 100

        result = ClassificationResult(
            pdf_type="digital" if is_digital else "scanned",
            page_count=page_count,
            text_length=text_length,
            confidence=95.0 if is_digital else 0.0,
        )

        logger.info(
            "pdf_classified",
            pdf_path=pdf_path,
            pdf_type=result.pdf_type,
            page_count=result.page_count,
            text_length=result.text_length,
        )
        return result

    except Exception as e:
        logger.error("pdf_classification_failed", pdf_path=pdf_path, error=str(e))
        raise
