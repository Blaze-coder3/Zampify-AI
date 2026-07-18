from fastapi import HTTPException, status


class ZampifyException(Exception):
    """Base exception for all Zampify errors."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class InvoiceNotFound(ZampifyException):
    def __init__(self, invoice_id: str):
        super().__init__(f"Invoice {invoice_id} not found", status_code=404)


class VendorNotFound(ZampifyException):
    def __init__(self, vendor_id: str):
        super().__init__(f"Vendor {vendor_id} not found", status_code=404)


class PONotFound(ZampifyException):
    def __init__(self, po_number: str):
        super().__init__(f"Purchase Order {po_number} not found", status_code=404)


class InvalidFileType(ZampifyException):
    def __init__(self):
        super().__init__("Only PDF files are accepted", status_code=422)


class FileTooLarge(ZampifyException):
    def __init__(self, max_mb: int):
        super().__init__(f"File exceeds maximum size of {max_mb}MB", status_code=413)


class OCRExtractionFailed(ZampifyException):
    def __init__(self, reason: str):
        super().__init__(f"OCR extraction failed: {reason}", status_code=500)


class LLMExtractionFailed(ZampifyException):
    def __init__(self, reason: str):
        super().__init__(f"LLM extraction failed: {reason}", status_code=500)


class ProcessingError(ZampifyException):
    def __init__(self, stage: str, reason: str):
        super().__init__(f"Processing failed at stage '{stage}': {reason}", status_code=500)
