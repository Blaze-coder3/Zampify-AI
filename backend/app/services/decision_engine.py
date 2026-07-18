"""
Decision Engine + Evidence Collector + Explanation Agent.

Stage 1 — Decision Engine (No AI): Evaluates all validation results deterministically.
Stage 2 — Evidence Collector (No AI): Builds structured evidence from rule results.
Stage 3 — Explanation Agent (AI): Narrates the evidence into human-readable text.

This is the second and final LLM call in the entire pipeline.
"""

import json
from dataclasses import dataclass, field
from typing import Optional
from openai import AsyncOpenAI
from app.config import settings
from app.services.validation_engine import ValidationSummary, RuleResult
from app.core.logging import get_logger

logger = get_logger(__name__)

client = AsyncOpenAI(
    api_key=settings.FEATHERLESS_API_KEY,
    base_url=settings.FEATHERLESS_BASE_URL,
)

EXPLANATION_SYSTEM_PROMPT = """You are a financial decision narrator for an Accounts Payable team.
Given structured validation evidence, write a clear, professional 2-3 sentence explanation.

CRITICAL RULES:
1. You may ONLY reference data from the provided evidence. Do not invent facts.
2. State the decision clearly in the first sentence.
3. Cite the specific evidence that drove the decision.
4. If there are warnings, mention them.
5. Use professional AP/finance language.
6. Maximum 3 sentences. Be concise.
7. Return ONLY the explanation text — no JSON, no markdown."""


@dataclass
class DecisionResult:
    decision: str  # "approved" | "needs_review" | "rejected"
    confidence: float
    confidence_breakdown: dict
    explanation: str
    evidence: list[dict]
    triggered_rules: list[str]
    review_required: bool
    policy_version: str


def _build_evidence(results: list[RuleResult]) -> list[dict]:
    """Stage 2: Build structured evidence array from rule results."""
    evidence = []
    for r in results:
        evidence.append({
            "rule_id": r.rule_id,
            "rule_name": r.rule_name,
            "status": r.status,
            "finding": r.reason,
            "severity": r.severity,
        })
    return evidence


def compute_overall_confidence(
    ocr_confidence: float,
    extraction_confidence: float,
    vendor_match_confidence: float,
    po_match_confidence: float,
    rules_confidence: float,
) -> tuple[float, dict]:
    """
    Compute the overall confidence as a weighted average.
    Weights reflect financial risk impact of each stage.
    This is computed — not hallucinated.
    """
    weights = {
        "ocr": 0.15,
        "extraction": 0.30,
        "vendor_match": 0.15,
        "po_match": 0.25,
        "rules": 0.15,
    }

    overall = (
        ocr_confidence * weights["ocr"]
        + extraction_confidence * weights["extraction"]
        + vendor_match_confidence * weights["vendor_match"]
        + po_match_confidence * weights["po_match"]
        + rules_confidence * weights["rules"]
    )

    breakdown = {
        "ocr": round(ocr_confidence, 2),
        "extraction": round(extraction_confidence, 2),
        "vendor_match": round(vendor_match_confidence, 2),
        "po_match": round(po_match_confidence, 2),
        "rules": round(rules_confidence, 2),
    }

    return round(overall, 2), breakdown


def make_decision(
    validation_summary: ValidationSummary,
    invoice_total: Optional[float],
    auto_approval_limit: float = 5000.0,
) -> tuple[str, bool]:
    """
    Stage 1 — Pure deterministic decision. No AI.

    REJECTED if: any CRITICAL validation fails
    NEEDS_REVIEW if: any WARNING exists OR amount exceeds auto-approval limit
    APPROVED if: all validations pass AND amount ≤ auto-approval limit
    """
    if validation_summary.has_critical_failures:
        return "rejected", False

    if validation_summary.has_warnings:
        return "needs_review", True

    if invoice_total and invoice_total > auto_approval_limit:
        return "needs_review", True

    return "approved", False


async def generate_explanation(
    evidence: list[dict],
    decision: str,
    confidence: float,
    policy_version: str,
) -> str:
    """
    Stage 3 — Explanation Agent (LLM).
    Narrates the structured evidence. Cannot hallucinate — constrained to evidence array.
    """
    evidence_json = json.dumps(evidence, indent=2)
    user_prompt = f"""DECISION: {decision.upper()}
CONFIDENCE: {confidence:.1f}%
POLICY VERSION: {policy_version}

EVIDENCE:
{evidence_json}

Write a 2-3 sentence professional explanation of this decision."""

    try:
        response = await client.chat.completions.create(
            model=settings.FEATHERLESS_MODEL,
            messages=[
                {"role": "system", "content": EXPLANATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.1,
            max_tokens=300,
        )
        explanation = response.choices[0].message.content.strip()
        logger.info("explanation_generated", decision=decision, length=len(explanation))
        return explanation
    except Exception as e:
        logger.error("explanation_generation_failed", error=str(e))
        # Graceful fallback — construct from evidence without AI
        passing = [e["finding"] for e in evidence if e["status"] == "pass"]
        failing = [e["finding"] for e in evidence if e["status"] in ("fail", "warning")]
        fallback = f"Decision: {decision.upper()} (confidence: {confidence:.1f}%). "
        if passing:
            fallback += f"Passed: {'; '.join(passing[:3])}. "
        if failing:
            fallback += f"Issues: {'; '.join(failing[:2])}."
        return fallback


async def run_decision_pipeline(
    validation_summary: ValidationSummary,
    extracted_data: dict,
    ocr_confidence: float,
    extraction_confidence: float,
    policy: dict,
    policy_version: str,
) -> DecisionResult:
    """
    Orchestrates all three stages of the decision pipeline.
    Called by the processing worker after validation completes.
    """
    invoice_total_data = extracted_data.get("grand_total", {})
    invoice_total = invoice_total_data.get("value") if isinstance(invoice_total_data, dict) else None

    auto_approval_limit = policy.get("company_policy", {}).get("max_auto_approval_amount", 5000.0)

    # Stage 1: Make decision
    decision, review_required = make_decision(validation_summary, invoice_total, auto_approval_limit)

    # Stage 2: Collect evidence
    evidence = _build_evidence(validation_summary.results)

    # Compute confidence components
    vendor_match_rule = next(
        (r for r in validation_summary.results if r.rule_id == "BR-001"), None
    )
    po_match_rule = next(
        (r for r in validation_summary.results if r.rule_id == "BR-003"), None
    )
    vendor_match_confidence = vendor_match_rule.confidence_contribution if vendor_match_rule else 0.0
    po_match_confidence = po_match_rule.confidence_contribution if po_match_rule else 0.0

    overall_confidence, breakdown = compute_overall_confidence(
        ocr_confidence=ocr_confidence,
        extraction_confidence=extraction_confidence,
        vendor_match_confidence=vendor_match_confidence,
        po_match_confidence=po_match_confidence,
        rules_confidence=validation_summary.rules_confidence,
    )

    triggered_rules = [r.rule_id for r in validation_summary.results if r.status != "pass"]

    # Stage 3: Generate explanation
    explanation = await generate_explanation(evidence, decision, overall_confidence, policy_version)

    logger.info(
        "decision_pipeline_complete",
        decision=decision,
        confidence=overall_confidence,
        triggered_rules=triggered_rules,
    )

    return DecisionResult(
        decision=decision,
        confidence=overall_confidence,
        confidence_breakdown=breakdown,
        explanation=explanation,
        evidence=evidence,
        triggered_rules=triggered_rules,
        review_required=review_required,
        policy_version=policy_version,
    )
