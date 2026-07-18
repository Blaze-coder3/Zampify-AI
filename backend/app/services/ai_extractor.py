"""
AI Extraction Agent — The first and primary LLM call in the pipeline.

Uses FeatherlessAI (OpenAI-compatible API) to parse raw invoice text
into structured JSON with per-field confidence scores.

This is one of only TWO places in the system where AI is used.
All other validation is deterministic.
"""

import json
import re
from dataclasses import dataclass, field
from typing import Optional
from openai import AsyncOpenAI
from app.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# FeatherlessAI client (OpenAI-compatible)
client = AsyncOpenAI(
    api_key=settings.FEATHERLESS_API_KEY,
    base_url=settings.FEATHERLESS_BASE_URL,
)

EXTRACTION_SYSTEM_PROMPT = """You are a financial document parser for an Accounts Payable department.
Your task is to extract structured data from invoice text.
You must be precise, conservative, and indicate confidence for each field.

CRITICAL RULES:
1. Extract ONLY what is explicitly stated in the text
2. If a field is ambiguous or missing, set its value to null and confidence to 0
3. Confidence scores: 100 = clearly stated, 70-99 = inferred with context, <70 = uncertain
4. Dates MUST be in ISO 8601 format: YYYY-MM-DD
5. All monetary values must be numbers (float) with 2 decimal places
6. Currency must be 3-letter ISO 4217 code (USD, EUR, GBP, AED, PKR, etc.)
7. Return ONLY valid JSON. No markdown, no explanation text.
8. Provide bounding box coordinates [x_min, y_min, x_max, y_max] for all fields. If unknown, return [0,0,0,0].

OUTPUT SCHEMA (return exactly this structure):
{
  "invoice_number": {"value": "<string or null>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "invoice_date": {"value": "<YYYY-MM-DD or null>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "due_date": {"value": "<YYYY-MM-DD or null>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "vendor_name": {"value": "<string or null>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "vendor_address": {"value": "<string or null>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "bank_account_number": {"value": "<string or null>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "routing_number": {"value": "<string or null>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "currency": {"value": "<3-letter code or null>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "po_number": {"value": "<string or null>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "line_items": [
    {
      "description": {"value": "<string>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
      "quantity": {"value": <float or null>, "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
      "unit_price": {"value": <float or null>, "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
      "total": {"value": <float or null>, "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]}
    }
  ],
  "subtotal": {"value": <float or null>, "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "tax_amount": {"value": <float or null>, "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "tax_rate": {"value": <float or null>, "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "shipping": {"value": <float or null>, "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "grand_total": {"value": <float or null>, "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "payment_terms": {"value": "<string or null>", "confidence": <0-100>, "bounding_box": [<int>,<int>,<int>,<int>]},
  "line_items_bundled": <true if only 1 generic line item, false otherwise>
}"""


@dataclass
class ExtractionAgentResult:
    extracted_data: dict
    field_confidences: dict
    extraction_confidence: float  # Mean of all field confidence scores
    line_items_bundled: bool = False
    raw_response: str = ""


def _compute_extraction_confidence(extracted: dict) -> tuple[dict, float]:
    """
    Compute mean field confidence from LLM output.
    Null values count as 0 — conservative by design.
    """
    confidences = {}
    scores = []

    scalar_fields = [
        "invoice_number", "invoice_date", "due_date", "vendor_name",
        "vendor_tax_id", "currency", "po_number", "subtotal",
        "tax_amount", "grand_total", "payment_terms",
        "bank_account_number", "routing_number"
    ]

    for f in scalar_fields:
        if f in extracted and isinstance(extracted[f], dict):
            conf = extracted[f].get("confidence", 0)
            val = extracted[f].get("value")
            if val is None:
                conf = 0  # Missing critical field → 0 confidence
            confidences[f] = conf
            scores.append(conf)

    # Line items confidence = mean of all line item totals
    line_items = extracted.get("line_items", [])
    if line_items:
        li_confs = [
            li.get("total", {}).get("confidence", 0)
            for li in line_items
            if isinstance(li, dict)
        ]
        if li_confs:
            li_mean = sum(li_confs) / len(li_confs)
            confidences["line_items"] = li_mean
            scores.append(li_mean)

    mean_confidence = sum(scores) / len(scores) if scores else 0.0
    return confidences, round(mean_confidence, 2)


async def extract_invoice_data(raw_text: str, invoice_id: str) -> ExtractionAgentResult:
    """
    Call FeatherlessAI to extract structured invoice data from raw text.

    Retry logic:
    - Attempt 1: Primary model
    - On failure: Log and raise (worker handles retry with backoff)
    """
    logger.info("ai_extraction_started", invoice_id=invoice_id, text_length=len(raw_text))

    try:
        try:
            response = await client.chat.completions.create(
                model=settings.FEATHERLESS_MODEL,
                messages=[
                    {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                    {"role": "user", "content": f"INVOICE TEXT:\n{raw_text}"},
                ],
                temperature=0.0,
                max_tokens=4096,
            )
        except Exception as primary_e:
            logger.warning(f"Primary model {settings.FEATHERLESS_MODEL} failed ({str(primary_e)}). Falling back to Qwen/Qwen2.5-72B-Instruct.")
            response = await client.chat.completions.create(
                model="Qwen/Qwen2.5-72B-Instruct",
                messages=[
                    {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                    {"role": "user", "content": f"INVOICE TEXT:\n{raw_text}"},
                ],
                temperature=0.0,
                max_tokens=4096,
            )

        raw_response = response.choices[0].message.content
        logger.debug("llm_response_received", invoice_id=invoice_id, response_length=len(raw_response))

        # Parse JSON — strip markdown code blocks if present
        json_text = raw_response.strip()
        if json_text.startswith("```"):
            json_text = re.sub(r"```(?:json)?\n?", "", json_text).strip()

        extracted = json.loads(json_text)
        field_confidences, extraction_confidence = _compute_extraction_confidence(extracted)
        line_items_bundled = extracted.get("line_items_bundled", False)

        logger.info(
            "ai_extraction_complete",
            invoice_id=invoice_id,
            extraction_confidence=extraction_confidence,
            line_items_bundled=line_items_bundled,
        )

        return ExtractionAgentResult(
            extracted_data=extracted,
            field_confidences=field_confidences,
            extraction_confidence=extraction_confidence,
            line_items_bundled=line_items_bundled,
            raw_response=raw_response,
        )

    except json.JSONDecodeError as e:
        logger.error("llm_json_parse_failed", invoice_id=invoice_id, error=str(e))
        raise
    except Exception as e:
        logger.error("ai_extraction_failed", invoice_id=invoice_id, error=str(e))
        raise
