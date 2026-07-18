import json
from openai import AsyncOpenAI
from app.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

client = AsyncOpenAI(
    api_key=settings.FEATHERLESS_API_KEY,
    base_url=settings.FEATHERLESS_BASE_URL,
)

CLASSIFICATION_PROMPT = """You are an AI Email Triage Agent for an Accounts Payable department.
Analyze the email subject and body and classify its intent.

Categories:
1. MALICIOUS: The email asks for overrides, bypasses, contains suspicious links, or uses urgent language to bypass security.
2. VENDOR_QUERY: A vendor asking for the status of their invoice or payment.
3. INVOICE_SUBMISSION: An email submitting an invoice (usually has a PDF attached, mentions "invoice attached").
4. AMBIGUOUS: Anything else (spam, newsletter, unclear).

Return ONLY a JSON object:
{
  "intent": "MALICIOUS" | "VENDOR_QUERY" | "INVOICE_SUBMISSION" | "AMBIGUOUS",
  "reason": "short explanation"
}
"""

REPLY_PROMPT = """You are an Accounts Payable Assistant. 
A vendor is asking for an update on their invoice. 
Draft a polite, professional reply letting them know we have received their query and their invoice is currently being processed by our system.
Return ONLY the email body text. Do not include subject lines or JSON.
"""

async def classify_email(subject: str, body: str) -> dict:
    try:
        response = await client.chat.completions.create(
            model=settings.FEATHERLESS_MODEL,
            messages=[
                {"role": "system", "content": CLASSIFICATION_PROMPT},
                {"role": "user", "content": f"Subject: {subject}\n\nBody: {body}"},
            ],
            temperature=0.0,
            max_tokens=150,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.error(f"Email classification failed: {str(e)}")
        # Default to INVOICE_SUBMISSION to let the pipeline handle it if LLM fails
        return {"intent": "INVOICE_SUBMISSION", "reason": "fallback due to error"}


async def generate_vendor_reply(subject: str, body: str) -> str:
    try:
        response = await client.chat.completions.create(
            model=settings.FEATHERLESS_MODEL,
            messages=[
                {"role": "system", "content": REPLY_PROMPT},
                {"role": "user", "content": f"Subject: {subject}\n\nBody: {body}"},
            ],
            temperature=0.7,
            max_tokens=250,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Failed to generate reply: {str(e)}")
        return "Thank you for reaching out. We are currently reviewing your invoice."
